let handler = async (m, { conn, args, groupMetadata, isOwner, isAdmin }) => {
    let groupOwner = groupMetadata?.owner || groupMetadata?.subjectOwner || '';
    let botJid = String(conn.user?.jid || conn.user?.id || '').replace(/:\d+/, '');

    const isProtected = (user) => {
        let cleanUser = String(user).replace(/:\d+/, '');
        let ownerList = (global.owner || []).map(v => (Array.isArray(v) ? v[0] : v).toString().replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        let isBotOwner = ownerList.includes(cleanUser) || isOwner;
        let isVip = global.db?.data?.users?.[cleanUser]?.vip || global.db?.data?.users?.[cleanUser]?.premium;
        return cleanUser === groupOwner || cleanUser === botJid || isBotOwner || isVip;
    };

    let targets = [];

    if (m.quoted?.sender) {
        targets.push(m.quoted.sender);
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targets.push(...m.mentionedJid);
    } else if (args[0]) {
        const raw = args[0].replace(/[^0-9]/g, "");
        if (raw.length >= 5) {
            targets.push(raw + "@s.whatsapp.net");
        }
    }

    if (targets.length === 0) {
        return m.reply(`⚠️ *Penggunaan Kick*\n\n📌 *Format:* .kick @user atau .kick <nomor>\nAtau reply pesan user yang ingin di-kick.`);
    }

    let validTargets = targets.filter(u => !isProtected(u));
    if (validTargets.length === 0) {
        return m.reply("❌ Tidak dapat mengeluarkan Owner, Bot, atau member Premium!");
    }

    for (let target of validTargets) {
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], "remove");
            await conn.sendMessage(m.chat, {
                text: `👋 Berhasil mengeluarkan @${target.split('@')[0]} dari grup!`,
                mentions: [target]
            }, { quoted: m });
        } catch (e) {
            await m.reply(`❌ Gagal mengeluarkan @${target.split('@')[0]}: ${e.message || e}`);
        }
    }
};

handler.help = ["kick <@user/nomor>"];
handler.tags = ["group"];
handler.command = /^(kick|kik|dor|tendang)$/i;
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;