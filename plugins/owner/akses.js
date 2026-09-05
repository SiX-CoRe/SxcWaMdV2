import moment from 'moment-timezone';

function formatWaktu(ts) {
    if (!ts || ts === 0 || ts === Infinity || ts === 'permanen') return 'Permanen ♾️';
    const d = new Date(ts);
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const wib = new Date(utc + (3600000 * 7));
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${wib.getDate()} ${bulan[wib.getMonth()]} ${wib.getFullYear()}, ${String(wib.getHours()).padStart(2,'0')}:${String(wib.getMinutes()).padStart(2,'0')} WIB`;
}

function hitungSisaHari(ts) {
    if (!ts || ts === 0) return 'Sudah Expired';
    if (ts === Infinity || ts === 'permanen') return 'Permanen ♾️';
    const now = Date.now();
    const diff = ts - now;
    if (diff <= 0) return 'Sudah Expired';
    const hari = Math.floor(diff / 86400000);
    const jam = Math.floor((diff % 86400000) / 3600000);
    const menit = Math.floor((diff % 3600000) / 60000);
    if (hari > 0) return `${hari} Hari ${jam} Jam Lagi`;
    if (jam > 0) return `${jam} Jam ${menit} Menit Lagi`;
    return `${menit} Menit Lagi`;
}

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    const now = Date.now();
    const ownerNumbers = (global.owner || []).map(n => (Array.isArray(n) ? n[0] : (typeof n === 'object' ? n.number || n.jid : n)).toString().replace(/[^0-9]/g, ''));
    const senderPhone = m.sender.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const isOwner = ownerNumbers.some(o => o === senderPhone || m.sender.includes(o));
    
    if (!isOwner) return m.reply('❌ Hanya owner yang bisa menggunakan command ini!');
    
    const action = command.toLowerCase().replace(/^(add|del|list|cek)/, (match) => match);
    
    // Smart LID-to-Phone resolver
    // Build phone map from users with valid phone (62xxx)
    const lidToPhone = {};
    for (const [k, val] of Object.entries(global.db.data.users || {})) {
        const ck = k.split('@')[0].split(':')[0];
        if (k.endsWith('@s.whatsapp.net') && ck.startsWith('62') && ck.length <= 13) {
            if (val?.name && val.name !== 'User' && val.name.length >= 2) {
                lidToPhone[val.name.trim().toLowerCase()] = ck;
            }
        }
    }
    
    function resolvePhone(v, u) {
        const cleanKey = v.split('@')[0].split(':')[0];
        const rawPhone = (u?.phone || cleanKey).replace(/[^0-9]/g, '');
        const isLidNumber = rawPhone.length > 13 || (!rawPhone.startsWith('62') && rawPhone.length >= 14);
        const name = u?.name && u.name !== 'User' ? u.name : '';
        const mappedPhone = (u?.phone && u.phone.startsWith('62') && u.phone.length <= 13) ? u.phone : 
                           (name && lidToPhone[name.trim().toLowerCase()] ? lidToPhone[name.trim().toLowerCase()] : null);
        return mappedPhone || (!isLidNumber && rawPhone.length >= 8 && rawPhone.length <= 13 ? rawPhone : '');
    }
    
    // Resolve target user
    let target = m.mentionedJid?.[0] || m.quoted?.sender || null;
    let user, targetsToUpdate, days = 0, isPermanent = false;
    let expiryStr = '';
    
    if (!['listprem', 'cekprem'].includes(action)) {
        if (!target) return m.reply(`Format: *${usedPrefix + command} @user <durasi>*\nContoh: *${usedPrefix + command} @user 30d*`);
        
        // Normalize target to phone JID
        const targetPhone = target.replace(/[^0-9]/g, '');
        const phoneJid = `${targetPhone}@s.whatsapp.net`;
        
        targetsToUpdate = [target];
        if (!targetsToUpdate.includes(phoneJid)) targetsToUpdate.push(phoneJid);
        // Find LID duplicates by name or phone
        for (const [k, u] of Object.entries(global.db.data.users || {})) {
            if (k.endsWith('@lid') && (u.phone === targetPhone || 
                (u.name && global.db.data.users[phoneJid]?.name && u.name === global.db.data.users[phoneJid].name))) {
                if (!targetsToUpdate.includes(k)) targetsToUpdate.push(k);
            }
        }
        
        user = targetsToUpdate.map(t => global.db.data.users[t]).find(u => u && typeof u === 'object') || {
            exp: 20, limit: 20, name: 'User', role: 'Free user', autolevelup: true
        };
        for (const t of targetsToUpdate) {
            global.db.data.users[t] = user;
        }
        
        const durationText = args[args.indexOf(args.find(a => /^(@|\d)/.test(a))) + 1] || args[1] || args[0] || '';
        if (!['delprem', 'cekprem', 'listprem'].includes(action)) {
            if (/^(permanent|permanen|selamanya|infinity|inf)$/i.test(durationText)) {
                isPermanent = true; days = 0;
            } else {
                const match = durationText.match(/^(\d+)(d|hari|day|days|m|bulan|y|tahun)?$/i);
                if (match) {
                    days = parseInt(match[1]);
                    if (/m|bulan/i.test(match[2])) days *= 30;
                    else if (/y|tahun/i.test(match[2])) days *= 365;
                }
            }
            if (!isPermanent && (!days || days <= 0)) {
                return m.reply(`Masukkan durasi valid!\nContoh: *${usedPrefix + command} @user 30d* atau *${usedPrefix + command} @user permanent*`);
            }
            expiryStr = isPermanent ? 'Permanen' : `${days} Hari`;
        }
    }
    
    switch (action) {
        case 'addprem': {
            const oldExp = user.premiumDate || 0;
            const newExp = isPermanent ? Infinity : ((oldExp && oldExp > now && oldExp !== Infinity) ? oldExp + (days * 86400000) : now + (days * 86400000));
            for (const t of targetsToUpdate) {
                const u = global.db.data.users[t]; if (!u) continue;
                u.premium = true; u.limit = Math.max(u.limit || 0, 1000);
                u.premiumDate = newExp; delete u.warnedPremExpiry;
            }
            if (global.db?.write) await global.db.write();
            const sisa = hitungSisaHari(newExp);
            m.reply(`✅ *BERHASIL MENAMBAHKAN STATUS PREMIUM!*\n\n👤 *User:* @${target.split('@')[0]}\n⏳ *Durasi:* ${expiryStr}\n📅 *Expired:* ${formatWaktu(newExp)}\n📈 *Sisa Aktif:* ${sisa}\n⚡ *Limit Harian:* 1.000 / hari`, null, { mentions: [target] });
            break;
        }
        case 'delprem': {
            for (const t of targetsToUpdate) {
                const u = global.db.data.users[t]; if (!u) continue;
                u.premium = false; u.premiumDate = 0; u.limit = 20; delete u.warnedPremExpiry;
            }
            if (global.db?.write) await global.db.write();
            m.reply(`✅ Berhasil mencabut status *Premium* dari @${target.split('@')[0]}.`, null, { mentions: [target] });
            break;
        }
        case 'listprem': {
            const seen = new Set(), listPrem = [], mentions = [];
            for (const v of Object.keys(global.db.data.users)) {
                if (!v || !v.includes('@') || v === 'undefined' || v === 'null') continue;
                const u = global.db.data.users[v];
                if (u?.premium === true) {
                    const validPhone = resolvePhone(v, u);
                    const name = u.name && u.name !== 'User' ? u.name : '';
                    const displayTag = validPhone || name || v.split('@')[0];
                    const nameSuffix = (name && validPhone) ? ` (${name})` : '';
                    const jid = validPhone ? `${validPhone}@s.whatsapp.net` : (v.includes('@') ? v : `${v}@s.whatsapp.net`);
                    const idKey = validPhone || (name && name !== 'User' ? name.toLowerCase() : v.split('@')[0]);
                    if (!seen.has(idKey)) {
                        seen.add(idKey);
                        listPrem.push({ jid, displayTag, nameSuffix, user: u });
                        if (jid && !mentions.includes(jid)) mentions.push(jid);
                        if (v && !mentions.includes(v)) mentions.push(v);
                        if (validPhone && !mentions.includes(`${validPhone}@s.whatsapp.net`)) mentions.push(`${validPhone}@s.whatsapp.net`);
                    }
                }
            }
            if (listPrem.length === 0) return m.reply('❌ Belum ada user premium.');
            let txt = `*👑 LIST USER PREMIUM (${listPrem.length} USER) 👑*\n\n`;
            listPrem.forEach((item, i) => {
                txt += `*${i + 1}. @${item.displayTag}${item.nameSuffix}*\n`;
                txt += `   ⏳ *Sisa:* ${hitungSisaHari(item.user.premiumDate)}\n`;
                txt += `   📅 *Expired:* ${formatWaktu(item.user.premiumDate)}\n\n`;
            });
            await conn.sendMessage(m.chat, { text: txt.trim(), mentions }, { quoted: m });
            break;
        }
        case 'cekprem': {
            const tgt = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
            const u = global.db.data.users[tgt];
            if (!u) return m.reply('❌ User tidak ditemukan!');
            const nameCek = u.name || tgt.split('@')[0];
            const sPrem = u.premium ? `✅ Aktif - ${hitungSisaHari(u.premiumDate)} (${formatWaktu(u.premiumDate)})` : '❌ Tidak Aktif';
            m.reply(`*🔍 STATUS USER*\n\n` +
                `👤 *Nama:* ${nameCek}\n` +
                `🆔 *Phone:* @${tgt.split('@')[0]}\n` +
                `👑 *Premium:* ${sPrem}\n` +
                `⚡ *Limit:* ${u.limit || 20}/hari\n` +
                `🏆 *Level:* ${u.level || 1}\n` +
                `💎 *EXP:* ${u.exp || 0}\n\n` +
                `> © _https://whatsapp.com/channel/0029Vb7XYjLKgsNyWrRHL10k_`,
                null, { mentions: [tgt] });
            break;
        }
    }
};

handler.help = ['addprem', 'delprem', 'listprem', 'cekprem'];
handler.tags = ['owner'];
handler.command = /^(addprem|delprem|listprem|cekprem)$/i;
export default handler;
