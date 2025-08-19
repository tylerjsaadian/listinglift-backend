import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/copy/generate', async (req, res) => {
  // Pseudocode: call OpenAI for listing copy
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { facts, tone } = req.body || {};
  const prompt = `Write a 150-220 word MLS-friendly listing description. Facts: ${JSON.stringify(facts)}. Tone: ${tone}.`;
  // const completion = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role:'user', content: prompt }] });
  // const text = completion.choices[0].message.content;
  const text = '<< integrate OpenAI call here >>';
  res.json({ description: text, bullets: [], captions: [] });
});

app.listen(process.env.PORT || 8080, () => {
  console.log('API listening on', process.env.PORT || 8080);
});
