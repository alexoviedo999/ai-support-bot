export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ status: 'ok' });
    return;
  }

  if (req.method === 'POST') {
    const { message, tenantId } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    
    // Phase 1: Simple echo + hardcoded response
    const response = `Hello! I'm your AI support assistant. You said: "${message}". I'll be able to answer questions from your knowledge base soon!`;
    
    res.status(200).json({ 
      response,
      tenantId: tenantId || 'default',
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
