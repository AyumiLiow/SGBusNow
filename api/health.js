// Vercel Serverless Function: api/health.js
// Reports key configuration status and upstream connectivity without exposing credentials

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

  // 1. Check if credential is configured
  const key = process.env.LTA_ACCOUNT_KEY;
  const keyConfigured = Boolean(key && key !== 'undefined' && key.trim() !== '');

  // BEFORE the fetch, if process.env.LTA_ACCOUNT_KEY is missing or empty, return 503
  // with {"error":"LTA_ACCOUNT_KEY is not set. Add it in Vercel and redeploy."} and do not call the upstream at all.
  if (!keyConfigured) {
    return res.status(503).json({
      error: 'LTA_ACCOUNT_KEY is not set. Add it in Vercel and redeploy.',
      variable: 'LTA_ACCOUNT_KEY',
      keyConfigured: false,
      upstreamAnswered: false,
      upstreamStatus: null
    });
  }

  // 2. Call upstream to test connectivity (never exposing credentials)
  let upstreamResponse;
  try {
    upstreamResponse = await fetch('https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121', {
      method: 'GET',
      headers: {
        AccountKey: key,
        accept: 'application/json',
      },
    });
  } catch (networkErr) {
    return res.status(502).json({
      error: 'Upstream service is unreachable',
      keyConfigured: true,
      upstreamAnswered: false,
      upstreamStatus: null,
      reason: 'Failed to establish connection to Singapore LTA DataMall service'
    });
  }

  // AFTER the fetch, check response.ok before reading the body.
  // On a non-2xx reply, return the upstream status and a one-line reason in your own JSON.
  if (!upstreamResponse.ok) {
    return res.status(upstreamResponse.status).json({
      error: 'Upstream refused request',
      keyConfigured: true,
      upstreamAnswered: true,
      upstreamStatus: upstreamResponse.status,
      reason: `Upstream returned HTTP status ${upstreamResponse.status}: ${upstreamResponse.statusText || 'Request rejected by upstream'}`.trim()
    });
  }

  return res.status(200).json({
    status: 'ok',
    keyConfigured: true,
    upstreamAnswered: true,
    upstreamStatus: upstreamResponse.status
  });
}
