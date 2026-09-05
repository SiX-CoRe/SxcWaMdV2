let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, usedPrefix, command }) => {
    if (!isAdmin) return m.reply('❌ *Perintah ini hanya untuk Admin grup!*');
    if (!isBotAdmin) return m.reply('❌ *Bot harus menjadi Admin grup terlebih dahulu!*');

    let target = m.mentionedJid?.[0] || m.quoted?.sender || null;

    if (!target && args[0]) {
        const pn = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        try {
            const lid = await conn.signalRepository?.lidMapping?.getLIDForPN?.(pn);
            if (lid) target = lid;
        } catch {
            const found = (participants || []).find(p => p.id?.includes(args[0].replace(/[^0-9]/g, "")));
            if (found) target = found.id;
        }
        if (!target && args[0].replace(/[^0-9]/g, "").length >= 5) {
            target = pn;
        }
    }

    if (!target) {
        return m.reply(
            `⚠️ *Penggunaan DelWarn*\n\n` +
            `📌 *Format:*\n` +
            `➤ ${usedPrefix + command} @user\n` +
            `➤ ${usedPrefix + command} <nomor>\n` +
            `➤ Reply pesan user + ${usedPrefix + command}`
        );
    }

    if (target === conn.user.jid) return m.reply('❌ *Tidak bisa menghapus warn bot!*');

    if (!global.db.data.users) global.db.data.users = {};
    let users = global.db.data.users[target] || global.db.data.users[target.split('@')[0] + '@s.whatsapp.net'];
    if (!users || !users.warn || users.warn === 0) {
        return m.reply(`✅ *User @${target.split('@')[0]} tidak memiliki catatan warn.*`, null, { mentions: [target] });
    }

    let targetName = users.name || target.split('@')[0] || 'User';
    try {
        const name = await conn.getName(target);
        if (name) targetName = name;
    } catch {}

    const oldWarn = users.warn;
    users.warn = 0;

    const msg = 
`╔══════════════════════════╗
║  ✅ *RESET WARNING SUKSES*  ║
╚══════════════════════════╝

┌───❖ *DETAIL ANGGOTA* ❖───
│
├─👤 *Nama:* ${targetName}
├─📱 *User:* @${target.split('@')[0]}
├─⚠️ *Warn Sebelumnya:* ${oldWarn}/3
├─✅ *Status Baru:* 0/3 (Bersih)
│
└─────────────────────────`;

    await conn.sendMessage(m.chat, { text: msg, mentions: [target] }, { quoted: m });
};

handler.help = ['delwarn <@user/nomor>'];
handler.tags = ['group'];
handler.command = /^(delwarn|deletewarn|resetwarn)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;