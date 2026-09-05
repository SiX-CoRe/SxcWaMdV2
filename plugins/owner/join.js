let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    if (!isOwner) return m.reply('Fitur ini khusus owner bot!');
    
    let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
    let [_, code] = text.match(linkRegex) || [];
    
    if (!code) {
        return m.reply(`⚠️ Masukkan link grup WhatsApp!\nContoh: ${usedPrefix + command} https://chat.whatsapp.com/xxx`);
    }

    try {
        let res = await conn.groupAcceptInvite(code);
        m.reply(`✅ Berhasil join ke grup!`);
    } catch (e) {
        m.reply(`❌ Gagal join ke grup. Pastikan link valid dan bot belum dibanned dari grup tersebut.`);
    }
}
handler.help = ['join <link>'];
handler.command = ['join', 'joingc'];
handler.tags = ['owner'];
handler.owner = true;

export default handler;
