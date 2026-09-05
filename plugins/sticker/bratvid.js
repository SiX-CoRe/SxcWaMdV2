import axios from 'axios'
import bu from '@library/sticker.js'

let bratvid = async (m, { conn, text }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply('Format salah\nContoh:\n.bratvid halo dunia')
  }

  try {
    const res = await axios.get(
      `${global.web}/api/maker/brat`,
      {
        params: {
          apikey: global.apikey.jereapi,
          text: text,
          type: 'video'
        },
        responseType: 'arraybuffer'
      }
    )

    const packname = global.stickerPack?.packname || global.botname || 'SXCWAMD'
    const author = global.stickerPack?.author || global.ownername || 'lumnztyz6x'

    const mime = res.headers['content-type'] || 'video/mp4'
    const sticker = await bu.writeExif(
      { data: res.data, mimetype: mime },
      {
        packName: packname,
        packPublish: author
      }
    )

    await conn.sendMessage(m.chat, { sticker }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('Gagal generate bratvid: ' + e.message)
  }
}

bratvid.help = ['bratvid <teks>']
bratvid.tags = ['sticker']
bratvid.command = /^bratvid$/i
bratvid.limit = true

export default bratvid