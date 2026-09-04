import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import env from '../config/env.js';

// En entornos serverless como Vercel, la carpeta con permisos de escritura es os.tmpdir() (/tmp)
const uploadDir = path.join(os.tmpdir(), 'uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('[Uploads] Aviso al inicializar directorio de subidas:', err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

export default uploadMiddleware;
