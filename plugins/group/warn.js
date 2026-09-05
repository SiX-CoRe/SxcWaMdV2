let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, usedPrefix, command }) => {
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
            `⚠️ *Penggunaan Command Warn*\n\n` +
            `📌 *Format:*\n` +
            `➤ ${usedPrefix + command} @user [alasan]\n` +
            `➤ ${usedPrefix + command} <nomor> [alasan]\n` +
            `➤ Reply pesan user + ${usedPrefix + command} [alasan]\n\n` +
            `📊 *Fitur:*\n` +
            `• Warn 1-2: Peringatan\n` +
            `• Warn 3: Otomatis di-Kick dari grup`
        );
    }

    if (target === conn.user.jid || target === String(conn.user?.jid || conn.user?.id).replace(/:\d+/, '')) {
        return m.reply('❌ *Tidak dapat memberikan peringatan kepada Bot!*');
    }
    
    let isTargetAdmin = (participants || []).find(p => p.id === target || p.lid === target)?.admin;
    if (isTargetAdmin && !isOwner) {
        return m.reply('❌ *Tidak dapat memberikan peringatan kepada sesama Admin!*');
    }

    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[target]) {
        global.db.data.users[target] = {
            warn: 0,
            name: target.split('@')[0] || 'User'
        };
    }
    let users = global.db.data.users[target];

    let reason = args.slice(1).join(' ') || 'Melanggar peraturan grup';
    users.warn = (users.warn || 0) + 1;
    const warnCount = users.warn;

    let targetName = users.name || target.split('@')[0] || 'User';
    try {
        const name = await conn.getName(target);
        if (name) targetName = name;
    } catch {}

    const now = new Date();
    const wibDate = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayName = days[wibDate.getUTCDay()];
    const date = wibDate.getUTCDate();
    const month = months[wibDate.getUTCMonth()];
    const year = wibDate.getUTCFullYear();
    let hours = wibDate.getUTCHours();
    const minutes = wibDate.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const time = `${dayName}, ${date} ${month} ${year} - ${hours}:${minutes} ${ampm} WIB`;

    const warnEmoji = warnCount === 1 ? '⚠️' : warnCount === 2 ? '⚡' : '💀';

    if (warnCount >= 3) {
        users.warn = 0;
        const kickMsg = 
`╔══════════════════════════╗
║  🚫 *WARNING SYSTEM - KICK* 🚫  ║
╚══════════════════════════╝

┌───❖ *USER DIKELUARKAN* ❖───
│
├─👤 *Nama:* ${targetName}
├─📱 *User:* @${target.split('@')[0]}
├─⚠️ *Peringatan:* 3/3 (Batas Maksimal)
├─📝 *Alasan:* ${reason}
├─📅 *Waktu:* ${time}
│
└─────────────────────────

💀 *User telah otomatis dikeluarkan dari grup karena mencapai 3 peringatan!*`;

        await conn.sendMessage(m.chat, { text: kickMsg, mentions: [target] }, { quoted: m });
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
        } catch (e) {
            conn.logger?.error(e);
        }
    } else {
        const warnMsg = 
`╔══════════════════════════╗
║  ${warnEmoji} *WARNING SYSTEM* ${warnEmoji}  ║
╚══════════════════════════╝

┌───❖ *DETAIL PERINGATAN* ❖───
│
├─👤 *Nama:* ${targetName}
├─📱 *User:* @${target.split('@')[0]}
├─⚠️ *Warn:* ${warnCount}/3
├─📝 *Alasan:* ${reason}
├─📅 *Waktu:* ${time}
│
└─────────────────────────

📊 *Sisa Kesempatan:* ${3 - warnCount} peringatan lagi sebelum di-Kick!`;

        await conn.sendMessage(m.chat, { text: warnMsg, mentions: [target] }, { quoted: m });
    }
};

handler.help = ['warn <@user/nomor> [alasan]'];
handler.tags = ['group'];
handler.command = /^(warn|warning)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;