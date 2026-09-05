import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn, text }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : (m.fromMe ? conn.user.jid : (m._normSender || m.sender)));
    who = String(who).replace(/:\d+/, '');

    // Resolve LID to phone JID if possible
    if (who.endsWith('@lid')) {
        let realJid = null;
        if (m.isGroup) {
            let groupMetadata = (conn.chats?.[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(() => null);
            let p = groupMetadata?.participants?.find(u => u.lid === who || u.id === who);
            if (p?.id && p.id.endsWith('@s.whatsapp.net')) realJid = p.id;
        }
        if (!realJid) {
            let pn = await conn?.signalRepository?.lidMapping?.getPNForLID(who).catch(() => null);
            if (pn) realJid = pn;
        }
        if (!realJid) {
            let found = Object.values(conn.contacts || {}).find(c => c.lid === who);
            if (found?.id && found.id.endsWith('@s.whatsapp.net')) realJid = found.id;
        }
        if (realJid) who = realJid.replace(/:\d+/, '');
    }

    if (!global.db?.data?.users) global.db.data.users = {};
    let cleanPhone = who.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    
    // Collect all records associated with this person
    let candidateRecords = [];
    if (global.db.data.users[who]) candidateRecords.push(global.db.data.users[who]);
    if (cleanPhone && global.db.data.users[`${cleanPhone}@s.whatsapp.net`]) candidateRecords.push(global.db.data.users[`${cleanPhone}@s.whatsapp.net`]);
    if (m._normSender && global.db.data.users[m._normSender]) candidateRecords.push(global.db.data.users[m._normSender]);
    if (m.sender && global.db.data.users[m.sender]) candidateRecords.push(global.db.data.users[m.sender]);

    if (cleanPhone) {
        for (let [k, u] of Object.entries(global.db.data.users)) {
            if (u && (u.phone === cleanPhone || k.startsWith(cleanPhone))) {
                if (!candidateRecords.includes(u)) candidateRecords.push(u);
            }
        }
    }

    // Merge best values
    let user = Object.assign({}, ...candidateRecords.filter(Boolean));
    for (let r of candidateRecords) {
        if (!r) continue;
        if (r.premium) user.premium = true, user.premiumDate = r.premiumDate;
        if (r.role && r.role.toLowerCase() !== 'free user' && r.role.toLowerCase() !== 'user biasa') {
            user.role = r.role;
            user.status = r.status || r.role;
            user.roleDate = r.roleDate;
        }
        if (r.exp && (!user.exp || r.exp > user.exp)) user.exp = r.exp;
        if (r.level && (!user.level || r.level > user.level)) user.level = r.level;
        if (r.name && r.name !== 'User') user.name = r.name;
    }

    let name = user.name || who.split('@')[0];
    let cleanNumber = who.split('@')[0].split(':')[0];
    let parsedNumber = PhoneNumber('+' + cleanNumber).getNumber('international');
    let nomor = parsedNumber || (cleanNumber.length > 5 ? ('+' + cleanNumber) : cleanNumber);

    let ownerList = (global.owner || []).map(v => (Array.isArray(v) ? v[0] : v).toString().replace(/[^0-9]/g, '') + '@s.whatsapp.net');
    let isOwner = ownerList.includes(who) || who === String(conn.user?.jid || conn.user?.id).replace(/:\d+/, '');

    let limit = isOwner ? 'Unlimited (∞)' : (typeof user.limit === 'number' ? user.limit.toLocaleString() : (user.premium ? '1.000' : '20'));
    let coin = user.exp || user.coin || 0;
    let level = user.level || 0;
    let warn = user.warn || 0;

    let statusType = '👤 User Biasa';
    let masaAktif = '';
    
    if (isOwner) {
        statusType = '👑 Owner';
        masaAktif = 'Permanen';
    } else if (user.premium) {
        statusType = '🌟 Premium';
        if (user.premiumDate === 'permanen' || user.premiumDate === Infinity) masaAktif = 'Permanen';
        else if (user.premiumDate) {
            let left = user.premiumDate - Date.now();
            let days = Math.ceil(left / 86400000);
            masaAktif = `${days > 0 ? days : 0} Hari Lagi`;
        }
    }

    let roleStr = user.role || user.status || 'Free User';
    let masaRole = '';
    if (roleStr && roleStr.toLowerCase() !== 'free user' && roleStr.toLowerCase() !== 'user biasa') {
        if (user.roleDate === Infinity || user.roleDate === 'permanen') {
            masaRole = ' (Permanen)';
        } else if (user.roleDate) {
            let left = user.roleDate - Date.now();
            let d = Math.ceil(left / 86400000);
            masaRole = ` (${d > 0 ? d : 0} hari lagi)`;
        }
    }

    let seenUsers = new Set();
    let uniqueUsers = [];
    for (let [jid, data] of Object.entries(global.db?.data?.users || {})) {
        if (!data || typeof data !== 'object') continue;
        let p = data.phone || jid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
        if (!p) p = jid;
        if (!seenUsers.has(p)) {
            seenUsers.add(p);
            uniqueUsers.push({ jid, phone: p, ...data });
        }
    }
    
    let sortedCoin = [...uniqueUsers].map(u => ({ jid: u.jid, phone: u.phone, val: u.exp || u.coin || 0 })).sort((a, b) => b.val - a.val);
    let rankCoin = sortedCoin.findIndex(u => u.phone === cleanPhone || u.jid === who) + 1;

    let sortedHit = [...uniqueUsers].map(u => ({ jid: u.jid, phone: u.phone, val: u.hit || 0 })).sort((a, b) => b.val - a.val);
    let rankHit = sortedHit.findIndex(u => u.phone === cleanPhone || u.jid === who) + 1;

    let tops = [];
    if (rankHit > 0 && rankHit <= 10) tops.push(`Top ${rankHit} Hit`);
    if (rankCoin > 0 && rankCoin <= 10) tops.push(`Top ${rankCoin} Coin`);

    let rankStr = tops.length > 0 ? `\n🏆 *Rank Leaderboard:* ${tops.join(', ')}` : '';
    let nextLevelExp = Math.max(100, ((level + 1) ** 2) * 100);

    let str = `╔══════════════════════════╗
║  👤 *USER PROFILE CARD* 👤  ║
╚══════════════════════════╝

┌───❖ *DATA PENGGUNA* ❖───
│
├─👤 *Nama:* ${name}
├─📱 *Nomor:* ${nomor}
├─✨ *Status:* ${statusType} ${masaAktif ? `(${masaAktif})` : ''}
├─🎭 *Role:* ${roleStr}${masaRole}${rankStr}
│
├───❖ *STATISTIK & ASET* ❖───
│
├─⭐ *EXP:* ${coin.toLocaleString()} / ${nextLevelExp.toLocaleString()} XP
├─🪙 *Koin:* ${coin.toLocaleString()}
├─📊 *Level:* ${level}
├─⚡ *Limit:* ${limit}
├─⚠️ *Peringatan:* ${warn}/3
│
└─────────────────────────

> © _sixcorecomunity_`;

    let pp = 'https://i.ibb.co/LhykGk3/image.png';
    try {
        const fetchedPP = await conn.profilePictureUrl(who, 'image').catch(() => null);
        if (fetchedPP) pp = fetchedPP;
    } catch {}

    try {
        await conn.sendFile(m.chat, pp, 'profile.jpg', str, m);
    } catch {
        await conn.reply(m.chat, str, m);
    }
};

handler.help = ['profil', 'me'];
handler.tags = ['info'];
handler.command = /^(profil|profile|me)$/i;

export default handler;
