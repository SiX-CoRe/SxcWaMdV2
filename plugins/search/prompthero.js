import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan kata kunci prompt gambar AI!*\nContoh: ${usedPrefix + command} cyberpunk samurai`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/prompthero?apikey=${apiKey}&query=${encodeURIComponent(text)}&limit=5`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Prompt AI tidak ditemukan untuk: "${text}"`);
    }

    const item = json.result[0];
    const p = item.prompt || item;
    let caption = `🎨 *PROMPTHERO AI PROMPT SEARCH*\n🔍 *Query:* ${text}\n\n`;
    caption += `✨ *Prompt:* ${p.prompt || p.text || '-'}\n\n`;
    if (p.negative_prompt) caption += `⛔ *Negative Prompt:* ${p.negative_prompt}\n\n`;
    if (p.model) caption += `• 🧠 *Model:* ${p.model}\n`;
    if (p.sampler) caption += `• ⚙️ *Sampler:* ${p.sampler}\n`;
    if (p.steps) caption += `• 🔢 *Steps:* ${p.steps}\n`;
    if (p.cfg_scale) caption += `• 🎚️ *CFG Scale:* ${p.cfg_scale}\n`;
    if (p.seed) caption += `• 🌱 *Seed:* ${p.seed}\n`;
    caption += `\n✨ *PromptHero AI Library*`;

    const img = item.image_url || item.url || item.preview_url;
    if (img) {
      await conn.sendMessage(m.chat, {
        image: { url: img },
        caption: caption.trim()
      }, { quoted: m }).catch(() => m.reply(caption.trim()));
    } else {
      await m.reply(caption.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari di PromptHero: " + e.message);
  }
};

handler.help = ['prompthero <query>', 'aiprompt <query>'];
handler.tags = ['search'];
handler.command = /^(prompthero|aiprompt|promptsearch)$/i;

handler.limit = 1;
export default handler;
