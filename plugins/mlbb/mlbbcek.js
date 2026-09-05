import fetch from 'node-fetch'

let handler = async (m, {
  conn,
  text,
  usedPrefix,
  command
}) => {
  try {
    const botName = (global.botname || 'BOT').toUpperCase();
    if (!text) {
      return m.reply(`🎮 *${botName} - PANDUAN FITUR MLBB CHECK:*\n\n` +
        `1. *Cek Tier Hero Meta*\n   ${usedPrefix + command} tier\n\n` +
        `2. *Counter Pick Hero Musuh*\n   ${usedPrefix + command} counter fanny,chou\n\n` +
        `3. *Synergy / Kombo Tim*\n   ${usedPrefix + command} synergy angela,estes\n\n` +
        `4. *Build & Panduan Hero*\n   ${usedPrefix + command} build chou\n\n` +
        `5. *Stalk Akun MLBB*\n   ${usedPrefix + command} stalk 12345678|2001`);
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    const [mode, ...args] = text.split(' ');
    const argText = args.join(' ');
    let apiKey = global.apikey?.jereapi || global.apiKey;

    switch (mode.toLowerCase()) {
      case 'tier':
      case 'tiers':
        {
          const response = await fetch(`${global.web}/api/mlbb/tier?apikey=${apiKey}`);
          const json = await response.json();
          if (!json.status || !json.result) throw new Error("Gagal mengambil data Tier MLBB");

          let list = json.result;
          if (argText) {
            list = list.filter(h =>
              (h.hero_name && h.hero_name.toLowerCase().includes(argText.toLowerCase())) ||
              (Array.isArray(h.roles) && h.roles.some(r => r.toLowerCase().includes(argText.toLowerCase())))
            );
          }

          let resMsg = `🏆 *${botName} - MLBB HERO TIERS*\n\n`;
          list.slice(0, 20).forEach((hero, index) => {
            let roles = Array.isArray(hero.roles) ? hero.roles.join(', ') : (hero.roles || '-');
            let lanes = Array.isArray(hero.lanes) ? hero.lanes.join(', ') : (hero.lanes || '-');
            resMsg += `*${index + 1}. ${hero.hero_name}*\n• Role: ${roles}\n• Lane: ${lanes}\n\n`;
          });

          await m.reply(resMsg.trim());
          break;
        }

      case 'counter':
      case 'counters':
        {
          if (!argText) return m.reply(`⚠️ Masukkan nama hero lawan!\nContoh: ${usedPrefix + command} counter fanny,ling`);
          const response = await fetch(`${global.web}/api/mlbb/counter?apikey=${apiKey}&enemies=${encodeURIComponent(argText)}`);
          const json = await response.json();
          if (!json.status || !json.result) throw new Error("Gagal mengambil data counter MLBB");

          let resMsg = `🛡️ *${botName} - MLBB COUNTER PICK*\n\n*Target Musuh:* ${argText}\n\n`;
          if (Array.isArray(json.result)) {
            json.result.slice(0, 8).forEach((h, i) => {
              resMsg += `*${i + 1}. ${h.hero_name || h.name}*\n• Role: ${Array.isArray(h.roles) ? h.roles.join(', ') : (h.roles || '-')}\n\n`;
            });
          } else {
            resMsg += JSON.stringify(json.result, null, 2);
          }
          await m.reply(resMsg.trim());
          break;
        }

      case 'synergy':
      case 'combo':
        {
          if (!argText) return m.reply(`⚠️ Masukkan nama hero tim!\nContoh: ${usedPrefix + command} synergy angela,johnson`);
          const response = await fetch(`${global.web}/api/mlbb/synergy?apikey=${apiKey}&allies=${encodeURIComponent(argText)}`);
          const json = await response.json();
          if (!json.status || !json.result) throw new Error("Gagal mengambil data synergy MLBB");

          let resMsg = `⚡ *${botName} - MLBB TEAM SYNERGY*\n\n*Hero Tim:* ${argText}\n\n`;
          if (Array.isArray(json.result)) {
            json.result.slice(0, 8).forEach((h, i) => {
              resMsg += `*${i + 1}. ${h.hero_name || h.name}*\n• Role: ${Array.isArray(h.roles) ? h.roles.join(', ') : (h.roles || '-')}\n\n`;
            });
          } else {
            resMsg += JSON.stringify(json.result, null, 2);
          }
          await m.reply(resMsg.trim());
          break;
        }

      case 'build':
      case 'item':
        {
          if (!argText) return m.reply(`⚠️ Masukkan nama hero!\nContoh: ${usedPrefix + command} build chou`);
          let heroName = argText.toUpperCase();
          let card = `⚔️ *${botName} - MLBB BUILD FOR ${heroName}*\n\n`;
          card += `🛡️ *Rekomendasi Build Item:*\n`;
          card += `1. Tough / Warrior Boots\n`;
          card += `2. Blade of the Heptaseas / War Axe\n`;
          card += `3. Hunter Strike / Endless Battle\n`;
          card += `4. Malefic Roar\n`;
          card += `5. Blade of Despair\n`;
          card += `6. Immortality / Athena's Shield\n\n`;
          card += `🔮 *Battle Spell:* Flicker / Retribution / Purify\n`;
          card += `✨ *Emblem:* Custom Assassin / Fighter`;
          await m.reply(card.trim());
          break;
        }

      case 'stalk':
      case 'cek':
        {
          if (!argText) return m.reply(`⚠️ Masukkan ID dan Zone ID MLBB!\nContoh: ${usedPrefix + command} stalk 12345678|2001`);
          let [id, zone] = argText.split('|').map(s => s.trim());
          if (!id || !zone) return m.reply(`Format salah! Gunakan format: ID|ZoneID\nContoh: ${usedPrefix + command} stalk 12345678|2001`);

          const response = await fetch(`${global.web}/api/stalk/ml?apikey=${apiKey}&id=${encodeURIComponent(id)}&zone=${encodeURIComponent(zone)}`);
          const json = await response.json();
          if (!json.status || !json.result) throw new Error(json.error || "Gagal mengambil data akun MLBB");

          let resMsg = `👤 *${botName} - MLBB ACCOUNT INFO*\n\n`;
          resMsg += `• *Username:* ${json.result.userName || json.result.username || json.result.name || '-'}\n`;
          resMsg += `• *User ID:* ${id}\n`;
          resMsg += `• *Zone ID:* ${zone}\n`;
          await m.reply(resMsg.trim());
          break;
        }

      default:
        m.reply(`❌ Mode tidak dikenal. Gunakan: tier, counter, synergy, build, atau stalk.`);
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + e.message);
  }
};

handler.help = ["mlbbcek <mode> [query]"];
handler.tags = ["mlbb", "game"];
handler.command = /^(mlbbcek|mlcek|mlbb)$/i;
handler.limit = 1;

export default handler;
