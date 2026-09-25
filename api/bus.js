// Vercel Serverless Function: api/bus.js
// Fetches live bus arrival timings from Singapore LTA DataMall v3 API

export default async function handler(req, res) {
  // Ensure response helper methods exist (for local Vite dev middleware)
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

  // BEFORE the fetch, if process.env.LTA_ACCOUNT_KEY is missing or empty,
  // return 503 with {"error":"LTA_ACCOUNT_KEY is not set. Add it in Vercel and redeploy."}
  // and do not call the upstream at all.
  const key = process.env.LTA_ACCOUNT_KEY;
  if (!key || key === 'undefined' || key.trim() === '') {
    return res.status(503).json({
      error: 'LTA_ACCOUNT_KEY is not set. Add it in Vercel and redeploy.'
    });
  }

  // Parse BusStopCode query parameter (default 04121)
  let busStopCode = '04121';
  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    busStopCode = parsedUrl.searchParams.get('BusStopCode') || parsedUrl.searchParams.get('busStopCode') || '04121';
  } catch (_) {
    if (req.query?.BusStopCode) busStopCode = req.query.BusStopCode;
    else if (req.query?.busStopCode) busStopCode = req.query.busStopCode;
  }

  const upstreamUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;

  // Upstream network request with error handling
  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        AccountKey: key,
        accept: 'application/json',
      },
    });
  } catch (networkErr) {
    return res.status(502).json({
      error: 'Upstream service unreachable',
      upstreamStatus: null,
      reason: 'Failed to establish connection to Singapore LTA DataMall service'
    });
  }

  // AFTER the fetch, check response.ok before reading the body.
  // On a non-2xx reply, return the upstream status and a one-line reason in your own JSON.
  if (!upstreamResponse.ok) {
    return res.status(upstreamResponse.status).json({
      error: 'Upstream refused request',
      upstreamStatus: upstreamResponse.status,
      reason: `Upstream returned HTTP status ${upstreamResponse.status}: ${upstreamResponse.statusText || 'Request rejected by upstream'}`.trim()
    });
  }

  // Parse response body safely
  let rawData;
  try {
    rawData = await upstreamResponse.json();
  } catch (parseErr) {
    return res.status(502).json({
      error: 'Invalid response from upstream',
      upstreamStatus: upstreamResponse.status,
      reason: 'Upstream returned non-JSON payload'
    });
  }

  // Helper to calculate minutes until arrival from EstimatedArrival timestamp.
  // Never emit NaN or null as a minute. Omit if empty or missing.
  const parseBus = (bus) => {
    if (!bus || !bus.EstimatedArrival || typeof bus.EstimatedArrival !== 'string' || bus.EstimatedArrival.trim() === '') {
      return undefined;
    }
    const arrivalTime = new Date(bus.EstimatedArrival).getTime();
    if (isNaN(arrivalTime)) {
      return undefined;
    }
    const diffMinutes = Math.round((arrivalTime - Date.now()) / 60000);
    const minutes = Math.max(0, diffMinutes);
    if (isNaN(minutes) || !isFinite(minutes)) {
      return undefined;
    }
    return {
      minutes,
      load: bus.Load === 'LSD' ? 'LSD' : bus.Load === 'SDA' ? 'SDA' : 'SEA',
      type: bus.Type === 'DD' ? 'DD' : bus.Type === 'BD' ? 'BD' : 'SD'
    };
  };

  // Treat an empty Services array as "no buses running", not an error.
  // LTA returns NextBus2 and NextBus3 with empty strings when there is no such bus:
  // treat an empty EstimatedArrival as no bus and omit it.
  const rawServices = Array.isArray(rawData?.Services) ? rawData.Services : [];
  const services = rawServices.map((srv) => {
    const item = {
      ServiceNo: srv.ServiceNo || ''
    };
    const nextBus = parseBus(srv.NextBus);
    if (nextBus) {
      item.nextBus = nextBus;
    }
    const nextBus2 = parseBus(srv.NextBus2);
    if (nextBus2) {
      item.nextBus2 = nextBus2;
    }
    return item;
  });

  // Cache-Control: s-maxage=20, stale-while-revalidate=40 on the bus response
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');

  return res.status(200).json({
    BusStopCode: busStopCode,
    Services: services
  });
}
