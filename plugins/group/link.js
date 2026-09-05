let handler = async (m, { conn, groupMetadata }) => {
    try {
        const invite = await conn.groupInviteCode(m.chat);
        const link = `https://chat.whatsapp.com/${invite}`;
        const groupName = groupMetadata?.subject || 'Unknown Group';
        const info = `🔗 *LINK GRUP WHATSAPP*\n\n` +
                     `📛 *Nama Grup:* ${groupName}\n` +
                     `🔑 *Group ID:* \`\`\`${m.chat}\`\`\`\n` +
                     `🌐 *Link Undangan:*\n${link}`;

        try {
            await conn.sendButton(m.chat, {
                text: info,
                title: "Group Link",
                footer: "Gunakan tombol di bawah untuk menyalin tautan grup",
                buttons: [
                    {
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📋 Salin Link Grup",
                            copy_code: link,
                        }),
                    },
                ],
                hasMediaAttachment: false,
            }, { quoted: m });
        } catch {
            await m.reply(info);
        }
    } catch (e) {
        conn.logger?.error(e);
        m.reply(typeof e === 'string' ? e : (e.message || String(e)));
    }
};

handler.help = ["grouplink", "linkgc"];
handler.tags = ["group"];
handler.command = /^(grouplink|link|linkgc)$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
