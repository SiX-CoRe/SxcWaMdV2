import fetch from 'node-fetch';

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`✨ *STYLE TEXT / FANCY FONT GENERATOR*\n\nUbah teks biasa menjadi berbagai gaya font keren!\nContoh:\n${usedPrefix + command} JereXD Bot`);
    }

    try {
        let res = await fetch(`https://api.lolhuman.xyz/api/styletext?apikey=GataDios&text=${encodeURIComponent(text)}`).catch(() => null);
        let styles = [];

        if (res && res.ok) {
            let json = await res.json();
            if (json.status && json.result) styles = json.result;
        }

        if (!styles || styles.length === 0) {
            // Local fallback styles
            const fonts = [
                t => t.toUpperCase(),
                t => t.split('').join(' '),
                t => '『 ' + t + ' 』',
                t => '【 ' + t + ' 】',
                t => '★ ' + t + ' ★',
                t => '╰┈➤ ' + t,
                t => '•·.·´¯`·.·• ' + t + ' •·.·´¯`·.·•'
            ];
            styles = fonts.map(fn => fn(text));
        }

        let caption = `✨ *GAYA FONT (STYLE TEXT)*\n\n`;
        styles.slice(0, 20).forEach((st, i) => {
            let val = typeof st === 'object' ? (st.result || st.name || JSON.stringify(st)) : st;
            caption += `*[${i + 1}]* ${val}\n`;
        });
        caption += `\n💡 *Salin teks gaya yang kamu suka!*`;

        await m.reply(caption);
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['styletext <teks>', 'fancytext <teks>'];
handler.tags = ['tools'];
handler.command = /^(styletext|fancytext|font|textstyle)$/i;

handler.limit = 1;
export default handler;
