import { promises as fs } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import os from 'os';
import { webp2png, webp2mp4 } from '../../lib/webp2mp4.js';

function ffmpegConvert(buffer, args = [], ext = 'webp', ext2 = 'png') {
    return new Promise(async (resolve, reject) => {
        const filename = `toimg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const tmp = join(os.tmpdir(), `${filename}.${ext}`);
        const out = join(os.tmpdir(), `${filename}.${ext2}`);

        try {
            await fs.writeFile(tmp, buffer);
            const proc = spawn('ffmpeg', ['-y', '-i', tmp, ...args, out]);

            let stderrData = '';
            proc.stderr.on('data', (d) => {
                stderrData += d.toString();
            });

            proc.on('error', (err) => {
                try { fs.unlink(tmp).catch(() => {}); } catch (_) {}
                reject(err);
            });

            proc.on('close', async (code) => {
                try { await fs.unlink(tmp).catch(() => {}); } catch (_) {}
                if (code !== 0) {
                    return reject(new Error(`FFmpeg exited code ${code}: ${stderrData.slice(-300)}`));
                }
                try {
                    const data = await fs.readFile(out);
                    try { await fs.unlink(out).catch(() => {}); } catch (_) {}
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        } catch (e) {
            try { await fs.unlink(tmp).catch(() => {}); } catch (_) {}
            reject(e);
        }
    });
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    if (!/webp/i.test(mime)) {
        return m.reply(`⚠️ *Format Salah!*\n\nBalas/Reply stiker yang ingin diubah ke gambar/video dengan perintah:\n*${usedPrefix + command}*`);
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    let media;
    try {
        media = await q.download();
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ Gagal mengunduh stiker: ${e.message}`);
    }

    if (!media || !Buffer.isBuffer(media)) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return m.reply('❌ Gagal membaca data stiker.');
    }

    const isAnimated = Boolean(q.isAnimated || q.msg?.isAnimated);

    // 1. Jika Stiker Bergerak (Animated Sticker)
    if (isAnimated || command === 'tovideo' || command === 'tovid' || command === 'togif') {
        try {
            // Method 1: Local FFmpeg to MP4
            const videoBuffer = await ffmpegConvert(media, [
                '-pix_fmt', 'yuv420p',
                '-c:v', 'libx264',
                '-movflags', '+faststart',
                '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'
            ], 'webp', 'mp4');

            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: '✅ *Berhasil convert stiker animasi ke video!*'
            }, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            return;
        } catch (errFfmpeg) {
            console.error('[toimg animated ffmpeg error]', errFfmpeg.message);
            // Fallback Method 2: webp2mp4 cloud converter
            try {
                const outUrl = await webp2mp4(media);
                await conn.sendMessage(m.chat, {
                    video: { url: outUrl },
                    caption: '✅ *Berhasil convert stiker animasi ke video!*'
                }, { quoted: m });
                await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                return;
            } catch (errWebp) {
                console.error('[toimg animated ezgif error]', errWebp.message);
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                return m.reply(`❌ *Gagal convert stiker animasi ke video!*`);
            }
        }
    }

    // 2. Jika Stiker Statis (Biasa)
    try {
        // Method 1: Local FFmpeg to PNG with single-frame flag
        const imgBuffer = await ffmpegConvert(media, [
            '-vframes', '1'
        ], 'webp', 'png');

        await conn.sendMessage(m.chat, {
            image: imgBuffer,
            caption: '✅ *Berhasil convert stiker ke gambar!*'
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (errFfmpeg) {
        console.error('[toimg static ffmpeg error 1]', errFfmpeg.message);
        try {
            // Method 2: Local FFmpeg without extra flags
            const imgBuffer = await ffmpegConvert(media, [], 'webp', 'png');
            await conn.sendMessage(m.chat, {
                image: imgBuffer,
                caption: '✅ *Berhasil convert stiker ke gambar!*'
            }, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } catch (errFfmpeg2) {
            console.error('[toimg static ffmpeg error 2]', errFfmpeg2.message);
            // Fallback Method 3: webp2png cloud converter
            try {
                const outUrl = await webp2png(media);
                await conn.sendMessage(m.chat, {
                    image: { url: outUrl },
                    caption: '✅ *Berhasil convert stiker ke gambar!*'
                }, { quoted: m });
                await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            } catch (errWebp) {
                console.error('[toimg static ezgif error]', errWebp.message);
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                m.reply(`❌ *Gagal convert stiker ke gambar:* Pastikan format stiker valid.`);
            }
        }
    }
};

handler.help = ['toimg (reply sticker)', 'toimage (reply sticker)', 'tovideo (reply animated sticker)'];
handler.tags = ['tools', 'sticker'];
handler.command = /^(toimg|toimage|tovid|togif|tovideo)$/i;

handler.limit = true;
export default handler;
