let handler = async (m, { conn, text, usedPrefix, command }) => {
    const sender = m._normSender || m.sender;
    let user = global.db?.data?.users?.[sender] || global.db?.data?.users?.[m.sender];
    if (!user) return m.reply("❌ Kamu belum terdaftar di database.");

    // Kurs: 50 Koin = 1 Limit
    const RATE = 50;
    let coin = user.coin !== undefined ? user.coin : (user.exp || 0);

    if (!text) {
        let txt = `🪙 *PENUKARAN KOIN KE LIMIT* ⚡\n\n` +
                  `Kamu bisa menukarkan koin hasil main game / aktivitas grup menjadi *Limit* tambahan!\n\n` +
                  `📊 *Kurs Penukaran:* ${RATE} Koin = 1 Limit\n` +
                  `💰 *Koin Kamu:* ${coin.toLocaleString('id-ID')} Koin\n` +
                  `⚡ *Sisa Limit Kamu:* ${user.limit || 0}\n\n` +
                  `📌 *Cara Tukar:*\n` +
                  `• *${usedPrefix + command} <jumlah_limit>*\n` +
                  `• *${usedPrefix + command} all* _(Tukar semua koin yang cukup)_\n\n` +
                  `💡 *Contoh:*\n` +
                  `• *${usedPrefix + command} 5* _(Butuh ${5 * RATE} Koin)_\n` +
                  `• *${usedPrefix + command} 10* _(Butuh ${10 * RATE} Koin)_`;

        return m.reply(txt.trim());
    }

    let count = 0;
    if (text.trim().toLowerCase() === 'all' || text.trim().toLowerCase() === 'semua') {
        count = Math.floor(coin / RATE);
        if (count < 1) {
            return m.reply(`❌ Koin kamu tidak cukup untuk ditukar minimal 1 Limit (Butuh minimal ${RATE} Koin). Koin kamu saat ini: ${coin}`);
        }
    } else {
        count = parseInt(text.trim().replace(/[^0-9]/g, ''));
        if (!count || isNaN(count) || count < 1) {
            return m.reply(`⚠️ Masukkan jumlah limit yang ingin ditukar!\nContoh: *${usedPrefix + command} 5*`);
        }
    }

    let cost = count * RATE;
    if (coin < cost) {
        return m.reply(`❌ Koin tidak cukup!\nUntuk menukar *${count} Limit*, kamu membutuhkan *${cost.toLocaleString('id-ID')} Koin*.\nKoin kamu saat ini hanya: *${coin.toLocaleString('id-ID')} Koin*.`);
    }

    // Potong koin & tambah limit
    if (user.coin !== undefined) user.coin = Math.max(0, user.coin - cost);
    if (user.exp !== undefined) user.exp = Math.max(0, user.exp - cost);
    user.limit = (user.limit || 0) + count;

    let successTxt = `🎉 *PENUKARAN KOIN BERHASIL!* ⚡\n\n` +
                     `🪙 *Koin Terpakai:* -${cost.toLocaleString('id-ID')} Koin\n` +
                     `⚡ *Limit Didapat:* +${count} Limit\n` +
                     `📊 *Sisa Koin Kamu:* ${(user.coin !== undefined ? user.coin : (user.exp || 0)).toLocaleString('id-ID')} Koin\n` +
                     `⚡ *Total Limit Kamu:* ${user.limit} Limit\n\n` +
                     `_Kumpulkan koin lebih banyak dari bermain game (.asahotak, .tebakgambar, .family100, dll)!_`;

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } }).catch(() => {});
    return m.reply(successTxt.trim());
};

handler.help = ['tukar <jumlah/all>', 'buycoin <jumlah/all>', 'redeem <jumlah/all>'];
handler.tags = ['game', 'store'];
handler.command = /^(tukar|tukarkoin|buycoin|redeem)$/i;
handler.limit = 0;

export default handler;
