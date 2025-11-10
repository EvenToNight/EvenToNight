import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

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

app.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const command = new GetObjectCommand({
      Bucket: process.env.MINIO_BUCKET,
      Key: key,
    });

    const data = await s3.send(command);
    
    if (!data.Body) {
      throw new Error("No data received from S3");
    }

    res.setHeader("Content-Type", data.ContentType || "application/octet-stream");
    res.setHeader("Content-Length", data.ContentLength || 0);

    const chunks: Uint8Array[] = [];
    for await (const chunk of data.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    res.send(Buffer.concat(chunks));
  } catch (err) {
    console.error("File retrieval error:", err);
    res.status(404).send("File not found");
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`📸 Media service running on ${PORT}`));