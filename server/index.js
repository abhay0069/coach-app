// Minimal reference AI proxy server for SkillPilot.
// Swap in your preferred LLM SDK below. The prompts are intentionally small and
// structured so they produce predictable JSON.

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '';

if (process.env.API_KEY) {
  app.use((req, res, next) => {
    const header = req.headers.authorization || '';
    if (header !== `Bearer ${API_KEY}`) return res.status(401).json({ error: 'unauthorized' });
    next();
  });
}

app.post('/roadmap', async (req, res) => {
  const { onboarding } = req.body;
  // TODO: call LLM with a strict JSON prompt. For now, echo a stub so the mobile
  // app falls back to its local generator (which returns non-null only when the
  // response truly contains modules + tasks).
  res.json({ modules: null, tasks: null });
});

app.post('/quiz', async (req, res) => {
  res.json({ questions: null });
});

app.post('/mentor', async (req, res) => {
  res.json({ reply: null });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`SkillPilot AI server listening on :${PORT}`));
