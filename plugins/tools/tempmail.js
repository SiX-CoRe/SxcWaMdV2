import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`📧 *TEMPORARY EMAIL SERVICE*\n\n*Cara Pakai:*\n• *${usedPrefix + command} create* -> Buat alamat email sementara baru\n• *${usedPrefix + command} check <email>* -> Cek inbox / kotak masuk email\n\n*Contoh:*\n${usedPrefix + command} create\n${usedPrefix + command} check abcdef12345@temp-mail.io`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let args = text.trim().split(' ');
        let action = args[0].toLowerCase();
        let apiKey = global.apikey?.jereapi;

        if (action === 'create' || action === 'new') {
            let res = await fetch(`${global.web}/api/tools/tempmail?apikey=${apiKey}&action=create`);
            let json = await res.json();
            if (!json.status || !json.email) throw new Error(json.error || "Gagal membuat email");

            let caption = `📧 *EMAIL SEMENTARA BARU*\n\n`;
            caption += `📬 *Email:* ${json.email}\n\n`;
            caption += `💡 *Cara Cek Inbox:*\nKetik: *${usedPrefix + command} check ${json.email}*\n\n`;
            caption += `✅ *Request by:* ${m.pushName || 'User'}`;

            await m.reply(caption);
        } else if (action === 'check' || action === 'inbox') {
            let email = args[1];
            if (!email) return m.reply(`⚠️ Masukkan email yang ingin dicek!\nContoh: *${usedPrefix + command} check email@temp.io*`);

            let res = await fetch(`${global.web}/api/tools/tempmail?apikey=${apiKey}&action=inbox&email=${encodeURIComponent(email)}`);
            let json = await res.json();
            if (!json.status) throw new Error(json.error || "Gagal memeriksa kotak masuk.");

            let messages = json.messages || [];
            if (messages.length === 0) {
                return m.reply(`📭 *Kotak masuk kosong!*\nBelum ada pesan yang masuk ke email ${email}.`);
            }

            let caption = `📬 *KOTAK MASUK TEMPMAIL (${messages.length} Pesan)*\n\n`;
            messages.forEach((msg, i) => {
                caption += `*[${i + 1}] Dari:* ${msg.from}\n`;
                caption += `📌 *Subjek:* ${msg.subject}\n`;
                if (msg.otp) caption += `🔑 *Kode OTP:* ${msg.otp}\n`;
                caption += `📅 *Waktu:* ${msg.date}\n`;
                caption += `📝 *Isi Pesan:*\n${msg.body}\n`;
                if (msg.links && msg.links.length > 0) {
                    caption += `🔗 *Link:* ${msg.links.slice(0, 2).join('\n')}\n`;
                }
                caption += `────────────────────\n`;
            });
            caption += `\n✅ *Request by:* ${m.pushName || 'User'}`;

            await m.reply(caption);
        } else {
            return m.reply(`⚠️ Aksi tidak dikenali! Gunakan *create* atau *check <email>*.`);
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Tempmail Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['tempmail create', 'tempmail check <email>'];
handler.tags = ['tools'];
handler.command = /^(tempmail|emailsementara|tempmailio)$/i;

handler.limit = 1;
export default handler;
