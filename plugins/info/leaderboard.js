let handler = async (m, { conn, args }) => {
    try {
        const rawBotJid = String(conn.user?.jid || conn.user?.id || '').replace(/:\d+/, '');
        const botNum = rawBotJid.split('@')[0].split(':')[0];
        const rawBotLid = String(conn.user?.lid || '').replace(/:\d+/, '');
        const botLidNum = rawBotLid.split('@')[0].split(':')[0];

        const botIdentifiers = [botNum, botLidNum].filter(Boolean);

        let lidToPhone = {};
        let phoneToLid = {};

        // 1. Kumpulkan mapping LID dari metadata grup saat ini
        if (m.isGroup) {
            try {
                let groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({}));
                let participants = groupMetadata?.participants || [];
                for (let p of participants) {
                    if (p.lid && p.id) {
                        let cleanLid = p.lid.split('@')[0].split(':')[0];
                        let cleanPhone = p.id.split('@')[0].split(':')[0];
                        lidToPhone[cleanLid] = cleanPhone;
                        lidToPhone[p.lid] = cleanPhone;
                        lidToPhone[`${cleanLid}@lid`] = cleanPhone;
                        phoneToLid[cleanPhone] = cleanLid;
                    }
                }
            } catch (_) {}
        }

        // 2. Kumpulkan mapping dari database
        for (let [k, v] of Object.entries(global.db?.data?.users || {})) {
            if (v && typeof v === 'object') {
                if (k.endsWith('@lid') && v.phone) {
                    let cleanLid = k.split('@')[0].split(':')[0];
                    let cleanPhone = String(v.phone).replace(/[^0-9]/g, '');
                    if (cleanPhone && cleanPhone.length <= 13) {
                        lidToPhone[cleanLid] = cleanPhone;
                        lidToPhone[k] = cleanPhone;
                        phoneToLid[cleanPhone] = cleanLid;
                    }
                }
            }
        }

        // 3. Mapping relasi silang berdasarkan kesamaan nama
        for (let [k, v] of Object.entries(global.db?.data?.users || {})) {
            if (v && v.name && v.name !== 'User' && v.name.length >= 2) {
                let cleanKey = k.split('@')[0].split(':')[0];
                if (k.endsWith('@s.whatsapp.net')) {
                    for (let [k2, v2] of Object.entries(global.db?.data?.users || {})) {
                        if (k2.endsWith('@lid') && v2?.name && v2.name.trim().toLowerCase() === v.name.trim().toLowerCase()) {
                            let cleanLid2 = k2.split('@')[0].split(':')[0];
                            lidToPhone[cleanLid2] = cleanKey;
                            lidToPhone[k2] = cleanKey;
                        }
                    }
                }
            }
        }

        // 4. Gabungkan dan deduplikasi database user secara komprehensif
        let mergedUsers = new Map();

        for (let [key, value] of Object.entries(global.db?.data?.users || {})) {
            if (!value || typeof value !== 'object' || typeof value === 'function') continue;
            
            let cleanKey = key.split('@')[0].split(':')[0];
            let isLid = key.endsWith('@lid');

            let phone = '';
            if (!isLid && key.endsWith('@s.whatsapp.net')) {
                phone = cleanKey;
            } else if (value.phone && String(value.phone).replace(/[^0-9]/g, '').length <= 13) {
                phone = String(value.phone).replace(/[^0-9]/g, '');
            } else if (lidToPhone[cleanKey]) {
                phone = lidToPhone[cleanKey];
            } else if (lidToPhone[key]) {
                phone = lidToPhone[key];
            }

            // Abaikan bot dari leaderboard
            let isBot = botIdentifiers.some(bn => bn && (key.includes(bn) || phone === bn || cleanKey === bn));
            if (isBot) continue;
            if (value.name === 'no bot' || value.name === 'bot lumnztyz' || value.name === 'bot' || value.name === 'sxcmd' || value.name === 'sxcwa-md') continue;

            if (key.includes('@g.us') || key.includes('@newsletter') || key.includes('status@broadcast') || key.includes('@broadcast')) continue;
            if (key.startsWith('120363')) continue;

            // Kunci identitas unik untuk deduplikasi: Nama Unik -> Phone -> LID
            let normName = (value.name || '').trim().toLowerCase();
            let primaryId = '';
            if (normName && normName !== 'user' && normName.length >= 2) {
                primaryId = `name_${normName}`;
            } else if (phone) {
                primaryId = `phone_${phone}`;
            } else {
                primaryId = `lid_${cleanKey}`;
            }

            let existing = mergedUsers.get(primaryId);
            if (!existing) {
                let displayPhone = phone || (isLid ? (lidToPhone[cleanKey] || '') : cleanKey);
                let jid = displayPhone ? `${displayPhone}@s.whatsapp.net` : (isLid ? `${cleanKey}@lid` : key);
                
                mergedUsers.set(primaryId, {
                    ...value,
                    primaryId,
                    phone: displayPhone,
                    num: displayPhone || '',
                    jid,
                    allJids: [key, jid, displayPhone ? `${displayPhone}@s.whatsapp.net` : null, isLid ? `${cleanKey}@lid` : null].filter(Boolean),
                    name: value.name && value.name !== 'User' ? value.name : (value.name || ''),
                    exp: value.exp || value.coin || 0,
                    coin: value.coin || value.exp || 0,
                    hit: value.hit || 0,
                    level: value.level || 0,
                    donasi: value.donasi || 0
                });
            } else {
                // Maksimalkan dan gabungkan statistik agar progres tertinggi tidak hilang
                existing.exp = Math.max(existing.exp || 0, value.exp || value.coin || 0);
                existing.coin = Math.max(existing.coin || 0, value.coin || value.exp || 0);
                existing.hit = Math.max(existing.hit || 0, value.hit || 0);
                existing.level = Math.max(existing.level || 0, value.level || 0);
                existing.donasi = Math.max(existing.donasi || 0, value.donasi || 0);
                
                if ((!existing.name || existing.name === 'User') && (value.name && value.name !== 'User')) {
                    existing.name = value.name;
                }
                if (!existing.phone && phone) {
                    existing.phone = phone;
                    existing.num = phone;
                    existing.jid = `${phone}@s.whatsapp.net`;
                }
                if (!existing.allJids.includes(key)) existing.allJids.push(key);
            }
        }

        let users = Array.from(mergedUsers.values());

        let sortedCoin = users.slice().filter(u => (u.exp || u.coin || 0) > 0).sort((a, b) => (b.exp || b.coin || 0) - (a.exp || a.coin || 0)).slice(0, 10);
        let sortedHit = users.slice().filter(u => (u.hit || 0) > 0).sort((a, b) => (b.hit || 0) - (a.hit || 0)).slice(0, 10);
        let sortedLevel = users.slice().filter(u => (u.level || 0) > 0 || (u.hit || 0) > 0).sort((a, b) => (b.level || 0) - (a.level || 0) || (b.exp || 0) - (a.exp || 0)).slice(0, 10);
        let sortedDonatur = users.slice().filter(u => (u.donasi || 0) > 0).sort((a, b) => (b.donasi || 0) - (a.donasi || 0)).slice(0, 10);

        let type = (args[0] || '').toLowerCase();
        
        let text = '';
        const fmtItem = (u) => {
            let isLidNumber = u.num && u.num.length > 13;
            let cleanNum = (!isLidNumber && u.num) ? u.num : (u.phone && u.phone.length <= 13 ? u.phone : '');
            let numStr = cleanNum ? `@${cleanNum}` : (u.name ? `@${u.name}` : `@User`);
            let nameStr = (u.name && u.name !== 'User' && cleanNum) ? ` (${u.name})` : '';
            return `${numStr}${nameStr}`;
        };

        let currentList = [];

        if (type === 'coin' || type === 'koin' || type === 'exp') {
            currentList = sortedCoin;
            text = `🏆 *TOP 10 SULTAN COIN* 🏆\n\n`;
            if (sortedCoin.length === 0) text += `Belum ada data koin tercatat.\n`;
            sortedCoin.forEach((u, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ` ${i + 1}.`;
                text += `${medal} ${fmtItem(u)} - *${(u.exp || u.coin || 0).toLocaleString('id-ID')}* Coin\n`;
            });
        } else if (type === 'hit' || type === 'aktif') {
            currentList = sortedHit;
            text = `🏆 *TOP 10 MOST ACTIVE (HIT)* 🏆\n\n`;
            if (sortedHit.length === 0) text += `Belum ada data aktivitas hit tercatat.\n`;
            sortedHit.forEach((u, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ` ${i + 1}.`;
                text += `${medal} ${fmtItem(u)} - *${(u.hit || 0).toLocaleString('id-ID')}* Hit\n`;
            });
        } else if (type === 'level' || type === 'lvl') {
            currentList = sortedLevel;
            text = `🏆 *TOP 10 HIGHEST LEVEL* 🏆\n\n`;
            if (sortedLevel.length === 0) text += `Belum ada user yang menaikkan level.\n`;
            sortedLevel.forEach((u, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ` ${i + 1}.`;
                text += `${medal} ${fmtItem(u)} - *Level ${(u.level || 0)}*\n`;
            });
        } else if (type === 'donatur' || type === 'donasi') {
            currentList = sortedDonatur;
            text = `🏆 *TOP 10 DONATUR* 🏆\n\n`;
            if (sortedDonatur.length === 0) text += `Belum ada donatur tercatat.\n`;
            sortedDonatur.forEach((u, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ` ${i + 1}.`;
                text += `${medal} ${fmtItem(u)} - *Rp ${(u.donasi || 0).toLocaleString('id-ID')}*\n`;
            });
        } else {
            text = `🏆 *LEADERBOARD ${global.botname || 'WHATSAPP BOT'}* 🏆\n\n` +
                   `Silakan pilih kategori leaderboard:\n` +
                   `➤ .top donatur\n` +
                   `➤ .top coin\n` +
                   `➤ .top level\n` +
                   `➤ .top hit`;
        }

        let tags = [];
        currentList.forEach(v => {
            if (v.allJids && Array.isArray(v.allJids)) {
                v.allJids.forEach(j => {
                    if (j && !tags.includes(j)) tags.push(j);
                });
            }
            if (v.jid && !tags.includes(v.jid)) tags.push(v.jid);
        });

        text += "\n\n> © _https://whatsapp.com/channel/0029Vb7XYjLKgsNyWrRHL10k_";
        await conn.sendMessage(m.chat, { text: text.trim(), mentions: tags }, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply("❌ Error: " + (e.message || e));
    }
};

handler.help = ['top <kategori>', 'leaderboard <kategori>'];
handler.tags = ['info'];
handler.command = /^(top|leaderboard|lb)$/i;

export default handler;
