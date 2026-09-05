let handler = async (m, { conn, text, usedPrefix, command }) => {
    let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
    let match = (text || '').match(linkRegex);

    if (!match) {
        return m.reply(`🔍 *WHATSAPP LINK INSPECTOR*\n\nPeriksa informasi grup WhatsApp via link undangan!\nContoh:\n${usedPrefix + command} https://chat.whatsapp.com/xxxx`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let inviteCode = match[1];
        let info = await conn.groupGetInviteInfo(inviteCode);

        let caption = `🔍 *INFORMASI GRUP WHATSAPP*\n\n`;
        caption += `📌 *Nama Grup:* ${info.subject}\n`;
        caption += `🆔 *Group JID:* ${info.id}@g.us\n`;
        caption += `👑 *Owner:* ${info.owner ? '@' + info.owner.split('@')[0] : 'Tidak diketahui'}\n`;
        caption += `👥 *Jumlah Member:* ${info.size || '-'}\n`;
        caption += `📅 *Dibuat:* ${info.creation ? new Date(info.creation * 1000).toLocaleString('id-ID') : '-'}\n`;
        caption += `🔒 *Status:* ${info.isCommunity ? 'Komunitas' : 'Grup Standar'}\n`;
        if (info.desc) caption += `📝 *Deskripsi:*\n${info.desc}\n`;
        caption += `\n✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Inspect Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['inspect <link grup wa>', 'cekgrup <link grup>'];
handler.tags = ['tools'];
handler.command = /^(inspect|cekgrup|groupinfo|inspectgroup)$/i;

handler.limit = 1;
export default handler;
