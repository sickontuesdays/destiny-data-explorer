// API route to proxy requests to Bungie API (avoids CORS issues)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, apiKey, params = {} } = req.body;

  if (!endpoint || !apiKey) {
    return res.status(400).json({ error: 'Missing endpoint or API key' });
  }

  try {
    // Build the URL with query parameters
    const baseUrl = `https://www.bungie.net/Platform/${endpoint}`;
    const searchParams = new URLSearchParams();
    
    // Add any query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });

    const url = searchParams.toString() ? `${baseUrl}?${searchParams}` : baseUrl;

    console.log(`Making request to: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'User-Agent': 'Destiny-Data-Explorer/1.0'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Bungie API error:', data);
      return res.status(response.status).json({
        error: 'Bungie API error',
        details: data
      });
    }

    // Check for Bungie-specific error codes
    if (data.ErrorCode && data.ErrorCode !== 1) {
      console.error('Bungie error code:', data.ErrorCode, data.Message);
      return res.status(400).json({
        error: 'Bungie API returned error',
        errorCode: data.ErrorCode,
        message: data.Message
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}