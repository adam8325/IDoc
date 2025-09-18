// pages/api/queryContext.js
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, contextInfo, filename } = req.body;

  // Build payload for backend
  const payload = {
    input,
    contextInfo,
    filename
  };

  const backendUrl = process.env.PY_API_URL || "http://localhost:8000";

  // Call backend endpoint
  const backendRes = await fetch(`${backendUrl}/queryContext`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await backendRes.json();
  res.status(backendRes.status).json(data);
}
