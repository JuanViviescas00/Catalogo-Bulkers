import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de salud (Healthcheck)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
