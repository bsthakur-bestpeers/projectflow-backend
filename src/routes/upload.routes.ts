import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadFile } from "../controllers/upload.controller";

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Single file upload route
router.post("/", upload.single("file"), uploadFile);

export default router;
