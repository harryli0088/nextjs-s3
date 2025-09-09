import { BUCKET_NAME, getS3File, s3 } from "@/utils/s3";
import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename } = req.query; // Extract filename from the URL

  if (!filename || typeof filename !== "string") {
    return res.status(400).json({ error: "Filename is required" });
  }

  const result = await getS3File({
    Bucket: BUCKET_NAME,
    filename,
    s3Client: s3
  })

  if (!result) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader("Content-Type", result.ContentType || "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  (result.Body as Readable).pipe(res);
}