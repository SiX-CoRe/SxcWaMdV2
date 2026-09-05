let handler = async (m, { conn, args, participants, usedPrefix, command }) => {
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
            `⚠️ *Penggunaan Cek Warn*\n\n` +
            `📌 *Format:*\n` +
            `➤ ${usedPrefix + command} @user\n` +
            `➤ ${usedPrefix + command} <nomor>\n` +
            `➤ Reply pesan user + ${usedPrefix + command}\n\n` +
            `📊 *Informasi:*\n` +
            `• Warn 1-2: Peringatan\n` +
            `• Warn 3: Otomatis di-Kick`
        );
    }

    if (!global.db.data.users) global.db.data.users = {};
    let users = global.db.data.users[target] || global.db.data.users[target.split('@')[0] + '@s.whatsapp.net'];
    let targetName = users?.name || target.split('@')[0] || 'User';
    try {
        const name = await conn.getName(target);
        if (name) targetName = name;
    } catch {}

    const warnCount = users?.warn || 0;
    const status = warnCount === 0 ? '✅ Bersih (Tidak ada peringatan)' : 
                   warnCount === 1 ? '⚠️ 1 Peringatan' : 
                   warnCount === 2 ? '⚡ 2 Peringatan (Hati-hati!)' : 
                   '💀 3 Peringatan (Maksimal!)';

    const msg = 
`╔══════════════════════════╗
║  📊 *CEK STATUS WARNING*  ║
╚══════════════════════════╝

┌───❖ *DETAIL ANGGOTA* ❖───
│
├─👤 *Nama:* ${targetName}
├─📱 *User:* @${target.split('@')[0]}
├─⚠️ *Jumlah Warn:* ${warnCount}/3
├─📊 *Status:* ${status}
│
└─────────────────────────

💡 *Pemberitahuan:* Akun akan otomatis dikeluarkan jika mencapai 3 warn!`;

    await conn.sendMessage(m.chat, { text: msg, mentions: [target] }, { quoted: m });
};

handler.help = ['cekwarn <@user/nomor>'];
handler.tags = ['group'];
handler.command = /^(cekwarn|statuswarn|warnstatus)$/i;
handler.group = true;

export default handler;