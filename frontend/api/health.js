// Vercel API route that proxies health check to Railway backend
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const BACKEND_URL = process.env.VITE_API_URL || 'https://gen-safe-ai-production.up.railway.app';
    
    console.log('Proxying health check to:', `${BACKEND_URL}/api/health`);
    
    // Forward the request to Railway backend
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        // Forward relevant headers
        ...(req.headers['user-agent'] && { 'User-Agent': req.headers['user-agent'] }),
      }
    });

    const data = await response.json();
    
    // Add proxy information to the response
    const proxyData = {
      ...data,
      proxy: {
        status: 'active',
        backend_url: BACKEND_URL,
        timestamp: new Date().toISOString()
      }
    };
    
    // Forward the response status and data
    res.status(response.status).json(proxyData);
    
  } catch (error) {
    console.error('Health check proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to backend service',
      details: error.message,
      proxy: {
        status: 'error',
        timestamp: new Date().toISOString()
      }
    });
  }
}
