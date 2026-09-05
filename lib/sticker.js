import fs from "node:fs";
import Crypto from "crypto";
import ff from "fluent-ffmpeg";
import webp from "node-webpmux";
import path from "path";
import { tmpdir } from "os";
import * as FileType from "file-type";

const temp = tmpdir();

async function imageToWebp(media, opts = {}) {
  const { crop = false, quality = 100, fps = 30 } = opts;

  const tmpFileIn = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${media?.ext || "png"}`);
  const tmpFileOut = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);

  fs.writeFileSync(tmpFileIn, media.data);

  try {
    await new Promise((resolve, reject) => {
      ff(tmpFileIn)
        .on("error", reject)
        .on("end", () => resolve(true))
        .addOutputOptions([
          "-vcodec",
          "libwebp",
          "-vf",
          `scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0`,
          "-quality",
          "80",
          "-lossless",
          "0"
        ])
        .toFormat("webp")
        .saveToFile(tmpFileOut);
    });

    fs.promises.unlink(tmpFileIn);
    const buff = fs.readFileSync(tmpFileOut);
    fs.promises.unlink(tmpFileOut);

    return buff;
  } catch (e) {
    if (fs.existsSync(tmpFileIn)) await fs.promises.unlink(tmpFileIn);
    if (fs.existsSync(tmpFileOut)) await fs.promises.unlink(tmpFileOut);
    throw e;
  }
}

async function videoToWebp(media, opts = {}) {
  const { crop = false, quality = 50, fps = 15 } = opts; 

  const tmpFileIn = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${media?.ext || "mp4"}`);
  const tmpFileOut = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);

  fs.writeFileSync(tmpFileIn, media.data);

  const getDuration = () => {
    return new Promise((resolve, reject) => {
      ff.ffprobe(tmpFileIn, (err, metadata) => {
        if (err) reject(err);
        resolve(metadata.format.duration);
      });
    });
  };

  const duration = await getDuration();
  const maxDuration = 7; 

  let ss = 0;
  let t = Math.min(duration, maxDuration);

  try {
    await new Promise((resolve, reject) => {
      const command = ff(tmpFileIn)
        .on("error", reject)
        .on("end", () => resolve(true))
        .addOutputOptions([
          "-vcodec",
          "libwebp",
          "-vf",
          `scale='min(256,iw)':'min(256,ih)':force_original_aspect_ratio=decrease,fps=${fps},pad=256:256:-1:-1:color=white@0.0`,
          "-loop",
          "0",
          "-ss",
          `${ss}`,
          "-t",
          `${t}`,
          "-preset",
          "default",
          "-an",
          "-vsync",
          "0",
          "-quality",
          `${quality}`,
          "-compression_level",
          "6"
        ])
        .toFormat("webp");

      command.saveToFile(tmpFileOut);
    });

    fs.promises.unlink(tmpFileIn);
    const buff = fs.readFileSync(tmpFileOut);
    fs.promises.unlink(tmpFileOut);

    
    if (buff.length > 900 * 1024) {
      console.log(`Ukuran masih ${(buff.length/1024).toFixed(2)}KB, kompres lagi...`);
      return await compressFurther(buff);
    }

    return buff;
  } catch (e) {
    if (fs.existsSync(tmpFileIn)) await fs.promises.unlink(tmpFileIn);
    if (fs.existsSync(tmpFileOut)) await fs.promises.unlink(tmpFileOut);
    throw e;
  }
}


async function compressFurther(buffer) {
  const tmpFileIn = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
  const tmpFileOut = path.join(temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
  
  fs.writeFileSync(tmpFileIn, buffer);
  
  try {
    await new Promise((resolve, reject) => {
      ff(tmpFileIn)
        .on("error", reject)
        .on("end", () => resolve(true))
        .addOutputOptions([
          "-vf",
          "scale='min(200,iw)':min'(200,ih)':force_original_aspect_ratio=decrease",
          "-quality",
          "40",
          "-compression_level",
          "6",
          "-loop",
          "0"
        ])
        .toFormat("webp")
        .saveToFile(tmpFileOut);
    });
    
    const buff = fs.readFileSync(tmpFileOut);
    fs.promises.unlink(tmpFileIn);
    fs.promises.unlink(tmpFileOut);
    
    console.log(`Hasil kompress lanjutan: ${(buff.length/1024).toFixed(2)}KB`);
    return buff;
  } catch (e) {
    fs.promises.unlink(tmpFileIn).catch(()=>{});
    return buffer;
  }
}

async function writeExif(media, metadata, opts = {}) {
  const { crop = false, quality = 100, fps = 30 } = opts;

  
  if (!media.mimetype || !media.ext) {
    const type = await FileType.fileTypeFromBuffer(media.data);
    if (type) {
      media.mimetype = type.mime;
      media.ext = type.ext;
    }
  }

  let wMedia = null;
  
  
  if (/webp/.test(media?.mimetype || "")) {
    wMedia = media?.data;
  } 
  
  else if (/video/.test(media?.mimetype || "") || media?.type === 'video') {
    wMedia = await videoToWebp(media, { crop, quality, fps });
  } 
  
  else if (/image/.test(media?.mimetype || "")) {
    wMedia = await imageToWebp(media, { crop, quality, fps });
  } 
  else {
    throw new Error("MimeType media tidak dikenali atau data kosong");
  }

  if (!wMedia) throw new Error("Gagal konversi ke WebP");

  
  if (metadata && Object.keys(metadata).length !== 0) {
    const img = new webp.Image();
    const json = {
      "sticker-pack-id": metadata?.packId || `jere-${Date.now()}`,
      "sticker-pack-name": metadata?.packName || "",
      "sticker-pack-publisher": metadata?.packPublish || "",
      "android-app-store-link": metadata?.androidApp || "https://play.google.com/store/apps/details?id=com.bitsmedia.android.muslimpro",
      "ios-app-store-link": metadata?.iOSApp || "https://apps.apple.com/id/app/muslim-pro-al-quran-adzan/id388389451?|=id",
      emojis: metadata?.emojis || ["😋", "😎", "🤣", "😂", "😁"],
      "is-avatar-sticker": metadata?.isAvatar || 0,
    };
    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);
    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
    const exif = Buffer.concat([exifAttr, jsonBuff]);
    exif.writeUIntLE(jsonBuff.length, 14, 4);
    await img.load(wMedia);
    img.exif = exif;

    return await img.save(null);
  }

  return wMedia;
}

export default {
  writeExif,
  videoToWebp,
  imageToWebp,
};