import sticker from '@library/sticker.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let handler = async (m, { conn, command, text }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    let msg = q.msg || q;
    const prefix = '.';

    if (!msg.mimetype) {
      let caption = `🖼️ *STICKER MAKER*\n\n`;
      caption += `Kirim/reply gambar atau video dengan caption:\n`;
      caption += `\`${prefix + command}\`\n\n`;
      caption += `*OPSI:*\n`;
      caption += `> \`--crop\` - Crop jadi kotak\n`;
      caption += `> \`--resize WxH\` - Resize ke ukuran\n`;
      caption += `> \`--circle\` - Bentuk lingkaran\n`;
      caption += `> \`--rounded\` - Sudut melengkung\n\n`;
      caption += `*CONTOH:*\n`;
      caption += `> \`${prefix + command} --crop\`\n`;
      caption += `> \`${prefix + command} --resize 256x256\`\n`;
      caption += `> \`${prefix + command} --circle\`\n`;
      caption += `> \`${prefix + command} Nama Pack|Author Name\` (custom sticker)`;
      return m.reply(caption);
    }

    let options = {
      crop: false,
      resize: null,
      circle: false,
      rounded: false,
      packname: null,
      author: null
    };
    
    let remainingText = text || '';

    if (remainingText.includes('--crop') || remainingText.includes('-c')) {
      options.crop = true;
      remainingText = remainingText.replace(/--crop|-c/g, '').trim();
    }
    if (remainingText.includes('--resize') || remainingText.includes('-r')) {
      const resizeMatch = remainingText.match(/--resize\s+(\d+x\d+)|-r\s+(\d+x\d+)/i);
      if (resizeMatch) {
        options.resize = resizeMatch[1] || resizeMatch[2];
        remainingText = remainingText.replace(/--resize\s+\d+x\d+|-r\s+\d+x\d+/i, '').trim();
      }
    }
    if (remainingText.includes('--circle')) {
      options.circle = true;
      remainingText = remainingText.replace('--circle', '').trim();
    }
    if (remainingText.includes('--rounded')) {
      options.rounded = true;
      remainingText = remainingText.replace('--rounded', '').trim();
    }

    if (remainingText.includes('|')) {
      const parts = remainingText.split('|');
      options.packname = parts[0].trim();
      options.author = parts[1] ? parts[1].trim() : null;
    } else if (remainingText.length > 0) {
      options.packname = remainingText.trim();
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const buffer = await q.download();

    const isVideo = /video/.test(msg.mimetype);
    if (isVideo) {
      const duration = msg.seconds || msg.duration || 0;
      if (duration > 10) return m.reply('⚠️ Video maksimal 10 detik!');
    }

    let finalBuffer = buffer;
    const hasProcessing = options.crop || options.resize || options.circle || options.rounded;

    if (hasProcessing && !isVideo) {
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const inputPath = path.join(tempDir, `sticker_in_${Date.now()}.png`);
      const outputPath = path.join(tempDir, `sticker_out_${Date.now()}.png`);
      
      fs.writeFileSync(inputPath, buffer);
      
      let filters = [];
      
      if (options.resize) {
        const [width, height] = options.resize.split('x').map(Number);
        filters.push(`scale=${width}:${height}:force_original_aspect_ratio=decrease`);
        filters.push(`pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`);
      }
      
      if (options.crop) {
        filters.push(`crop='min(iw,ih)':'min(iw,ih)'`);
        filters.push(`scale=512:512`);
      }
      
      if (options.circle) {
        filters.push(`format=rgba`);
        filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(pow(X-W/2,2)+pow(Y-H/2,2),pow(min(W,H)/2,2)),0,255)'`);
      }
      
      if (options.rounded) {
        const radius = 50;
        filters.push(`format=rgba`);
        filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(X,${radius})*lt(Y,${radius})*gt(pow(${radius}-X,2)+pow(${radius}-Y,2),pow(${radius},2)),0,if(gt(X,W-${radius})*lt(Y,${radius})*gt(pow(X-W+${radius},2)+pow(${radius}-Y,2),pow(${radius},2)),0,if(lt(X,${radius})*gt(Y,H-${radius})*gt(pow(${radius}-X,2)+pow(Y-H+${radius},2),pow(${radius},2)),0,if(gt(X,W-${radius})*gt(Y,H-${radius})*gt(pow(X-W+${radius},2)+pow(Y-H+${radius},2),pow(${radius},2)),0,255))))'`);
      }
      
      if (filters.length > 0) {
        const filterStr = filters.join(',');
        try {
          await execAsync(`ffmpeg -i "${inputPath}" -vf "${filterStr}" -y "${outputPath}" -loglevel quiet`);
          finalBuffer = fs.readFileSync(outputPath);
        } catch (ffmpegError) {
          console.error('FFmpeg error:', ffmpegError.message);
        }
      }

      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }

    let packname, author;
    
    if (options.packname && options.author) {
      packname = options.packname;
      author = options.author;
    } else if (options.packname && !options.author) {
      packname = options.packname;
      author = global.stickerPack?.author || global.ownername || 'Maker';
    } else {
      packname = global.stickerPack?.packname || global.botname || 'SXCWAMD';
      author = global.stickerPack?.author || global.ownername || 'lumnztyz6x';
    }

    let st = {
      packName: packname,
      packPublish: author
    };

    let stik;
    if (isVideo) {
      stik = await sticker.writeExif({ data: finalBuffer, type: 'video' }, { ...st });
    } else {
      stik = await sticker.writeExif({ data: finalBuffer }, { ...st });
    }
    
    await conn.sendMessage(m.chat, { sticker: stik }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error(e);
    m.reply('❌ Gagal membuat sticker: ' + e.message);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
  }
};

handler.command = /^(s|sticker|stiker|swm)$/i;
handler.help = ["s", "sticker", "stiker", "swm"];
handler.tags = ["sticker"];


handler.limit = 1;
export default handler;