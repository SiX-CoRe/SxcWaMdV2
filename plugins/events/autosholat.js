let handler = m => m;

handler.before = async (m, {
    conn,
    participants
}) => {
    conn.autoshalat = conn.autoshalat ? conn.autoshalat : {}
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user?.id : m.sender;

    let id = m.chat
    if (id in conn.autoshalat) {
        return false
    }
    let jadwalSholat = {
        subuh: '04:24',
        terbit: '06:11',
        dzuhur: '11:57',
        ashar: '15:22',
        magrib: '18:05',
        isya: '19:19',
    }

    try {
        const datek = new Date((new Date).toLocaleString("en-US", {
            timeZone: "Asia/Jakarta"
        }))
        const hours = datek.getHours()
        const minutes = datek.getMinutes()
        const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
        for (let [sholat, waktu] of Object.entries(jadwalSholat)) {
            if (typeof waktu !== 'function' && timeNow === waktu) {
                conn.autoshalat[id] = [
                    await conn.sendMessage(m.chat, {
                        audio: { url: "https://media.vocaroo.com/mp3/1ofLT2YUJAjQ" },
                        mimetype: "audio/mpeg",
                    }, {
                        quoted: m,
                        mentions: Array.isArray(participants) ? participants.map(a => a?.id).filter(Boolean) : []
                    }).catch(() => null),
                    setTimeout(async () => {
                        delete conn.autoshalat[m.chat]
                    }, 57000)
                ]
            }
        }
    } catch (e) {
        console.error('[Autosholat Error]', e);
    }
}

export default handler;
