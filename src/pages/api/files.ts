import { s3 } from "@/utils/s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    res.status(200).json(await listAllFiles(process.env.S3_BUCKET_NAME!))
  }
  catch(err) {
    console.error(err)
    res.status(500).json({ error: "Error getting S3 bucket files" });
  }
}

async function listAllFiles(bucketName: string) {
  let isTruncated = true;
  let continuationToken: string | undefined;
  const allFiles: string[] = [];

  try {
      while (isTruncated) {
          const command = new ListObjectsV2Command({
              Bucket: bucketName,
              ContinuationToken: continuationToken,
          });

          const { Contents, IsTruncated, NextContinuationToken } = await s3.send(command);

          if (Contents) {
              allFiles.push(...Contents.map(file => file.Key || ""));
          }

          isTruncated = IsTruncated ?? false;
          continuationToken = NextContinuationToken;
      }

      return allFiles;
  } catch (error) {
      console.error("Error listing files:", error);
      return [];
  }
}