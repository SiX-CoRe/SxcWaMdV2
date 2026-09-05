function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

let handler = async (m, {
  conn,
  usedPrefix,
  command,
  text,
  args
}) => {
  const pkgName = (text || args.join(' ')).trim();
  if (!pkgName) {
    return m.reply(`📦 *NPM PACKAGE STALKER*\n\n*Format:* ${usedPrefix + command} <nama package>\n*Contoh:* ${usedPrefix + command} axios\n*Contoh 2:* ${usedPrefix + command} express`);
  }
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const url = `${global.web}/api/search/npm?apikey=${global.apikey.jereapi}&query=${encodeURIComponent(pkgName)}&limit=5`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json.status || !json.result || json.result.length === 0) {
      throw new Error(json.error || json.message || "Package NPM tidak ditemukan");
    }

    const pkg = json.result[0];
    const pubDate = formatDate(pkg.date);
    const maintainers = Array.isArray(pkg.maintainers) ? pkg.maintainers.slice(0, 5).join(', ') : (pkg.maintainers || '-');
    const keywords = Array.isArray(pkg.keywords) ? pkg.keywords.slice(0, 6).join(', ') : '-';

    let card = `╭━━━〔 📦 *NPM PACKAGE STALKER* 〕━━━\n`;
    card += `┃ 🏷️ *Package:* ${pkg.name}\n`;
    card += `┃ 🔖 *Latest Version:* ${pkg.version || '-'}\n`;
    if (pkg.description) card += `┃ 📝 *Description:* ${pkg.description}\n`;
    card += `┃ 👤 *Author:* ${pkg.author || '-'}\n`;
    card += `┃ 👥 *Maintainers:* ${maintainers}\n`;
    card += `┃ ⚖️ *License:* ${pkg.license || '-'}\n`;
    card += `┃ 💎 *Verified:* ✅ NPM Registry Verified\n`;
    card += `┃ 📅 *Published Date:* ${pubDate}\n`;
    if (keywords !== '-') card += `┃ 🏷️ *Keywords:* ${keywords}\n`;
    if (pkg.links?.npm) card += `┃ 🔗 *NPM Link:* ${pkg.links.npm}\n`;
    if (pkg.links?.repository) card += `┃ 🐙 *Repository:* ${pkg.links.repository}\n`;
    if (pkg.links?.homepage) card += `┃ 🏠 *Homepage:* ${pkg.links.homepage}\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    const npmLogo = 'https://raw.githubusercontent.com/npm/logos/master/npm%20square/npm-square-red-rounded.png';
    try {
      await conn.sendMessage(m.chat, {
        image: { url: npmLogo },
        caption: card
      }, { quoted: m });
    } catch (imgErr) {
      await m.reply(card);
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error('NPM Stalk Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Stalk NPM:* ${e.message}`);
  }
};

handler.help = ["npmstalk <package>"];
handler.tags = ["stalker"];
handler.command = ["npmstalk", "stalknpm"];

handler.limit = 1;
export default handler;
