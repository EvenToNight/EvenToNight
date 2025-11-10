import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

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

app.post("/", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const { type, entityId } = req.body;

    if (!file) return res.status(400).send("File missing");
    if (!type || !entityId) return res.status(400).send("Metadata missing");

    const bucketName = process.env.MINIO_BUCKET;

    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        (error as { name?: string; $metadata?: { httpStatusCode?: number } }).name === "NotFound"
      ) {
        console.log(`Bucket ${bucketName} non trovato. Creazione in corso...`);
        await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`Bucket ${bucketName} creato con successo`);
      } else {
      throw error;
      }
    }

    const key = `${type}/${entityId}/${Date.now()}-${file.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    const fileKey = `${key}`;
    res.json({ url: fileKey });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Error uploading file");
  }
});

app.get("/*", async (req, res) => {
  try {
    const key = req.path;

    if (!key) return res.status(400).send("Key missing");

    const command = new GetObjectCommand({
      Bucket: process.env.MINIO_BUCKET,
      Key: key,
    });

    const data = await s3.send(command);
    
    res.setHeader("Content-Type", data.ContentType || "application/octet-stream");
    res.setHeader("Content-Length", data.ContentLength || 0);
    
    if (!data.Body) throw new Error("No data received from S3");
    const body = data.Body as Readable;
    body.pipe(res);

  } catch (err) {
    console.error("File retrieval error:", err);
    res.status(404).send("File not found");
  }
});

app.listen(process.env.PORT, () => console.log(`📸 Media service running on ${process.env.PORT}`));