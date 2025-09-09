import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

if(!process.env.S3_BUCKET_NAME) throw new Error("You mus define the S3_BUCKET_NAME environment variable")
export const BUCKET_NAME = process.env.S3_BUCKET_NAME

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

export async function getS3File({Bucket,filename,s3Client}:{Bucket:string,filename:string,s3Client:S3Client}) {
  try {
    const s3Response = await s3Client.send(
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

type UploadS3ObjectArgsType = {
  Bucket: string;
  Key: string;
  Body: Buffer<ArrayBufferLike>;
  ContentType: string;
  ContentLength: number;
}

export async function uploadS3Object(s3Client:S3Client, args:UploadS3ObjectArgsType) {
  return await s3Client.send( new PutObjectCommand(args) );
}