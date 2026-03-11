import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Chat endpoint (Phase 1: hardcoded response)
app.post('/chat', (req, res) => {
  const { message, tenantId } = req.body;
  
  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }
  
  // Phase 1: Simple echo + hardcoded response
  const response = `Hello! I'm your AI support assistant. You said: "${message}". I'll be able to answer questions from your knowledge base soon!`;
  
  res.json({ 
    response,
    tenantId: tenantId || 'default',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
