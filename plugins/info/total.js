let handler = async (m) => {
    const pluginsObj = (global.pg || (typeof pg !== 'undefined' ? pg : null))?.plugins || global.plugins || {};
    const fileAll = Object.keys(pluginsObj);

    const pluginList = [];
    for (let fold of fileAll) {
        if (pluginsObj[fold]) pluginList.push(pluginsObj[fold]);
    }

    const tags = new Set();
    let totalFitur = 0;

    for (let v of pluginList) {
        if (!v) continue;
        if (Array.isArray(v.tags)) {
            for (let t of v.tags) if (t) tags.add(t);
        }
        if (Array.isArray(v.help)) {
            totalFitur += v.help.length;
        } else if (v.help) {
            totalFitur += 1;
        }
    }

    m.reply(
`╔══════════════════════════╗
║  📊 *TOTAL FITUR & TAGS* 📊  ║
╚══════════════════════════╝

┌───❖ *STATISTIK BOT* ❖───
│
├─⚡ *Total Fitur Command:* ${totalFitur} fitur
├─🏷️ *Total Kategori Tags:* ${tags.size} kategori
├─📁 *Total File Plugin   :* ${fileAll.length} plugin
│
└─────────────────────────`
    );
};

handler.help = ["total", "totalfitur", "totaltags"];
handler.command = /^(total|totalfitur|totaltags)$/i;
handler.tags = ["info"];

export default handler;