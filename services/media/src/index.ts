import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const app = express();
const upload = multer();

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || ""
  },
  forcePathStyle: true
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    if (!file) return res.status(400).send("File missing");

    const key = `${Date.now()}-${file.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    const fileUrl = `${process.env.MINIO_PUBLIC_URL}/${process.env.MINIO_BUCKET}/${key}`;
    res.json({ url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Error uploading file");
  }
});

app.get("/health", (_, res) => res.send("ok"));

const PORT = process.env.PORT || 9020;
const server = app.listen(PORT, () => console.log(`📸 Media service running on ${PORT}`));

// Gestione graceful shutdown
const shutdown = () => {
  console.log('\nShutdown signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Forza la chiusura dopo 5 secondi se il server non si chiude gracefully
  setTimeout(() => {
    console.log('Forcing server shutdown after timeout');
    process.exit(1);
  }, 5000);
};

// Gestione dei segnali di terminazione
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Gestione delle rejected promises non catturate
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});