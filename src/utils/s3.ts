import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Initialize S3 client
export const s3 = new S3Client({
  // endpoint: process.env.S3_ENDPOINT!, //necessary if you are not using AWS S3
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for some S3-compatible providers
});

export async function getS3File({Bucket,filename,s3}:{Bucket:string,filename:string,s3:S3Client}) {
  try {
    const s3Response = await s3.send(
      new GetObjectCommand({
        Bucket,
        Key: filename,
      })
    );

    if(!s3Response.Body) {
      return null
    }
    return s3Response
  }
  catch(err) {
    console.error(err)
    throw new Error("Failed to retrieve file")
  }
}