import axios from 'axios'
import bu from '@library/sticker.js'

let brat = async (m, { conn, text }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply('Format salah\nContoh:\n.brat halo dunia')
  }

  try {
    const res = await axios.get(
      `${global.web}/api/maker/brat`,
      {
        params: {
          apikey: global.apikey.jereapi,
          text: text,
          type: 'image'
        },
        responseType: 'arraybuffer'
      }
    )

    const packname = global.stickerPack?.packname || global.botname || 'SXCWAMD'
    const author = global.stickerPack?.author || global.ownername || 'lumnztyz6x'

    const sticker = await bu.writeExif(
      { data: res.data, mimetype: 'image/png' },
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
    m.reply('Gagal generate brat: ' + e.message)
  }
}

brat.help = ['brat <teks>']
brat.tags = ['sticker']
brat.command = /^brat$/i
brat.limit = true

export default brat