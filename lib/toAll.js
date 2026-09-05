import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import { Readable, PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import path from "path";
import fetch from "node-fetch"
import FormData from "form-data";
import { JSDOM } from "jsdom";

const execPromise = promisify(exec);

/**
 * Convert audio buffer ke OGG/Opus (WhatsApp-compatible)
 * @param {Buffer} inputBuffer - Audio source (mp3/wav/m4a/dsb)
 * @returns {Promise<Buffer>} - Buffer hasil ogg/opus
 */
async function toVN(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inStream = new PassThrough();
    const outStream = new PassThrough();
    const chunks = [];

    inStream.end(inputBuffer);

    ffmpeg(inStream)
      .noVideo()
      .audioCodec('libopus')
      .format('ogg')
      .audioBitrate('48k')
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions([
        '-map_metadata', '-1',
        '-application', 'voip',
        '-compression_level', '10',
        '-page_duration', '20000'
      ])
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(outStream, { end: true });

    outStream.on('data', c => chunks.push(c));
  });
}


/**
 * Generate WhatsApp-style waveform from audio buffer (pakai fluent-ffmpeg)
 * @param {Buffer} inputBuffer
 * @param {number} bars
 * @returns {Promise<string>} base64 waveform
 */
async function generateWaveform(inputBuffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(inputBuffer);

    const chunks = [];

    ffmpeg(inputStream)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("s16le")
      .on("error", reject)
      .on("end", () => {
        const rawData = Buffer.concat(chunks);
        const samples = rawData.length / 2;

        const amplitudes = [];
        for (let i = 0; i < samples; i++) {
          let val = rawData.readInt16LE(i * 2);
          amplitudes.push(Math.abs(val) / 32768);
        }

        let blockSize = Math.floor(amplitudes.length / bars);
        let avg = [];
        for (let i = 0; i < bars; i++) {
          let block = amplitudes.slice(i * blockSize, (i + 1) * blockSize);
          avg.push(block.reduce((a, b) => a + b, 0) / block.length);
        }

        let max = Math.max(...avg);
        let normalized = avg.map(v => Math.floor((v / max) * 100));

        let buf = Buffer.from(new Uint8Array(normalized));
        resolve(buf.toString("base64"));
      })
      .pipe() 
      .on("data", chunk => chunks.push(chunk));
  });
}

/**
 * Convert sticker Buffer jadi voice note opus (ogg)
 * @param {Buffer} buffer - Buffer input (webp dll)
 * @returns {Promise<Buffer>} - Buffer output (webp)
 */

async function webp2mp4(source) {
  let form = new FormData();
  let isUrl = typeof source === "string" && /https?:\/\//.test(source);
  form.append("new-image-url", isUrl ? source : "");
  form.append("new-image", isUrl ? "" : source, "image.webp");
  let res = await fetch("https://ezgif.com/webp-to-mp4", {
    method: "POST",
    body: form,
  });
  let html = await res.text();
  let { document } = new JSDOM(html).window;
  let form2 = new FormData();
  let obj = {};
  for (let input of document.querySelectorAll("form input[name]")) {
    obj[input.name] = input.value;
    form2.append(input.name, input.value);
  }
  let res2 = await fetch("https://ezgif.com/webp-to-mp4/" + obj.file, {
    method: "POST",
    body: form2,
  });
  let html2 = await res2.text();
  let { document: document2 } = new JSDOM(html2).window;
  const urlLink = new URL(
    document2.querySelector("div#output > p.outfile > video > source").src,
    res2.url,
  ).toString();
  
  const buffer = Buffer.from(await (await fetch(urlLink)).arrayBuffer())
  return buffer
}

/**
 * Convert audio/video Buffer jadi MP3 (audio/mpeg 128k)
 * @param {Buffer} buffer - Buffer input (mp3/mp4/wav dll)
 * @returns {Promise<Buffer>} - Buffer hasil mp3
 */
async function toMP3(buffer) {
  const inputPath = path.join(process.cwd(), `${uuidv4()}.input`);
  const outputPath = path.join(process.cwd(), `${uuidv4()}.mp3`);

  fs.writeFileSync(inputPath, buffer);

  try {
    await execPromise(
      `ffmpeg -y -i "${inputPath}" -vn -c:a libmp3lame -b:a 128k "${outputPath}"`
    );

    const result = fs.readFileSync(outputPath);

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return result; 
  } catch (err) {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    throw err;
  }
}

async function converter(inputBuffer, inputFormat, outputFormat) {
    
    if (!Buffer.isBuffer(inputBuffer)) {
        throw new Error('Input must be a Buffer');
    }
    if (typeof inputFormat !== 'string' || typeof outputFormat !== 'string') {
        throw new Error('Input and output formats must be strings');
    }

    const inputFilePath = path.resolve(`./tmp/temp_input-${Date.now()}.${inputFormat}`);
    const outputFilePath = path.resolve(`./tmp/temp_output-${Date.now()}.${outputFormat}`);

    try {
        await fs.promises.writeFile(inputFilePath, inputBuffer);
        console.log('Input file written successfully.');

        console.log('Starting conversion...');
        await execPromise(`ffmpeg -i ${inputFilePath} ${outputFilePath}`);
        console.log('Conversion completed successfully.');

        const outputBuffer = await fs.promises.readFile(outputFilePath);
        return outputBuffer;
    } catch (error) {
        console.error('Error while converting file:', error);
        throw error; 
    } finally {
        
        try {
            if (fs.existsSync(inputFilePath)) await fs.promises.unlink(inputFilePath);
            if (fs.existsSync(outputFilePath)) await fs.promises.unlink(outputFilePath);
        } catch (cleanupError) {
            console.error('Error while cleaning up temp files:', cleanupError);
        }
    }
}

export default { toVN, generateWaveform, toMP3, webp2mp4, converter }