import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import OpenAI from 'openai';
import multer from 'multer';
import sharp from 'sharp';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Root page
app.get('/', (_req, res) => {
  res.send('ListingLift API is running');
});

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Copy generation (returns detailed errors if it fails)
app.post('/copy/generate', async (req, res) => {
  try {
    const { facts = {}, tone = "professional, upbeat" } = req.body || {};
    const sys = "You are an expert real estate copywriter. Keep content MLS-safe and concise.";
    const user = `Write a 150–220 word listing description. Facts: ${JSON.stringify(facts)}. Tone: ${tone}.
Also provide 5 short bullet highlights and 10 brief social captions. Return JSON with keys: description, bullets, captions.`;

    const out = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user }
      ],
      temperature: 0.5
    });

    const text = out.choices?.[0]?.message?.content || "{}";
    let payload;
    try { payload = JSON.parse(text); } catch { payload = { description: text, bullets: [], captions: [] }; }
    res.json(payload);
  } catch (err) {
    console.error("OPENAI ERROR:", err?.status, err?.message, err?.response?.data);
    res.status(500).json({
      error: "copy_generation_failed",
      detail: err?.response?.data?.error?.message || err?.message || "unknown_error"
    });
  }
});

// Image enhancement
const upload = multer({ storage: multer.memoryStorage() });

app.post('/images/enhance', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file_uploaded" });

    const input = sharp(req.file.buffer, { failOn: false }).rotate();
    const enhanced = await input
      .normalize()
      .gamma(1.05)
      .modulate({ brightness: 1.10, saturation: 1.05 })
      .linear(1.04, -8)
      .sharpen()
      .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
      .toBuffer();

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="enhanced.jpg"');
    res.send(enhanced);
  } catch (err) {
    console.error("ENHANCE ERROR:", err?.message);
    res.status(500).json({ error: "enhancement_failed", detail: err?.message || "unknown_error" });
  }
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('API listening on', port);
});
