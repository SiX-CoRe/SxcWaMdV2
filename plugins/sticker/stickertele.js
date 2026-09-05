import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(
                `🎴 *STICKER TELEGRAM DOWNLOADER*\n\n` +
                `Download sticker pack dari Telegram.\n\n` +
                `*Contoh:*\n` +
                `${usedPrefix + command} HotCherry\n` +
                `${usedPrefix + command} https://t.me/addstickers/HotCherry\n\n` +
                `*Note:* Kirim nama atau link sticker pack Telegram`
            );
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let packName = text;
        if (text.includes('t.me/addstickers/')) {
            packName = text.split('/').pop();
        }

        const response = await axios({
            method: "POST",
            url: `${global.web}/api/downloader/stickertele`,
            params: {
                apikey: global.apikey.jereapi,
                url: `https://t.me/addstickers/${packName}`,
            },
            timeout: 30000,
        });

        const { data } = response.data;

        if (!data || !data.stickers || data.stickers.length === 0) {
            throw new Error('Sticker pack tidak ditemukan');
        }

        const packTitle = data.title || packName;
        const totalStickers = data.stickers.length;
        const stickerType = data.sticker_type === 'animated' ? 'Animasi' : 'Biasa';

        await m.reply(`📦 *${packTitle}*\n📊 *Total:* ${totalStickers} sticker\n🎭 *Tipe:* ${stickerType}\n⏳ *Mengirim sticker...*`);

        let successCount = 0;
        let failCount = 0;

        const packname = global.stickerPack?.packname || global.botname || 'Telegram Sticker';
        const author = global.stickerPack?.author || global.ownername || 'Telegram';

        for (let i = 0; i < data.stickers.length; i++) {
            try {
                const sticker = data.stickers[i];
                const stickerUrl = sticker.url || sticker.file_url;
                
                if (!stickerUrl) continue;

                const stickerRes = await axios.get(stickerUrl, {
                    responseType: 'arraybuffer',
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                let buffer = Buffer.from(stickerRes.data);

                const isAnimated = sticker.is_animated === true;
                const isVideo = sticker.is_video === true;

                const { default: stickerLib } = await import('@library/sticker.js');
                
                const metadata = {
                    packName: packname,
                    packPublish: author,
                    emojis: sticker.emoji ? [sticker.emoji] : ["😋"]
                };
                
                let stiker;
                if (isAnimated || isVideo) {

                    stiker = await stickerLib.writeExif({ data: buffer, mimetype: 'video/mp4' }, metadata);
                } else {

                    stiker = await stickerLib.writeExif({ data: buffer, mimetype: 'image/png' }, metadata);
                }
                
                await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
                successCount++;

                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (err) {
                console.log(`Sticker ${i + 1} gagal:`, err.message);
                failCount++;
            }
        }
        
        if (successCount === 0) {
            await m.reply(`❌ *Gagal mengirim sticker!*\n\n${failCount} sticker gagal diunduh`);
        } else {
            await m.reply(`✅ *Berhasil mengirim ${successCount} sticker dari ${packTitle}*${failCount > 0 ? `\n⚠️ ${failCount} sticker gagal` : ''}`);
        }
        
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        
        let errorMsg = "❌ Gagal mengambil sticker Telegram.\n\n";
        if (e.message.includes('timeout')) {
            errorMsg += "Server sedang sibuk, coba lagi nanti.";
        } else if (e.message.includes('not found')) {
            errorMsg += "Sticker pack tidak ditemukan. Periksa nama atau linknya.";
        } else {
            errorMsg += e.message;
        }
        
        m.reply(errorMsg);
    } finally {
        setTimeout(() => {
            conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
        }, 3000);
    }
};

handler.help = ["stickertele <nama_pack/link>"];
handler.tags = ["sticker"];
handler.command = /^(stickertele|steler|stikertg)$/i;


handler.limit = 1;
export default handler;