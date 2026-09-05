let handler = async (m, { conn, args }) => {
    let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(() => ({})) : {};
    let participants = m.isGroup ? (groupMetadata.participants || []) : [];
    if (participants.length === 0) return m.reply('❌ Gagal mengambil daftar anggota grup!');
    
    if (!global.db?.data?.chats) global.db.data.chats = {};
    if (!global.db?.data?.users) global.db.data.users = {};

    let chatData = global.db.data.chats[m.chat] || {};
    let memberChat = chatData.memberChat || {};
    
    let users = participants.map(p => {
        let u = p.id || p.jid || '';
        let lid = p.lid || '';
        
        let count = global.db.data.users[u]?.chatGroup?.[m.chat]
                 || (lid ? global.db.data.users[lid]?.chatGroup?.[m.chat] : 0)
                 || memberChat[u]
                 || (lid ? memberChat[lid] : 0)
                 || 0;
                 
        let name = global.db.data.users[u]?.name || (lid ? global.db.data.users[lid]?.name : '') || p.name || '';
        let num = u.split('@')[0].split(':')[0];
        
        return {
            jid: u,
            num: num,
            chat: count,
            name: name
        };
    });
    
    users.sort((a, b) => b.chat - a.chat);
    
    let limit = args[0] ? parseInt(args[0]) : 50;
    if (isNaN(limit) || limit < 1) limit = 50;
    let topUsers = users.slice(0, limit);
    
    let totalMessages = users.reduce((acc, curr) => acc + curr.chat, 0);
    let activeMembers = users.filter(u => u.chat > 0).length;
    
    let text = `🏆 *TOTAL CHAT ANGGOTA GRUP* 🏆\n\n` +
               `📊 *Total Pesan Terdata:* ${totalMessages.toLocaleString()} pesan\n` +
               `👥 *Anggota Aktif:* ${activeMembers} / ${users.length}\n\n`;
    
    topUsers.forEach((u, i) => {
        let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        let nameStr = u.name ? ` (${u.name})` : '';
        text += `${medal} @${u.num}${nameStr} - *${u.chat.toLocaleString()}* pesan\n`;
    });
    
    if (users.length > limit) {
        text += `\n_Menampilkan ${limit} dari ${users.length} member. Ketik .totalchat 100 untuk melihat lebih banyak._`;
    }
    
    let mentions = topUsers.map(u => u.jid);
    await conn.sendMessage(m.chat, { text: text.trim(), mentions: mentions }, { quoted: m });
};

handler.help = ['totalchat [jumlah]'];
handler.command = /^(totalchat|totalchats)$/i;
handler.tags = ['info'];
handler.group = true;
handler.admin = true;

export default handler;
