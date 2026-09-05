import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const coin = (text || '').trim();
    const res = await fetch(`${global.web}/api/search/crypto?apikey=${apiKey}&coin=${encodeURIComponent(coin)}&currency=idr`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Data cryptocurrency tidak ditemukan${coin ? ' untuk koin: ' + coin : ''}.`);
    }

    const coins = json.result.slice(0, 10);
    let output = `🪙 *HARGA LIVE CRYPTOCURRENCY (BINANCE)*\n`;
    if (json.usd_idr_rate) output += `💱 *Kurs USD/IDR:* Rp ${Math.round(json.usd_idr_rate).toLocaleString('id-ID')}\n`;
    output += `\n`;

    coins.forEach(c => {
      const changeEmoji = (c.change_24h_percent >= 0) ? '🟢' : '🔴';
      output += `*#${c.rank || '-' } ${c.name} (${c.symbol})*\n`;
      output += `• 💵 *Harga USD:* ${c.price_usd_formatted || '$' + c.price_usd}\n`;
      output += `• 🇮🇩 *Harga IDR:* ${c.price_idr_formatted || 'Rp' + Math.round(c.price_idr).toLocaleString('id-ID')}\n`;
      output += `• ${changeEmoji} *Perubahan 24 Jam:* ${c.change_24h_percent > 0 ? '+' : ''}${c.change_24h_percent?.toFixed(2)}%\n`;
      if (c.high_24h_usd && c.low_24h_usd) {
        output += `• 📊 *24h Range:* $${c.low_24h_usd} - $${c.high_24h_usd}\n`;
      }
      output += `\n`;
    });

    output += `✨ *Data pasar real-time langsung dari Binance Exchange*`;

    await m.reply(output.trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat data Crypto: " + e.message);
  }
};

handler.help = ['crypto [koin]', 'harga [koin]'];
handler.tags = ['search'];
handler.command = /^(crypto|kripto|hargakoin|coin)$/i;

handler.limit = 1;
export default handler;
