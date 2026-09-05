import fs from "fs"
import path from "path"
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from "@adiwajshing/baileys"

const CACHE_PATH = path.resolve("./src/cache.json")

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      "❌ Masukkan kata kunci pencarian\n\nContoh:\n.bbsearch dj"
    )
  }

  const query = text.trim().toLowerCase()

  let cache = {}
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH))
  } catch {
    return m.reply("❌ Cache boombox tidak ditemukan.")
  }

  // kumpulin hasil berdasarkan title
  const results = []
  for (const [ytUrl, data] of Object.entries(cache)) {
    const title = (data.title || "").toLowerCase()
    if (title.includes(query)) {
      results.push({
        ytUrl,
        ...data
      })
    }
  }

  if (!results.length) {
    return m.reply("❌ Tidak ditemukan hasil dengan kata kunci tersebut.")
  }

  const cards = []

  // ambil maksimal 10 item VALID
  for (const item of results) {
    if (!item.thumbnail || !item.top4top) continue

    try {
      const media = await prepareWAMessageMedia(
        { image: { url: item.thumbnail } },
        { upload: conn.waUploadToServer }
      )

      cards.push({
        header: proto.Message.InteractiveMessage.Header.fromObject({
          hasMediaAttachment: true,
          ...media
        }),
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `🎵 *${item.title}*`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: `👤 ${item.by || "Unknown"}`
        }),
        nativeFlowMessage:
          proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "📋 Salin Link Top4Top",
                  id: "copy_top4top",
                  copy_code: item.top4top
                })
              }
            ]
          })
      })

      if (cards.length >= 10) break
    } catch (e) {
      console.log("[BBSEARCH CARD ERROR]:", e.message)
      continue
    }
  }

  if (!cards.length) {
    return m.reply(
      "❌ Data ditemukan, tapi tidak ada item valid untuk ditampilkan."
    )
  }

  const msg = await generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessageV2Extension: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage:
            proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `📁 *Hasil Pencarian Boombox*\n🔎 Kata kunci: *${query}*\n📊 Ditemukan ${results.length} hasil`
              }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: "🎶 Boombox Search"
              }),
              carouselMessage:
                proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                  cards
                })
            })
        }
      }
    },
    { quoted: m }
  )

  await conn.relayMessage(m.chat, msg.message, {
    messageId: msg.key.id
  })
}

handler.help = ["bbsearch <query>"]
handler.tags = ["samp"]
handler.command = /^(bbsearch|bsearch)$/i
handler.limit = true

export default handler