const afkCooldown = new Map();

function formatDuration(ms) {
    let d = Math.floor(ms / (24 * 60 * 60 * 1000));
    let h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    let s = Math.floor((ms % (60 * 1000)) / 1000);

    let parts = [];
    if (d > 0) parts.push(`${d} hari`);
    if (h > 0) parts.push(`${h} jam`);
    if (m > 0) parts.push(`${m} menit`);
    if (s > 0 || parts.length === 0) parts.push(`${s} detik`);
    return parts.join(' ');
}

export async function before(m, { conn }) {
    if (!m.isGroup) return true;
    if (m.fromMe || m.key?.fromMe || m.isBaileys) return true;
    if (!global.db?.data?.users) return true;

    const sender = m._normSender || m.sender;
    let user = global.db.data.users[sender] || global.db.data.users[sender.split('@')[0] + '@s.whatsapp.net'];

    // 1. Jika pengirim sebelumnya sedang AFK, lepaskan status AFK otomatis saat dia chat
    if (user && user.afk > -1) {
        if (m.text && /^[.!#/]afk/i.test(m.text.trim())) return true;

        let afkDuration = formatDuration(+new Date - user.afk);
        let afkReason = user.afkReason || 'Tanpa Alasan';
        
        user.afk = -1;
        user.afkReason = '';

        let text = `✨ *@${sender.split('@')[0]} telah kembali online!*\n` +
                   `⏱️ *Durasi AFK:* ${afkDuration}\n` +
                   `📝 *Alasan Sebelumnya:* ${afkReason}`;

        await conn.sendMessage(m.chat, { 
            text: text, 
            mentions: [sender] 
        }, { quoted: m });
    }

    // Jangan trigger peringatan AFK jika pesan berupa command bot (.totalchat, .tagall, .hidetag, dll)
    if (m.text && /^[.!#/]/i.test(m.text.trim())) return true;

    // 2. Jika ada member lain yang men-tag atau me-reply pesan user yang sedang AFK
    let jids = [...(m.mentionedJid || [])];
    if (m.quoted && m.quoted.sender) {
        jids.push(m.quoted.sender);
    }

    let notifiedJids = new Set();
    const now = Date.now();

    for (let jid of jids) {
        if (!jid) continue;
        let rawJid = String(jid).replace(/:\d+/, '');
        if (rawJid === sender) continue;
        if (notifiedJids.has(rawJid)) continue;

        // Cek cooldown notifikasi per user per grup (30 detik) agar tidak spam
        const cdKey = `${m.chat}_${rawJid}`;
        if (afkCooldown.has(cdKey) && (now - afkCooldown.get(cdKey) < 30000)) {
            continue;
        }

        let targetUser = global.db.data.users[rawJid] || global.db.data.users[rawJid.split('@')[0] + '@s.whatsapp.net'];
        if (targetUser && targetUser.afk > -1) {
            notifiedJids.add(rawJid);
            afkCooldown.set(cdKey, now);

            let afkDuration = formatDuration(+new Date - targetUser.afk);
            let afkReason = targetUser.afkReason || 'Tanpa Alasan';

            let name = targetUser.name || (rawJid.split('@')[0])
            let warnText = `⚠️ *Ssssttt! Jangan tag dia!*\n\n` +
                           `👤 *${name} sedang AFK*\n` +
                           `📝 *Alasan:* ${afkReason}\n` +
                           `⏱️ *Sejak:* ${afkDuration} yang lalu`;

            await conn.sendMessage(m.chat, { 
                text: warnText
            }, { quoted: m });
        }
    }

    return true;
}
