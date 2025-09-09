import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import sharp from "sharp";
import { BUCKET_NAME, s3, uploadS3Object } from "@/utils/s3";


export const config = {
  api: {
    bodyParser: false, // Disable built-in body parser for FormData support
  },
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "File parsing error" });
    }

    if (!files.image || files.image.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = files.image[0];
    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      const fileKey = uuidv4() + ".jpg";

      const standardizedBuffer = await processImage(fileBuffer,file.mimetype || "")
      
      // Upload file to S3
      await uploadS3Object(s3, {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: standardizedBuffer,
        ContentType: file.mimetype || "",
        ContentLength: standardizedBuffer.length,
      })

      res.status(200).json({ message: "File uploaded successfully" });
    } catch (uploadError) {
      console.error(uploadError)
      res.status(500).json({ error: "Error uploading to S3" });
    } finally {
      fs.unlinkSync(file.filepath); // Clean up temp file
    }
  });
}


async function processImage(imageBuffer: Buffer, originalMimeType: string): Promise<Buffer> {
  try {
    let pipeline = sharp(imageBuffer);
    
    if (originalMimeType === "image/heic" || originalMimeType === "image/heif") {
      pipeline = pipeline.toFormat("jpeg"); // Convert HEIC to JPEG
    }
    let quality = 80; // Initial quality setting
    let outputBuffer = await pipeline.jpeg({ quality }).toBuffer();

    // If the outputBuffer is larger than 500KB, progressively reduce quality
    while (outputBuffer.length > 500 * 1024 && quality > 30) {
      console.log("quality")
      quality -= 10;
      outputBuffer = await sharp(imageBuffer)
        .jpeg({ quality }) // Adjust quality
        .toBuffer();
    }

    return outputBuffer;
  } catch (error) {
    throw new Error(`Image processing failed: ${error}`);
  }
}