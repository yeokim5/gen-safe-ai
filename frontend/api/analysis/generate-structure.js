// Vercel API route that proxies requests to Railway backend
export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const BACKEND_URL = process.env.VITE_API_URL || 'https://gen-safe-ai-production.up.railway.app';
    
    console.log('Proxying request to:', `${BACKEND_URL}/api/analysis/generate-structure`);
    
    // Forward the request to Railway backend
    const response = await fetch(`${BACKEND_URL}/api/analysis/generate-structure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward relevant headers
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        ...(req.headers['user-agent'] && { 'User-Agent': req.headers['user-agent'] }),
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    // Forward the response status and data
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to backend service',
      details: error.message 
    });
  }
}
