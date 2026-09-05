let handler = async (m, { conn }) => {
    const rawOwners = global.owner || [];
    let list = [];

    for (let o of rawOwners) {
        let num = (Array.isArray(o) ? o[0] : o).toString().replace(/[^0-9]/g, '');
        if (!num) continue;

        let displayName = (Array.isArray(o) && o[1]) ? o[1] : (global.ownername || 'Owner');
        let jid = num + '@s.whatsapp.net';

        try {
            const name = await conn.getName(jid);
            if (name) displayName = name;
        } catch {}

        list.push({
            displayName: displayName,
            vcard: `BEGIN:VCARD\n` +
                   `VERSION:3.0\n` +
                   `N:${displayName}\n` +
                   `FN:${displayName}\n` +
                   `item1.TEL;waid=${num}:+${num}\n` +
                   `item1.X-ABLabel:Ponsel\n` +
                   `END:VCARD`
        });
    }

    if (list.length === 0) {
        return m.reply("❌ Tidak ada kontak owner yang terdaftar.");
    }

    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: `${list.length} Kontak Owner`,
            contacts: list
        }
    }, {
        quoted: m
    });
};

handler.help = ["owner", "creator"];
handler.command = /^(owner|creator|own)$/i;
handler.tags = ["info"];

export default handler;