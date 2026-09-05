let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let text = args[0] || "";
        if (!text || !text.includes("whatsapp.com/channel/")) {
            return m.reply(`⚠️ *Masukkan link saluran / channel WhatsApp!*\n\n👉 *Contoh:* ${usedPrefix + command} https://whatsapp.com/channel/0029Vb7XYjLKgsNyWrRHL10k`);
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const regex = text.replace(/https:\/\/(www\.)?whatsapp\.com\/channel\//gi, "").split(" ")[0].split("?")[0];
        const ch = await conn.newsletterMetadata("invite", regex);
        const metadata = ch?.thread_metadata || ch?.metadata || {};

        const chName = typeof metadata?.name === 'object' ? (metadata?.name?.text || '') : (metadata?.name || 'Channel');
        const chState = typeof ch?.state === 'object' ? (ch?.state?.type || '') : (ch?.state || 'ACTIVE');
        const chFollowers = Number(metadata?.subscribers_count || metadata?.subscribersCount || 0).toLocaleString();
        const chVerification = typeof metadata?.verification === 'object' ? JSON.stringify(metadata.verification) : (metadata?.verification || 'None');
        const chId = ch?.id || '';

        const caption = `📢 *METADATA CHANNEL WHATSAPP*\n\n` +
                        `📛 *Nama Channel:* ${chName}\n` +
                        `👥 *Followers:* ${chFollowers}\n` +
                        `🛡️ *Status:* ${chState}\n` +
                        `✅ *Verifikasi:* ${chVerification}\n` +
                        `🔑 *Channel ID:* \`\`\`${chId}\`\`\``;

        const buttons = [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: "📋 Salin ID Channel",
                copy_code: chId,
            }),
        }];

        const previewPath = metadata?.preview?.direct_path || metadata?.preview?.directPath;
        if (previewPath) {
            try {
                await conn.sendButton(m.chat, {
                    image: {
                        url: "https://mmg.whatsapp.net" + previewPath
                    },
                    caption,
                    buttons
                }, { quoted: m });
            } catch {
                await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
            }
        } else {
            try {
                await conn.sendButton(m.chat, {
                    text: caption,
                    buttons
                }, { quoted: m });
            } catch {
                await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
            }
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Gagal mengambil metadata channel: " + (e.message || e));
    }
};

handler.help = ["cic <link_channel>", "cekidch <link_channel>"];
handler.command = /^(cic|cekidch)$/i;
handler.tags = ["info"];
handler.limit = true;

export default handler;