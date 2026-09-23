"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadMultipleFiles = exports.uploadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadFile = (req, res) => {
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
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: "Server error during file upload." });
    }
};
exports.uploadFile = uploadFile;
const uploadMultipleFiles = (req, res) => {
    try {
        const files = req.files;
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
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: "Server error during file upload." });
    }
};
exports.uploadMultipleFiles = uploadMultipleFiles;
const deleteFile = (req, res) => {
    try {
        const { filename } = req.params;
        if (!filename) {
            return res.status(400).json({ success: false, message: "Filename is required." });
        }
        // Prevent path traversal
        const safeName = path_1.default.basename(filename);
        const filePath = path_1.default.join(process.cwd(), "uploads", safeName);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        res.status(200).json({ success: true, message: "File deleted." });
    }
    catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ success: false, message: "Server error during file deletion." });
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=upload.controller.js.map