// Vercel Serverless Function: api/bus-arrival.js
// Fetches live bus arrival timings from Singapore LTA DataMall v3 API

export default async function handler(req, res) {
  // Ensure res helper methods exist (for environments like Vite middleware)
  if (!res.status) {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }

  // 1. Guardrail: Verify credential is configured before calling upstream
  const key = process.env.LTA_ACCOUNT_KEY;
  if (!key || key === 'undefined' || key.trim() === '') {
    return res.status(503).json({
      error: 'LTA_ACCOUNT_KEY is not configured',
      variable: 'LTA_ACCOUNT_KEY',
      message: 'Environment variable LTA_ACCOUNT_KEY is missing or empty. Please set LTA_ACCOUNT_KEY in your deployment environment.'
    });
  }

  // 2. Parse BusStopCode query parameter (default to 04121 as per specification)
  let busStopCode = '04121';
  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    busStopCode = parsedUrl.searchParams.get('BusStopCode') || parsedUrl.searchParams.get('busStopCode') || '04121';
  } catch (_) {
    // fallback if req.url is not a full URL
    if (req.query?.BusStopCode) busStopCode = req.query.BusStopCode;
    else if (req.query?.busStopCode) busStopCode = req.query.busStopCode;
  }

  const upstreamUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;

  // 3. Call upstream with network error handling
  let upstreamRes;
  try {
    upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        AccountKey: key,
        accept: 'application/json',
      },
    });
  } catch (networkErr) {
    // Upstream is unreachable
    return res.status(502).json({
      error: 'Upstream service unreachable',
      upstreamStatus: null,
      reason: 'Failed to establish connection to Singapore LTA DataMall service'
    });
  }

  // 4. Inspect upstream HTTP response status before parsing body
  if (!upstreamRes.ok) {
    let errorSummary = '';
    try {
      errorSummary = await upstreamRes.text();
    } catch (_) {}

    return res.status(upstreamRes.status).json({
      error: 'Upstream refused request',
      upstreamStatus: upstreamRes.status,
      reason: `Upstream returned status ${upstreamRes.status}: ${upstreamRes.statusText || errorSummary || 'Request rejected by upstream'}`.trim()
    });
  }

  // 5. Parse response body safely
  let rawData;
  try {
    rawData = await upstreamRes.json();
  } catch (parseErr) {
    return res.status(502).json({
      error: 'Invalid response from upstream',
      upstreamStatus: upstreamRes.status,
      reason: 'Upstream returned non-JSON payload'
    });
  }

  // Helper to calculate seconds until arrival from ISO string
  const calculateSeconds = (arrivalStr) => {
    if (!arrivalStr) return -1;
    const arrivalTime = new Date(arrivalStr).getTime();
    if (isNaN(arrivalTime)) return -1;
    const diffSec = Math.round((arrivalTime - Date.now()) / 1000);
    return Math.max(0, diffSec);
  };

  // Helper to format arrival object with only the fields our screen needs
  const formatArrival = (bus) => {
    if (!bus || !bus.EstimatedArrival) {
      return {
        seconds: -1,
        load: 'SEA',
        type: 'SD',
        wheelchair: false,
      };
    }
    return {
      seconds: calculateSeconds(bus.EstimatedArrival),
      load: bus.Load === 'LSD' ? 'LSD' : bus.Load === 'SDA' ? 'SDA' : 'SEA',
      type: bus.Type === 'DD' ? 'DD' : bus.Type === 'BD' ? 'BD' : 'SD',
      wheelchair: bus.Feature === 'WAB',
    };
  };

  // 6. Return ONLY the fields the screen needs, stripped of odata.metadata and raw coordinates
  const services = Array.isArray(rawData?.Services)
    ? rawData.Services.map((srv) => ({
        serviceNo: srv.ServiceNo || '',
        operator: srv.Operator || 'SBST',
        nextBus: formatArrival(srv.NextBus),
        nextBus2: formatArrival(srv.NextBus2),
        ...(srv.NextBus3 ? { nextBus3: formatArrival(srv.NextBus3) } : {})
      }))
    : [];

  // Cache response for 30s with stale-while-revalidate for 60s
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  return res.status(200).json({
    busStopCode,
    services,
  });
}
