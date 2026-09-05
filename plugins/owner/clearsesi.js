import fs from 'node:fs';

let handler = async (m, {
    conn
}) => {
    const ootaedit = await conn.sendMessage(m.chat, {
        text: "Wait.... Sessions Mau Di Hapus!"
    }, {
        quoted: m
    });
    fs.readdir(`./sessions`, async function(err, files) {
        if (err) {
            console.log('Unable to scan directory: ' + err);
            return m.reply('Unable to scan directory: ' + err);
        }
        let filteredArray = await files.filter(item => item.startsWith("pre-key") ||
            item.startsWith("sender-key") || item.startsWith("session-") || item.startsWith("app-state")
        )
        let teks = ` *– 乂 Sessions - Akan Di Delete*\n\n`
        if (filteredArray.length == 0) return conn.sendMessage(m.chat, {
            text: `${teks}`,
            edit: ootaedit.key
        }, {
            quoted: m
        })
        filteredArray.map(function(e, i) {
            teks += (i + 1) + `. ${e}\n`
        })
        await conn.sendMessage(m.chat, {
            text: `${teks}`,
            edit: ootaedit.key
        }, {
            quoted: m
        })
        await sleep(2000)
        await conn.sendMessage(m.chat, {
            text: `🖐️Wait... Sessions Mau Di Hapus!!`,
            edit: ootaedit.key
        }, {
            quoted: m
        })
        await filteredArray.forEach(function(file) {
            fs.unlinkSync(`./sessions/${file}`)
        });
        await sleep(2000)
        await conn.sendMessage(m.chat, {
            text: `✅ Oke Sessions Udah Di Hapus!!`,
            edit: ootaedit.key
        }, {
            quoted: m
        })
    });
};

handler.command = ["delsesi", "clearsesi", "deletesesi"];
handler.help = ["delsesi", "clearsesi", "deletesesi"];
handler.tags = ["owner"];
handler.owner = true;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default handler;
