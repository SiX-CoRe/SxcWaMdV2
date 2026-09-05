import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let target = m.quoted?.sender || null;

    if (!target && args[0]) {
        const raw = args[0].replace(/[^0-9]/g, "");
        if (raw.length >= 5) {
            target = raw + "@s.whatsapp.net";
        }
    }

    if (!target || !target.endsWith("@s.whatsapp.net")) {
        return m.reply(
            `⚠️ *Penggunaan Command Add*\n\n` +
            `📌 *Format:* ${usedPrefix + command} <nomor>\n` +
            `👉 *Contoh:* ${usedPrefix + command} 6281234567890\n` +
            `Atau reply pesan user yang ingin ditambahkan.`
        );
    }

    try {
        const result = await conn.groupParticipantsUpdate(m.chat, [target], "add");
        const userResult = result?.[0];

        if (userResult?.status === "200" || !userResult?.status) {
            return await conn.sendMessage(
                m.chat,
                {
                    text: `✅ Berhasil menambahkan @${target.split("@")[0]} ke dalam grup!`,
                    mentions: [target],
                },
                { quoted: m }
            );
        } else if (userResult?.status === "403") {
            const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({}));
            const inviteCode = await conn.groupInviteCode(m.chat).catch(() => null);
            const groupName = groupMetadata?.subject || "Grup";
            const inviteExpiration = Date.now() + 3 * 24 * 60 * 60 * 1000;

            let jpegThumbnail = null;
            try {
                const profilePic = await conn.profilePictureUrl(m.chat, "image").catch(() => null);
                if (profilePic) {
                    const response = await fetch(profilePic);
                    const buffer = await response.arrayBuffer();
                    jpegThumbnail = Buffer.from(buffer);
                }
            } catch (e) {
                conn.logger?.warn({ err: e.message }, "Failed to fetch group thumbnail");
            }

            if (inviteCode && typeof conn.sendInviteGroup === 'function') {
                await conn.sendInviteGroup(
                    m.chat,
                    target,
                    inviteCode,
                    inviteExpiration,
                    groupName,
                    `Undangan untuk bergabung ke grup ${groupName}`,
                    jpegThumbnail,
                    { mentions: [target] }
                );
            }

            return await conn.sendMessage(
                m.chat,
                {
                    text: `📩 Tidak dapat menambahkan @${target.split("@")[0]} secara langsung (privasi). Undangan grup telah dikirim ke chat pribadi user.`,
                    mentions: [target],
                },
                { quoted: m }
            );
        } else {
            return m.reply(`❌ Gagal menambahkan member. Status: ${userResult?.status || "unknown"}`);
        }
    } catch (e) {
        conn.logger?.error(e);
        return m.reply(typeof e === 'string' ? e : (e.message || String(e)));
    }
};

handler.help = ["add <nomor>"];
handler.tags = ["group"];
handler.command = /^(add|tambah)$/i;
handler.group = true;
handler.botAdmin = true;
handler.admin = true;

export default handler;