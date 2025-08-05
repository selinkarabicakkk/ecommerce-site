import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/config';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../', config.upload.path);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize,
  },
});

/**
 * Delete a file from the uploads directory
 * @param filename Filename to delete
 * @returns Promise that resolves when file is deleted
 */
export const deleteFile = async (filename: string): Promise<void> => {
  const filePath = path.join(uploadDir, filename);
  
  try {
    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);
  } catch (error) {
    // File doesn't exist or other error, just ignore
    console.log(`Failed to delete file ${filename}: ${error}`);
  }
}; 