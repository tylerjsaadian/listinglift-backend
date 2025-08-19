import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// HEALTH CHECK (this is the one you're visiting)
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Root page (optional)
app.get('/', (_req, res) => {
  res.send('ListingLift API is running');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('API listening on', port);
});
