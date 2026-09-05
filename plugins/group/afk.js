let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!global.db.data.users) global.db.data.users = {};
    let sender = m._normSender || m.sender;
    if (!global.db.data.users[sender]) global.db.data.users[sender] = {};
    let user = global.db.data.users[sender];
    
    let reason = text ? text.trim() : 'Tanpa Alasan';
    user.afk = +new Date;
    user.afkReason = reason;

    let caption = `😴 *@${sender.split('@')[0]} sekarang sedang AFK!*\n\n` +
                  `📝 *Alasan:* ${reason}\n` +
                  `💤 _Jangan tag dia sampai kembali online ya!_`;

    await conn.sendMessage(m.chat, { 
        text: caption, 
        mentions: [sender] 
    }, { quoted: m });
};

handler.help = ['afk [alasan]'];
handler.tags = ['group'];
handler.command = /^afk$/i;
handler.group = true;

export default handler;
