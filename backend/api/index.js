import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import sembrarAdmin from '../src/scripts/seed.js';

let isReady = false;

export default async function handler(req, res) {
  if (!isReady) {
    try {
      await connectDB();
      await sembrarAdmin();
      isReady = true;
    } catch (err) {
      console.error('[Vercel Serverless] Error conectando a DB:', err);
    }
  }

  return app(req, res);
}
