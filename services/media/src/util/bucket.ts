import { S3Client, HeadBucketCommand, GetObjectCommand, CreateBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs/promises"
import path from "path"
import { Readable } from "stream"
import express from "express"

/**
 * Creates an S3 client instance
 * @returns S3Client
 */
export function createS3Client(): S3Client {
    return new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || "",
        secretAccessKey: process.env.MINIO_SECRET_KEY || ""
      },
      forcePathStyle: true
    })
}

/**
 * Uploads a file to S3 bucket
 * @param s3Client - The S3 client instance
 * @param bucketName - The name of the bucket
 * @param key - The S3 object key
 * @param body - The file buffer
 * @param contentType - The content type of the file
 * @returns Promise<string> - Returns the uploaded file key
 */
export async function uploadFile(
  s3Client: S3Client, 
  bucketName: string, 
  key: string, 
  body: Buffer, 
  contentType: string
): Promise<string> {
  if (!bucketName) {
    throw new Error("Bucket name is required");
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );

  return key
}

/**
 * Ensures the bucket exists and uploads default images if the bucket was just created
 * @param s3Client - The S3 client instance
 * @param bucketName - The name of the bucket to check/create
 * @returns Promise<void>
 */
export async function ensureBucketWithDefaults(s3Client: S3Client, bucketName: string): Promise<void> {
  if (!bucketName) {
    throw new Error("Bucket name is required")
  }

  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
  } catch (error: unknown) {
    if ( error && typeof error === "object" && "name" in error && (error as { name?: string; $metadata?: { httpStatusCode?: number } }).name === "NotFound") {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }))
      await uploadDefaultImages(s3Client, bucketName)
    } else {
      throw error
    }
  }
}

/**
 * Uploads default images to the bucket
 * @param s3Client - The S3 client instance
 * @param bucketName - The name of the bucket
 * @returns Promise<void>
 */
async function uploadDefaultImages(s3Client: S3Client, bucketName: string): Promise<void> {
  
  const resourcesDir = path.resolve(process.cwd(), "res")
  
  const defaultFiles = [
    { fileName: "default.png", key: "default.png", contentType: "image/png" },
    { fileName: "event-default.png", key: "events/default.png", contentType: "image/png" },
    { fileName: "user-default.png", key: "users/default.png", contentType: "image/png" }
  ];

  for (const f of defaultFiles) {
    try {
      const fp = path.join(resourcesDir, f.fileName);
      const body = await fs.readFile(fp);
      const updatedKey = await uploadFile(s3Client, bucketName, f.key, body, f.contentType);
      console.log(`Uploaded default ${f.fileName} to ${updatedKey}`);
    } catch (uploadErr) {
      console.error(`Failed uploading default ${f.fileName}:`, uploadErr);
    }
  }
}

export async function getImagesFromBucket(s3: S3Client, bucketName: string | undefined, key: string, res: express.Response): Promise<void> {
    const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
    })

    const data = await s3.send(command)
    
    res.setHeader("Content-Type", data.ContentType || "application/octet-stream")
    res.setHeader("Content-Length", data.ContentLength || 0)

    if (!data.Body) throw new Error("No data received from S3")
    const body = data.Body as Readable
    body.pipe(res)
}