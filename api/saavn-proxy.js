// Vercel Serverless Function to proxy JioSaavn requests and bypass browser CORS restrictions
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing target url parameter' });
  }

  try {
    const targetUrl = Array.isArray(url) ? url[0] : url;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,ta;q=0.8,hi;q=0.7',
        Referer: 'https://www.jiosaavn.com/',
        Origin: 'https://www.jiosaavn.com',
        Cookie:
          'L=tamil%2Chindi%2Cenglish%2Ctelugu%2Cpunjabi%2Cmalayalam%2Ckannada%2Cmarathi%2Cbengali%2Cgujarati;'
      }
    });

    const data = await response.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(response.status).send(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
