// frontend/pages/api/summarize.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const body = req.body
  try {
    const backendUrl = process.env.PY_API_URL || 'http://localhost:8000'
    console.log(process.env.PY_API_URL)
    const r = await fetch(`${backendUrl}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
