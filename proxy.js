// proxy.js — proxy mínimo para Darwin Core Viewer
// Uso: node proxy.js
// Requiere: npm install express node-fetch cors

const express  = require('express');
const fetch    = require('node-fetch');
const cors     = require('cors');

const app  = express();
const PORT = 3000;

app.use(cors());  // permite requests desde cualquier origen (el browser)

app.get('/proxy', async (req, res) => {
  const target = req.query.url;

  if (!target) {
    return res.status(400).json({ error: 'Falta el parámetro ?url=' });
  }

  // Validación básica: solo permite dominios IPT conocidos
  // Quita esto si quieres que sea completamente abierto
  const allowed = [
    'ipt.biodiversidad.co',
    'ipt.sibcolombia.net',
    'ipt.gbif.org',
    // agrega los IPT que necesites
  ];
  const host = new URL(target).hostname;
  if (!allowed.some(d => host.endsWith(d))) {
    return res.status(403).json({ error: `Host no permitido: ${host}` });
  }

  try {
    console.log(`[proxy] → ${target}`);
    const upstream = await fetch(target, {
      headers: {
        'User-Agent': 'DwCA-Viewer/1.0 (darwin-core-viewer)',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    // Forward headers útiles
    const ct = upstream.headers.get('content-type');
    const cl = upstream.headers.get('content-length');
    if (ct) res.setHeader('Content-Type', ct);
    if (cl) res.setHeader('Content-Length', cl);

    // Stream directamente al cliente
    upstream.body.pipe(res);

  } catch (err) {
    console.error('[proxy] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅  Proxy corriendo en http://localhost:${PORT}/proxy?url=...`);
});
