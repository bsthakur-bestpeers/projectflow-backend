import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export const uploadFile = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Server error during file upload." });
  }
};

export const uploadMultipleFiles = (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded." });
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");

    const uploaded = files.map((file) => ({
      url: `${protocol}://${host}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }));

    res.status(200).json({ success: true, data: uploaded });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Server error during file upload." });
  }
};

export const deleteFile = (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    if (!filename) {
      return res.status(400).json({ success: false, message: "Filename is required." });
    }

    // Prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(process.cwd(), "uploads", safeName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ success: true, message: "File deleted." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server error during file deletion." });
  }
};
