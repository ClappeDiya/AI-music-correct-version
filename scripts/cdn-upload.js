const AWS = require("aws-sdk");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs").promises;

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.CDN_BUCKET_NAME;
const VIDEO_QUALITIES = ["360p", "480p", "720p", "1080p"];
const IMAGE_SIZES = [320, 640, 1024, 1920];
const IMAGE_FORMATS = ["webp", "jpeg"];

async function optimizeImage(inputBuffer, width, format) {
  const pipeline = sharp(inputBuffer)
    .resize(width, null, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(format, {
      quality: 80,
      progressive: true,
    });

  return pipeline.toBuffer();
}

async function uploadToS3(buffer, key) {
  await s3
    .putObject({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: `image/${path.extname(key).slice(1)}`,
      CacheControl: "public, max-age=31536000",
    })
    .promise();
}

async function processVideo(inputPath, outputPath, quality) {
  return new Promise((resolve, reject) => {
    const resolutions = {
      "360p": { width: 640, height: 360 },
      "480p": { width: 854, height: 480 },
      "720p": { width: 1280, height: 720 },
      "1080p": { width: 1920, height: 1080 },
    };

    const { width, height } = resolutions[quality];

    ffmpeg(inputPath)
      .size(`${width}x${height}`)
      .videoBitrate("1000k")
      .videoCodec("libx264")
      .audioCodec("aac")
      .audioBitrate("128k")
      .format("mp4")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}

async function uploadImage(inputPath, targetPath) {
  try {
    const inputBuffer = await fs.readFile(inputPath);

    for (const width of IMAGE_SIZES) {
      for (const format of IMAGE_FORMATS) {
        const optimizedBuffer = await optimizeImage(inputBuffer, width, format);
        const key = `${targetPath}/${width}w.${format}`;

        await uploadToS3(optimizedBuffer, key);
        console.log(`Uploaded ${key}`);
      }
    }
  } catch (error) {
    console.error(`Error processing image ${inputPath}:`, error);
    throw error;
  }
}

async function uploadVideo(inputPath, targetPath) {
  try {
    const tempDir = path.join(__dirname, "temp");
    await fs.mkdir(tempDir, { recursive: true });

    for (const quality of VIDEO_QUALITIES) {
      const outputPath = path.join(tempDir, `${quality}.mp4`);
      await processVideo(inputPath, outputPath, quality);

      const videoBuffer = await fs.readFile(outputPath);
      const key = `${targetPath}/${quality}.mp4`;

      await uploadToS3(videoBuffer, key);
      console.log(`Uploaded ${key}`);

      await fs.unlink(outputPath);
    }

    await fs.rmdir(tempDir);
  } catch (error) {
    console.error(`Error processing video ${inputPath}:`, error);
    throw error;
  }
}

async function uploadToCDN(inputPath, targetPath, type) {
  if (!["image", "video"].includes(type)) {
    throw new Error('Invalid file type. Must be either "image" or "video"');
  }

  console.log(`Processing ${type}: ${inputPath}`);

  if (type === "image") {
    await uploadImage(inputPath, targetPath);
  } else {
    await uploadVideo(inputPath, targetPath);
  }
}

// Export for use in other scripts
module.exports = {
  uploadToCDN,
  uploadImage,
  uploadVideo,
};

// CLI usage
if (require.main === module) {
  const [, , inputPath, targetPath, type] = process.argv;

  if (!inputPath || !targetPath || !type) {
    console.error("Usage: node cdn-upload.js <inputPath> <targetPath> <type>");
    process.exit(1);
  }

  uploadToCDN(inputPath, targetPath, type)
    .then(() => {
      console.log("Upload completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Upload failed:", error);
      process.exit(1);
    });
}
