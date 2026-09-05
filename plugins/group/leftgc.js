let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('❌ Perintah ini hanya untuk grup!');
    
    if (!isAdmin && !isOwner) {
        return m.reply('❌ Perintah ini hanya untuk Admin grup atau Owner bot!');
    }

    const args = (text || '').trim().split(/\s+/);
    const action = args[0]?.toLowerCase();

    if (command === 'leavegc' || command === 'out' || command === 'botleave' || action === 'bot' || !action) {
        await m.reply('👋 *Selamat tinggal semuanya!* Bot izin keluar dari grup ini.');
        try {
            await conn.groupLeave(m.chat);
        } catch (e) {
            m.reply(`❌ Gagal keluar grup: ${e.message || e}`);
        }
        return;
    }

    if (action === '--all' || (action === 'kick' && args[1] === '--all')) {
        if (!isOwner) return m.reply("❌ Fitur kick all hanya dapat digunakan oleh Owner bot demi keamanan!");
        if (!isBotAdmin) return m.reply("❌ Bot harus menjadi Admin grup!");

        await m.reply('⏳ Memproses pembersihan semua member non-admin...');
        
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const participants = groupMetadata?.participants || [];
            
            let kicked = 0;
            let failed = 0;
            
            for (const participant of participants) {
                const jid = participant.id;
                if (jid === conn.user.jid || participant.admin) continue;
                
                try {
                    await conn.groupParticipantsUpdate(m.chat, [jid], 'remove');
                    kicked++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch {
                    failed++;
                }
            }
            
            await m.reply(`✅ Selesai! Berhasil kick ${kicked} member.\nGagal: ${failed} member.`);
        } catch (e) {
            m.reply(`❌ Gagal: ${e.message || e}`);
        }
        return;
    }

    if (!isBotAdmin) return m.reply('❌ Bot harus menjadi Admin grup!');

    let target = m.mentionedJid?.[0] || m.quoted?.sender || null;
    if (!target && text) {
        const cleanNumber = text.replace(/[^0-9]/g, '');
        if (cleanNumber.length >= 5) target = cleanNumber + '@s.whatsapp.net';
    }

    if (!target) {
        return m.reply(`⚠️ Tag atau reply user yang ingin dikeluarkan.\nContoh: ${usedPrefix + command} @user`);
    }

    if (target === conn.user.jid) return m.reply('❌ Tidak bisa kick bot sendiri!');

    try {
        await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
        await m.reply(`👋 Berhasil mengeluarkan @${target.split('@')[0]}`);
    } catch (e) {
        m.reply(`❌ Gagal: ${e.message || e}`);
    }
};

handler.help = ['leavegc', 'out'];
handler.tags = ['group'];
handler.command = /^(leavegc|out|left|botleave)$/i;
handler.group = true;
handler.admin = true;

export default handler;