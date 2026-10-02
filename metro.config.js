const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const originalEnhanceMiddleware = config.server?.enhanceMiddleware;

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware, server) => {
    const defaultMiddleware = originalEnhanceMiddleware
      ? originalEnhanceMiddleware(metroMiddleware, server)
      : metroMiddleware;

    return async (req, res, next) => {
      // CORS proxy for JioSaavn or external music APIs that lack browser CORS headers
      if (req.url && (req.url.startsWith('/api/saavn-proxy') || req.url.includes('/api/saavn-proxy'))) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        try {
          const parsed = new URL(req.url, 'http://localhost:8081');
          const targetUrl = parsed.searchParams.get('url');

          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing target url parameter' }));
            return;
          }

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
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(data);
          return;
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
          return;
        }
      }

      return defaultMiddleware(req, res, next);
    };
  }
};

module.exports = config;
