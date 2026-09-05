import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getBlock(level) {
    const value = Math.min(Math.max(Number(level) || 12, 1), 40);
    return 41 - value;
}

async function pixelArtImage(imageBuffer, pixelLevel = 30) {
    try {
        const sharp = (await import('sharp')).default;
        const image = sharp(imageBuffer, { limitInputPixels: false }).rotate().ensureAlpha();
        const meta = await image.metadata();

        const width = meta.width;
        const height = meta.height;
        const block = getBlock(pixelLevel);

        const input = await image.raw().toBuffer();
        const output = Buffer.alloc(input.length);

        for (let y = 0; y < height; y += block) {
            for (let x = 0; x < width; x += block) {
                let r = 0;
                let g = 0;
                let b = 0;
                let a = 0;
                let count = 0;

                const maxY = Math.min(y + block, height);
                const maxX = Math.min(x + block, width);

                for (let yy = y; yy < maxY; yy++) {
                    for (let xx = x; xx < maxX; xx++) {
                        const i = (yy * width + xx) * 4;
                        r += input[i];
                        g += input[i + 1];
                        b += input[i + 2];
                        a += input[i + 3];
                        count++;
                    }
                }

                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                a = Math.round(a / count);

                for (let yy = y; yy < maxY; yy++) {
                    for (let xx = x; xx < maxX; xx++) {
                        const i = (yy * width + xx) * 4;
                        output[i] = r;
                        output[i + 1] = g;
                        output[i + 2] = b;
                        output[i + 3] = a;
                    }
                }
            }
        }

        const resultBuffer = await sharp(output, {
            raw: {
                width,
                height,
                channels: 4
            }
        })
        .png({
            compressionLevel: 9,
            adaptiveFiltering: false
        })
        .toBuffer();

        return {
            status: true,
            buffer: resultBuffer,
            width,
            height,
            blockSize: block
        };
    } catch (e) {
        return {
            status: false,
            error: e.message
        };
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = q?.msg?.mimetype || q?.mimetype || "";

        if (!/image/.test(mime)) {
            return m.reply(
                `🎨 *PIXEL ART MAKER*\n\n` +
                `Ubah gambar menjadi pixel art.\n\n` +
                `*Contoh:*\n` +
                `${usedPrefix + command} (reply gambar)\n` +
                `${usedPrefix + command} 20 (reply gambar)\n\n` +
                `*Level pixel:* 1-40 (semakin kecil, semakin pixelated)\n` +
                `*Default:* 30`
            );
        }

        let pixelLevel = 30;
        if (text && !isNaN(text)) {
            pixelLevel = parseInt(text);
            if (pixelLevel < 1) pixelLevel = 1;
            if (pixelLevel > 40) pixelLevel = 40;
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const buffer = await q.download();
        
        await conn.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });

        const result = await pixelArtImage(buffer, pixelLevel);

        if (!result.status) {
            throw new Error(result.error);
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        await conn.sendMessage(m.chat, {
            image: result.buffer,
            caption: `✅ *PIXEL ART BERHASIL*\n\n` +
                     `📐 *Level:* ${pixelLevel} (block size: ${result.blockSize}px)\n` +
                     `📏 *Resolusi:* ${result.width}x${result.height}\n` +
                     `🔗 *Request by:* ${m.pushName || 'User'}`
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ Gagal membuat pixel art: ${e.message}`);
    } finally {
        setTimeout(() => {
            conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
        }, 3000);
    }
};


handler.help = ["topixel <level>"];
handler.tags = ["maker"];
handler.command = /^(pixelart|pixel)$/i;


handler.limit = true;handler.limit = 1;
export default handler;