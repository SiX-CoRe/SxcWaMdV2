let handler = async (m, { conn, text, usedPrefix, command }) => {
    let target = m.mentionedJid?.[0] || m.quoted?.sender || null;
    if (!target) {
        const args = (text || '').trim().split(/\s+/);
        if (args[0]) {
            const cleanNumber = args[0].replace(/[^0-9]/g, '');
            if (cleanNumber.length >= 7) target = cleanNumber + '@s.whatsapp.net';
        }
    }
    if (!target) target = m._normSender || m.sender;

    target = String(target).replace(/:\d+/, '');

    // Resolusi LID ke Nomor Telepon jika target berupa LID
    if (target.endsWith('@lid')) {
        try {
            let realJid = null;
            if (m.isGroup) {
                let groupMetadata = (conn.chats?.[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(() => null);
                let p = groupMetadata?.participants?.find(u => u.lid === target || u.id === target);
                if (p?.id && p.id.endsWith('@s.whatsapp.net')) realJid = p.id;
            }
            if (!realJid) {
                let pn = await conn?.signalRepository?.lidMapping?.getPNForLID(target).catch(() => null);
                if (pn) realJid = pn;
            }
            if (realJid) target = realJid.replace(/:\d+/, '');
        } catch (_) {}
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }).catch(() => {});
        
        let pp = await conn.profilePictureUrl(target, 'image').catch(() => null);
        if (!pp) {
            pp = await conn.profilePictureUrl(target.split('@')[0] + '@s.whatsapp.net', 'image').catch(() => null);
        }

        if (!pp) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            return m.reply(`❌ *Foto Profil Tidak Ditemukan!*\n\nTarget *@${target.split('@')[0]}* tidak memasang foto profil atau foto profil disembunyikan oleh setelan privasi WhatsApp.`, null, { mentions: [target] });
        }

        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: `👤 *PROFILE PICTURE*\n\n📌 *Target:* @${target.split('@')[0]}`,
            mentions: [target]
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } }).catch(() => {});
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply(`❌ *Gagal mengambil foto profil:* ${e.message || 'Privasi foto profil aktif'}`);
    }
};

handler.help = ['getpp', 'getprofile', 'pp'];
handler.tags = ['tools'];
handler.command = /^(getpp|getprofile|pp|avatar)$/i;

handler.limit = 1;
export default handler;
