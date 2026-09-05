let handler = async (m, { conn, command, usedPrefix }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) return m.reply(`⚠️ Balas media audio/video/foto dengan perintah *${usedPrefix + command}*`);

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh media.");

        switch (command) {
            case 'toaudio':
            case 'tomp3':
                await conn.sendMessage(m.chat, {
                    audio: media,
                    mimetype: 'audio/mp4',
                    fileName: `audio_${Date.now()}.mp3`
                }, { quoted: m });
                break;

            case 'toptt':
            case 'tovn':
                await conn.sendMessage(m.chat, {
                    audio: media,
                    mimetype: 'audio/mp4',
                    ptt: true
                }, { quoted: m });
                break;

            case 'tovideo':
            case 'tomp4':
                await conn.sendMessage(m.chat, {
                    video: media,
                    caption: "✅ Berhasil dikonversi ke video!"
                }, { quoted: m });
                break;

            default:
                m.reply("Perintah tidak dikenali");
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['toaudio (reply video/vn)', 'tovn (reply audio)', 'tovideo (reply gif)'];
handler.tags = ['tools'];
handler.command = /^(toaudio|tomp3|toptt|tovn|tovideo|tomp4)$/i;

handler.limit = 1;
export default handler;
