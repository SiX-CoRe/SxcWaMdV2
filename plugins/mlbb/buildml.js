import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`📌 *Format Penggunaan:*\n${usedPrefix + command} <nama_hero>\n\n*Contoh:*\n${usedPrefix + command} chou\n${usedPrefix + command} fanny\n${usedPrefix + command} angela`);
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let heroQuery = text.trim().toLowerCase();
        let apiKey = global.apikey?.jereapi || global.apiKey;

        // 1. Fetch Tier & Hero Info
        let tierRes = await fetch(`${global.web}/api/mlbb/tier?apikey=${apiKey}`);
        let tierJson = await tierRes.json();
        let allHeroes = (tierJson.status && (tierJson.result || tierJson.data)) || [];

        let foundHero = null;
        if (Array.isArray(allHeroes)) {
            foundHero = allHeroes.find(h => (h.hero_name || h.hero || h.name || '').toLowerCase() === heroQuery) ||
                        allHeroes.find(h => (h.hero_name || h.hero || h.name || '').toLowerCase().includes(heroQuery));
        }

        const botName = (global.botname || 'BOT').toUpperCase();
        let heroName = foundHero?.hero_name || foundHero?.name || text.toUpperCase();
        let roles = Array.isArray(foundHero?.roles) ? foundHero.roles.join(', ') : (foundHero?.roles || 'Fighter / Flex');
        let lanes = Array.isArray(foundHero?.lanes) ? foundHero.lanes.join(', ') : (foundHero?.lanes || 'EXP / Roam');
        let tierRank = foundHero?.tier || foundHero?.grade || 'A';

        // 2. Fetch Synergy & Counter for extra insights
        let [synRes, countRes] = await Promise.all([
            fetch(`${global.web}/api/mlbb/synergy?apikey=${apiKey}&allies=${encodeURIComponent(heroName)}`).then(r => r.json()).catch(() => ({})),
            fetch(`${global.web}/api/mlbb/counter?apikey=${apiKey}&enemies=${encodeURIComponent(heroName)}`).then(r => r.json()).catch(() => ({}))
        ]);

        let synergies = (synRes.status && (synRes.result || synRes.data)) || [];
        let counters = (countRes.status && (countRes.result || countRes.data)) || [];

        let card = `⚔️ *${botName} - MLBB BUILD & HERO GUIDE*\n\n`;
        card += `👤 *Hero:* ${heroName}\n`;
        card += `🏷️ *Role:* ${roles}\n`;
        card += `🛣️ *Lane Rekomendasi:* ${lanes}\n`;
        card += `🏆 *Tier Meta:* Tier ${tierRank}\n\n`;

        card += `🛡️ *REKOMENDASI BUILD ITEM (TOP META):*\n`;
        card += `1. Tough Boots / Warrior Boots (Movement)\n`;
        card += `2. Blade of the Heptaseas / War Axe (Core Damage)\n`;
        card += `3. Hunter Strike / Endless Battle (Cooldown & Speed)\n`;
        card += `4. Malefic Roar (Physical PEN)\n`;
        card += `5. Blade of Despair / Queen's Wings (Burst / Sustain)\n`;
        card += `6. Immortality / Athena's Shield (Late Game Defense)\n\n`;

        card += `🔮 *BATTLE SPELL:* Flicker / Retribution / Purify\n`;
        card += `✨ *EMBLEM:* Custom Assassin / Fighter (Thrill, Master Assassin, Lethal Ignition)\n\n`;

        if (Array.isArray(synergies) && synergies.length > 0) {
            card += `⚡ *Best Combo Allies:* ${synergies.slice(0, 3).map(s => s.hero_name || s.name).join(', ')}\n`;
        }
        if (Array.isArray(counters) && counters.length > 0) {
            card += `⚠️ *Waspada Counter Hero:* ${counters.slice(0, 3).map(c => c.hero_name || c.name).join(', ')}\n`;
        }

        card += `\n💡 *Tips Gameplay:* Kuasai positioning skill, manfaatkan bush, dan sesuaikan item counter lawan saat pertandingan!`;

        await conn.sendMessage(m.chat, { text: card.trim() }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        console.error('[Build MLBB Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply('❌ Terjadi kesalahan: ' + e.message);
    }
};

handler.help = ['buildml <hero>', 'build <hero>'];
handler.tags = ['mlbb'];
handler.command = /^(buildml|build|mlbuild|itemml)$/i;
handler.limit = 1;

export default handler;
