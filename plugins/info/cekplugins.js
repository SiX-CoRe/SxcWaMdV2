let handler = async (m, { conn }) => {
    let pluginsObj = (global.pg || (typeof pg !== 'undefined' ? pg : null))?.plugins || global.plugins || {};
    let keys = Object.keys(pluginsObj);
    
    let text = `📊 *PLUGIN INSPECTOR*\n\n` +
               `🔹 *Total Plugin Loaded:* ${keys.length} file\n\n` +
               `📋 *Contoh 10 Plugin Pertama:*\n`;

    for (let i = 0; i < Math.min(10, keys.length); i++) {
        text += `├─ ⚡ \`${keys[i]}\`\n`;
    }
    text += `└─────────────────────────`;

    m.reply(text.trim());
};

handler.help = ['cekplugins'];
handler.tags = ['info'];
handler.command = /^cekplugins$/i;

export default handler;
