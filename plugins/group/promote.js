let handler = async (m, { conn, args, participants, usedPrefix, command }) => {
    try {
        let target = m.mentionedJid?.[0] || m.quoted?.sender || null;

        if (!target && args[0]) {
            const raw = args[0].replace(/[^0-9]/g, "");
            if (raw.length >= 5) {
                const pn = raw + "@s.whatsapp.net";
                try {
                    const lid = await conn.signalRepository?.lidMapping?.getLIDForPN?.(pn);
                    if (lid) target = lid;
                } catch {
                    const found = (participants || []).find((p) => p.id?.includes(raw));
                    if (found) target = found.id;
                }
                if (!target) target = pn;
            }
        }

        if (!target) {
            return m.reply(
                `⚠️ *Penggunaan Command ${command.toUpperCase()}*\n\n` +
                `📌 *Format:* ${usedPrefix + command} @user atau <nomor>\n` +
                `👉 *Contoh:* ${usedPrefix + command} 6281234567890\n` +
                `Atau reply pesan user yang ingin di-${command}.`
            );
        }

        const isDemote = /demote|turun/i.test(command);
        const action = isDemote ? "demote" : "promote";

        await conn.groupParticipantsUpdate(m.chat, [target], action);

        const actionText = isDemote ? "diturunkan dari Admin" : "diangkat menjadi Admin";
        const emoji = isDemote ? "📉" : "👑";

        await conn.sendMessage(
            m.chat,
            {
                text: `${emoji} Berhasil! @${target.split("@")[0]} sekarang telah ${actionText}.`,
                mentions: [target],
            },
            { quoted: m }
        );
    } catch (e) {
        conn.logger?.error(e);
        m.reply(`❌ Gagal: ${typeof e === 'string' ? e : (e.message || String(e))}`);
    }
};

handler.help = ["promote <@user/nomor>", "demote <@user/nomor>"];
handler.tags = ["group"];
handler.command = /^(promote|demote|admin|unadmin)$/i;
handler.group = true;
handler.botAdmin = true;
handler.admin = true;

export default handler;
