import express from "express"
import multer from "multer"
import { checkData, returnDefault } from "./util/validation.js"
import { ensureBucketWithDefaults, uploadFile, createS3Client, getImagesFromBucket } from "./util/bucket.js"

const app = express()
const upload = multer()
const bucketName = process.env.MINIO_BUCKET || ""
const port = process.env.MEDIA_SERVICE_PORT || 9020

const s3 = createS3Client()

app.post("/", upload.single("file"), async (req, res) => {
  try {
    const { file } = req
    const { type, entityId } = req.body
    const { isValid, error } = checkData(file, type, entityId)
    if (!isValid) {
      return res.status(400).send(error)
    }
    const validatedFile = file!

    await ensureBucketWithDefaults(s3, bucketName)

    const key = `${type}/${entityId}/${Date.now()}-${validatedFile.originalname}`

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

app.get("/*", async (req, res) => {
  try {
    await ensureBucketWithDefaults(s3, bucketName);
    
    const key = req.path

    if (!key) return res.status(400).send("Key missing");

    await getImagesFromBucket(s3, bucketName, key, res);

  } catch (err) {
    try {
      const type = req.path.split("/")[1] || "";
      const defaultKey = returnDefault(type);

      await getImagesFromBucket(s3, bucketName, defaultKey, res);

    } catch (defaultErr) {
      console.error("Default file also not found:", defaultErr);
      res.status(404).send("File not found and no default available");
    }
  }
})

app.listen(port, () => console.log(`📸 Media service running on ${port}`))