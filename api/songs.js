// Aura Music Internal Songs API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q, limit = 30, url } = req.query;

  let targetUrl = url;
  if (!targetUrl && q) {
    targetUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=android&q=${encodeURIComponent(
      Array.isArray(q) ? q[0] : q
    )}&n=${Array.isArray(limit) ? limit[0] : limit}&p=1`;
  }

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing query (q) or url parameter' });
  }

  try {
    const finalUrl = Array.isArray(targetUrl) ? targetUrl[0] : targetUrl;
    const response = await fetch(finalUrl, {
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
