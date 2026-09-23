import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadFile, uploadMultipleFiles, deleteFile } from "../controllers/upload.controller";

import fs from "fs";

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Single file upload
router.post("/", upload.single("file"), uploadFile);

// Multiple files upload (up to 10 at a time)
router.post("/multiple", upload.array("files", 10), uploadMultipleFiles);

// Delete a file
router.delete("/:filename", deleteFile);

export default router;
