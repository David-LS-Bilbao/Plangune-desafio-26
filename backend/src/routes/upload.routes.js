import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import fs from 'fs';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento físico
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Apunta a backend/uploads/
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de seguridad: Solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB
  fileFilter 
});

// Endpoint POST /api/upload
// Requiere autenticación y rol de negocio
router.post('/', requireAuth, requireRole('business'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo' });
  }

  // La URL pública para consumir la imagen desde el frontend
  // El middleware de estáticos está en '/uploads'
  const imageUrl = `/uploads/${req.file.filename}`;
  
  res.status(200).json({ url: imageUrl });
});

export default router;
