// Aura Music Internal Lyrics API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { songId, id } = req.query;
  const rawId = songId || id;

  if (!rawId) {
    return res.status(400).json({ error: 'Missing songId parameter' });
  }

  const cleanId = String(Array.isArray(rawId) ? rawId[0] : rawId).replace(
    /^(aura_song_|song_|saavn_)/,
    ''
  );
  const targetUrl = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&_format=json&_marker=0&api_version=4&ctx=android&lyrics_id=${cleanId}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,ta;q=0.8,hi;q=0.7',
        Referer: 'https://www.jiosaavn.com/',
        Origin: 'https://www.jiosaavn.com'
      }
    });

    const data = await response.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(response.status).send(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
