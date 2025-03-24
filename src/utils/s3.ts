import { S3Client } from "@aws-sdk/client-s3";

// Initialize S3 client
export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for some S3-compatible providers
});
