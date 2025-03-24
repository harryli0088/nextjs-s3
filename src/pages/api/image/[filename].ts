import { s3 } from "@/utils/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
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


  try {
    const s3Response = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: filename,
      })
    );

    if (!s3Response.Body) {
      return res.status(404).json({ error: "File not found" });
    }

    const stream = s3Response.Body instanceof Readable ? s3Response.Body : Readable.from(s3Response.Body as any);

    res.setHeader("Content-Type", s3Response.ContentType || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    stream.pipe(res);
  }
  catch(err) {
    console.error(err)
    res.status(500).json({ error: "Failed to retrieve file" });
  }
}