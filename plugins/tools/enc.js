let handler = async (m, { text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let content = m.quoted?.text ? m.quoted.text : text;

    if (!content) {
        return m.reply(`🔒 *ENCODER (BASE64, HEX, BINARY)*\n\nContoh:\n${usedPrefix + command} Halo Dunia\n${usedPrefix + command} hex|Halo Dunia\n${usedPrefix + command} binary|Halo Dunia`);
    }

    try {
        let type = 'base64';
        let str = content;

        if (content.includes('|')) {
            let parts = content.split('|');
            let first = parts[0].trim().toLowerCase();
            if (['base64', 'hex', 'binary', 'bin'].includes(first)) {
                type = first;
                str = parts.slice(1).join('|').trim();
            }
        }

        let encoded = '';
        if (type === 'base64') {
            encoded = Buffer.from(str, 'utf8').toString('base64');
        } else if (type === 'hex') {
            encoded = Buffer.from(str, 'utf8').toString('hex');
        } else if (type === 'binary' || type === 'bin') {
            encoded = str.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        }

        let caption = `🔒 *ENCODE (${type.toUpperCase()})*\n\n`;
        caption += ```${encoded}```;

        await m.reply(caption);
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['enc <teks>', 'encode <base64|hex|binary>|<teks>'];
handler.tags = ['tools'];
handler.command = /^(enc|encode|base64enc)$/i;

handler.limit = 1;
export default handler;
