import express from "express"
import multer from "multer"
import { validateUploadFile, returnDefault, validateDeleteParams } from "./utils/utils.js"
import { ensureBucketWithDefaults, uploadFile, createS3Client, getImagesFromBucket, fileExists, deleteFile } from "./utils/bucket.js"
import cors from "cors"

const app = express()
app.use(cors())
const upload = multer()
const bucketName = process.env.MINIO_BUCKET || ""
const port = process.env.MEDIA_SERVICE_PORT || 9020

const s3 = createS3Client()

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.get("/*", async (req, res) => {
  try {
    await ensureBucketWithDefaults(s3, bucketName);
    
    const key = decodeURIComponent(req.path);

    if (!key) return res.status(400).send("Key missing");

    await getImagesFromBucket(s3, bucketName, key, res);

  } catch (err) {
    try {
      const type = decodeURIComponent(req.path).split("/")[1] || "";
      const defaultKey = returnDefault(type);

      await getImagesFromBucket(s3, bucketName, defaultKey, res);

    } catch (defaultErr) {
      console.error("Default file also not found:", defaultErr);
      res.status(404).send("File not found and no default available");
    }
  }
})

app.post("/:type/:entityId", upload.single("file"), async (req, res) => {
  try {
    const { file } = req
    const type = req.params.type as string;
    const entityId = req.params.entityId as string;

    const { isValid, error } = validateUploadFile(file, type, entityId)
    if (!isValid) {
      return res.status(400).send(error)
    }
    const validatedFile = file!

    await ensureBucketWithDefaults(s3, bucketName)

    const key = `${type}/${entityId}/${validatedFile.originalname}`

    try {
      const updatedKey = await uploadFile(s3, bucketName, key, validatedFile.buffer, validatedFile.mimetype);
      res.json({ url: updatedKey });
    } catch (uploadErr) {
      const defaultKey = returnDefault(type)
      res.json({ url: defaultKey });
    }
  } catch (err) {
    console.error("Upload error:", err)
  }
});

app.put("/:type/:entityId", upload.single("file"), async (req, res) => {
  try {
    const { file } = req
    const type = req.params.type as string;
    const entityId = req.params.entityId as string;

    const { isValid, error } = validateUploadFile(file, type, entityId)
    if (!isValid) {
      return res.status(400).send(error)
    }
    const validatedFile = file!

    await ensureBucketWithDefaults(s3, bucketName)

    const key = `${type}/${entityId}/${validatedFile.originalname}`

    const exists = await fileExists(s3, bucketName, key)
    if (!exists) {
      return res.status(404).send(`File with key '${key}' not found. Use POST to create a new file.`)
    }

    try {
      const updatedKey = await uploadFile(s3, bucketName, key, validatedFile.buffer, validatedFile.mimetype);
      res.json({ url: updatedKey });
    } catch (uploadErr) {
      console.error("Update error:", uploadErr)
      res.status(500).send("Failed to update file")
    }
  } catch (err) {
    console.error("Update error:", err)
    res.status(500).send("Internal server error")
  }
});

app.delete("/:type/:entityId/:filename", async (req, res) => {
  try {
    const type = req.params.type as string;
    const entityId = req.params.entityId as string;
    const filename = req.params.filename as string;
    
    const { isValid, error } = validateDeleteParams(type, entityId, filename);
    if (!isValid) {
      return res.status(400).send(error);
    }
    
    await ensureBucketWithDefaults(s3, bucketName);
    const key = `${type}/${entityId}/${filename}`;
    
    const exists = await fileExists(s3, bucketName, key);
    if (!exists) {
      return res.status(404).send(`File with key '${key}' not found.`);
    }
    
    await deleteFile(s3, bucketName, key);
    
    res.json({ message: `File with key '${key}' deleted successfully.` });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Internal server error");
  }
});


app.listen(port, () => console.log(`📸 Media service running on ${port}`))