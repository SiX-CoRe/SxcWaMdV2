let handler = async (m, { text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let content = m.quoted?.text ? m.quoted.text : text;

    if (!content) {
        return m.reply(`🔓 *DECODER (BASE64, HEX, BINARY)*\n\nContoh:\n${usedPrefix + command} SGFsbyBEdW5pYQ==\n${usedPrefix + command} hex|48616c6f\n${usedPrefix + command} binary|01001000 01100001`);
    }

    try {
        let type = 'base64';
        let str = content.trim();

        if (content.includes('|')) {
            let parts = content.split('|');
            let first = parts[0].trim().toLowerCase();
            if (['base64', 'hex', 'binary', 'bin'].includes(first)) {
                type = first;
                str = parts.slice(1).join('|').trim();
            }
        }

        let decoded = '';
        if (type === 'base64') {
            decoded = Buffer.from(str, 'base64').toString('utf8');
        } else if (type === 'hex') {
            decoded = Buffer.from(str, 'hex').toString('utf8');
        } else if (type === 'binary' || type === 'bin') {
            decoded = str.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
        }

        let caption = `🔓 *DECODE (${type.toUpperCase()})*\n\n`;
        caption += ```${decoded}```;

        await m.reply(caption);
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['dec <encoded>', 'decode <base64|hex|binary>|<encoded>'];
handler.tags = ['tools'];
handler.command = /^(dec|decode|base64dec)$/i;

handler.limit = 1;
export default handler;
