"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }
        // Return the URL where the file can be accessed
        // Assuming backend runs on port 5000 and serves /uploads statically
        const url = `http://localhost:5000/uploads/${req.file.filename}`;
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
//# sourceMappingURL=upload.controller.js.map