let handler = async (m, { conn, groupMetadata }) => {
    if (!m.isGroup) return m.reply('❌ Perintah ini hanya bisa digunakan di dalam grup!');

    const groupName = groupMetadata?.subject || 'Unknown Group';
    const groupId = m.chat;

    const info = `🆔 *GROUP ID CHECKER*\n\n` +
                 `📛 *Nama Grup:* ${groupName}\n` +
                 `🔑 *Group ID:* \`\`\`${groupId}\`\`\``;

    try {
        await conn.sendButton(
            m.chat,
            {
                text: info,
                title: 'Group ID',
                footer: 'Tap tombol di bawah untuk menyalin ID grup',
                buttons: [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📋 Salin ID Grup',
                            copy_code: groupId
                        })
                    }
                ],
                hasMediaAttachment: false
            },
            { quoted: m }
        );
    } catch {
        await m.reply(info.trim());
    }
};

handler.help = ['idgc', 'cekidgc'];
handler.tags = ['group'];
handler.command = /^(idgc|cekidgc|groupid)$/i;
handler.group = true;

export default handler;