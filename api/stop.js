// Vercel Serverless Function: api/stop.js
// Handles bus stop search by description/road name and bus stop metadata lookup

export default async function handler(req, res) {
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

  // Parse query parameters
  let queryQ = '';
  let busStopCode = '';

  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    queryQ = parsedUrl.searchParams.get('q') || '';
    busStopCode = parsedUrl.searchParams.get('BusStopCode') || parsedUrl.searchParams.get('busStopCode') || '';
  } catch (_) {
    if (req.query?.q) queryQ = req.query.q;
    if (req.query?.BusStopCode) busStopCode = req.query.BusStopCode;
    else if (req.query?.busStopCode) busStopCode = req.query.busStopCode;
  }

  // Case 1: Search by description or road name (?q=...)
  if (queryQ || req.url.includes('?q=') || req.url.includes('&q=')) {
    const trimmed = queryQ.trim();
    if (!trimmed) {
      return res.status(200).json({ stops: [] });
    }

    try {
      const upstreamRes = await fetch(
        `https://catchmybusnew.vercel.app/api/stop?q=${encodeURIComponent(trimmed)}`,
        { headers: { accept: 'application/json' } }
      );
      if (upstreamRes.ok) {
        const data = await upstreamRes.json();
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).json(data);
      }
    } catch (err) {
      // Fallback to local search if upstream unreachable
    }

    // Local fallback matching
    const qLower = trimmed.toLowerCase();
    const fallbackStops = [
      { stopCode: '04121', description: 'Bras Basah Green', roadName: 'Bras Basah Rd' },
      { stopCode: '08057', description: 'Dhoby Ghaut Stn', roadName: 'Orchard Rd' },
      { stopCode: '09048', description: 'Orchard Stn / Lucky Plaza', roadName: 'Orchard Rd' },
      { stopCode: '08041', description: 'YMCA', roadName: 'Orchard Rd' },
      { stopCode: '08058', description: 'Aft Dhoby Ghaut Stn', roadName: 'Orchard Rd' },
      { stopCode: '08137', description: 'Orchard Plaza', roadName: 'Orchard Rd' },
      { stopCode: '08138', description: "Concorde Hotel S'pore", roadName: 'Orchard Rd' },
      { stopCode: '09011', description: 'Opp Ngee Ann City', roadName: 'Orchard Turn' },
      { stopCode: '09022', description: 'Orchard Stn Exit 13', roadName: 'Orchard Blvd' },
      { stopCode: '09023', description: 'Opp Orchard Stn/ION', roadName: 'Orchard Turn' },
      { stopCode: '09037', description: 'Bef Cairnhill Rd', roadName: 'Orchard Rd' },
      { stopCode: '09038', description: 'Opp Somerset Stn', roadName: 'Orchard Rd' },
      { stopCode: '09047', description: 'Orchard Stn/Tang Plaza', roadName: 'Orchard Rd' },
      { stopCode: '01019', description: 'Bras Basah Cplx', roadName: 'Victoria St' },
      { stopCode: '01039', description: 'Bugis Cube', roadName: 'Nth Bridge Rd' },
      { stopCode: '01112', description: 'Bugis Stn Exit A', roadName: 'Victoria St' },
      { stopCode: '01119', description: 'Aft Bugis Stn Exit C', roadName: 'Victoria St' },
      { stopCode: '03019', description: 'Opp The Treasury', roadName: 'North Bridge Rd' },
      { stopCode: '03211', description: 'Opp OCBC Ctr', roadName: 'South Bridge Rd' },
      { stopCode: '03541', description: 'Marina Bay Sands MICE', roadName: 'Bayfront Ave' },
      { stopCode: '05013', description: 'Chinatown Stn Exit C', roadName: 'Eu Tong Sen St' },
      { stopCode: '14141', description: 'VivoCity', roadName: 'Telok Blangah Rd' },
      { stopCode: '17009', description: 'Clementi Int', roadName: 'Clementi Ave 3' },
      { stopCode: '28009', description: 'Jurong East Int', roadName: 'Jurong Gateway Rd' },
      { stopCode: '75009', description: 'Tampines Int', roadName: 'Tampines Ctrl 1' },
    ];

    const matched = fallbackStops.filter(
      (s) =>
        s.stopCode.includes(qLower) ||
        s.description.toLowerCase().includes(qLower) ||
        s.roadName.toLowerCase().includes(qLower)
    );

    return res.status(200).json({ stops: matched });
  }

  // Case 2: Bus stop metadata lookup by code (?BusStopCode=...)
  if (busStopCode) {
    const code = busStopCode.trim();
    if (!/^\d{5}$/.test(code)) {
      return res.status(400).send('Bus stop code must be 5 digits.');
    }

    try {
      const upstreamRes = await fetch(
        `https://catchmybusnew.vercel.app/api/stop?BusStopCode=${encodeURIComponent(code)}`,
        { headers: { accept: 'application/json' } }
      );
      if (upstreamRes.ok) {
        const data = await upstreamRes.json();
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
        return res.status(200).json(data);
      }
    } catch (err) {
      // Fallback
    }

    return res.status(200).json({
      stopCode: code,
      description: `Bus Stop ${code}`,
      roadName: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      nearby: []
    });
  }

  return res.status(400).send('Bus stop code must be 5 digits.');
}
