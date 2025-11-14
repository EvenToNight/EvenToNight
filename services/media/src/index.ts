import express from "express"
import multer from "multer"
import { checkData, returnDefault } from "./utils/utils.js"
import { ensureBucketWithDefaults, uploadFile, createS3Client, getImagesFromBucket } from "./utils/bucket.js"
import cors from "cors"

const app = express()
app.use(cors())
const upload = multer()
const bucketName = process.env.MINIO_BUCKET || ""
const port = process.env.MEDIA_SERVICE_PORT || 9020

const s3 = createS3Client()

app.get("/*", async (req, res) => {
  try {
    await ensureBucketWithDefaults(s3, bucketName);
    
    const key = decodeURIComponent(req.path);
    
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

app.post("/:type/:entityId", upload.single("file"), async (req, res) => {
  try {
    const { file } = req
    const { type, entityId} = req.params

    const { isValid, error } = checkData(file, type, entityId)
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

app.listen(port, () => console.log(`📸 Media service running on ${port}`))