import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan nama package NPM!*\nContoh: ${usedPrefix + command} axios`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/npm?apikey=${apiKey}&query=${encodeURIComponent(text)}&limit=5`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Package NPM tidak ditemukan untuk: "${text}"`);
    }

    const packages = json.result.slice(0, 5);
    let output = `📦 *NPM PACKAGE REGISTRY SEARCH*\n🔍 *Query:* ${text}\n\n`;

    packages.forEach((pkg, i) => {
      output += `*${i + 1}. ${pkg.name}* (v${pkg.version || '1.0.0'})
`;
      if (pkg.description) output += `• 📝 ${pkg.description}\n`;
      if (pkg.author) output += `• 👤 *Author:* ${pkg.author}\n`;
      if (pkg.license) output += `• 📜 *License:* ${pkg.license}\n`;
      if (pkg.links?.npm) output += `• 🔗 *NPM:* ${pkg.links.npm}\n`;
      if (pkg.links?.repository) output += `• 🐙 *Repo:* ${pkg.links.repository}\n`;
      output += `\n`;
    });

    output += `✨ *NPM Official Registry Gateway*`;

    await m.reply(output.trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari package di NPM: " + e.message);
  }
};

handler.help = ['npm <package>', 'npmsearch <package>'];
handler.tags = ['search'];
handler.command = /^(npm|npmsearch|package)$/i;

handler.limit = 1;
export default handler;
