import crypto from 'crypto';

if (!global.groupSecurity) global.groupSecurity = {};

const KATA_KASAR = [
    'anjing', 'anjg', 'anj', 'bangsat', 'bngst', 'babi', 'kontol', 'memek', 'ngentot', 'ngetot',
    'jancok', 'janc0k', 'jancuk', 'kampret', 'bajingan', 'keparat', 'bedebah', 'setan', 'iblis',
    'tolol', 'goblok', 'goblog', 'bego', 'idiot', 'bodoh', 'dungu', 'tai', 't4i', 'taik',
    'asu', 'celeng', 'dancuk', 'pukimak', 'kimak', 'pantek', 'sialan', 'sempak', 'pepek',
    'titit', 'toket', 'peler', 'cuk', 'cok', 'fuck', 'shit', 'bitch', 'bastard', 'asshole',
    'motherfucker', 'fucker', 'damn', 'nigga', 'nigger', 'fck', 'stfu', 'wtf',
    'lonte', 'pelacur', 'sundel', 'sundal', 'perek', 'jablay', 'brntk', 'bangke', 'gila lo',
    'mati lo', 'mati kau', 'dasar bodoh', 'dasar goblok', 'dasar tolol', 'brengsek'
];

const AES_KEY = 'ai-enhancer-web__aes-key';
const AES_IV = 'aienhancer-aesiv';

function encryptNsfw(obj) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(AES_KEY, 'utf8'), Buffer.from(AES_IV, 'utf8'));
    let encrypted = cipher.update(JSON.stringify(obj), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

async function checkNsfw(imageUrl) {
    try {
        const settings = encryptNsfw({ image: imageUrl });
        const createRes = await fetch('https://aienhancer.ai/api/v1/r/nsfw-detection/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageUrl, settings }),
            signal: AbortSignal.timeout(15000)
        });
        const create = await createRes.json();
        const id = create?.data?.id;
        if (!id) return 'normal';

        for (let i = 0; i < 8; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const res = await fetch('https://aienhancer.ai/api/v1/r/nsfw-detection/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: id }),
                signal: AbortSignal.timeout(10000)
            });
            const resJson = await res.json();
            if (resJson?.data?.status === 'succeeded') {
                return resJson.data.output || 'normal';
            }
        }
        return 'normal';
    } catch (e) {
        return 'normal';
    }
}

async function uploadBuffer(buffer, mime) {
    try {
        const form = new FormData();
        const blob = new Blob([buffer], { type: mime || 'image/jpeg' });
        form.append('file', blob, `img_${Date.now()}.jpg`);
        const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form });
        const json = await res.json();
        return json?.files?.[0]?.url || null;
    } catch (e) {
        return null;
    }
}

function isToxic(text) {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase().replace(/[^a-z0-9\s]/gi, '');
    return KATA_KASAR.some(kata => {
        const clean = kata.replace(/[^a-z0-9\s]/gi, '');
        return lower.includes(clean);
    });
}

let handler = async (m, { conn, isAdmin, isBotAdmin, isCreator }) => {};

handler.before = async function(m, { conn, isAdmin, isBotAdmin, isCreator }) {
    if (!m.isGroup) return false;

    const chat = m.chat;
    let s = global.groupSecurity?.[chat];
    if (!s) {
        if (global.db?.data?.chats?.[chat]?.groupSecurity) {
            global.groupSecurity[chat] = global.db.data.chats[chat].groupSecurity;
            s = global.groupSecurity[chat];
        }
    }
    if (!s) return false;

    const sender = m.sender;
    const senderNumber = (sender || '').split('@')[0].replace(/[^0-9]/g, '');
    const isOwner = isCreator || (global.owner && global.owner.some(o => {
        const num = (Array.isArray(o) ? o[0] : o).toString().replace(/[^0-9]/g, '');
        return num === senderNumber;
    }));

    // Pengecualian MUTLAK: Admin Grup, Owner Bot, & Nomor Bot sendiri
    const isExempt = isAdmin || isOwner || m.fromMe || global.db?.data?.users?.[m._normSender || sender]?.vip || global.db?.data?.users?.[m._normSender || sender]?.premium;
    if (isExempt) return false;
    if (!isBotAdmin) return false;

    const msg = m.msg || {};
    const mime = msg?.mimetype || '';
    const msgType = m.mtype || '';
    const bodyText = m.text || '';

    async function enforce(fitur, alasan) {
        const setting = s[fitur];
        if (!setting?.aktif) return false;
        const mode = setting.mode || 'delete';

        try {
            await conn.sendMessage(chat, { delete: m.key });
        } catch (e) {}

        if (mode === 'kick') {
            await conn.sendMessage(chat, {
                text: `🛡️ *GROUP SECURITY DETECTED!*\n\n👤 *User:* @${sender.split('@')[0]}\n⚠️ *Pelanggaran:* ${alasan}\n⚡ *Tindakan:* User telah di-KICK dari grup.`,
                mentions: [sender]
            }).catch(() => {});
            await conn.groupParticipantsUpdate(chat, [sender], 'remove').catch(() => {});
        } else if (mode === 'warn') {
            if (global.db?.data?.users?.[sender]) {
                global.db.data.users[sender].warn = (global.db.data.users[sender].warn || 0) + 1;
                const warnCount = global.db.data.users[sender].warn;
                await conn.sendMessage(chat, {
                    text: `🛡️ *GROUP SECURITY WARNING!*\n\n👤 *User:* @${sender.split('@')[0]}\n⚠️ *Pelanggaran:* ${alasan}\n⚡ *Total Peringatan:* ${warnCount}/3`,
                    mentions: [sender]
                }).catch(() => {});
            }
        } else {
            await conn.sendMessage(chat, {
                text: `🛡️ *GROUP SECURITY:* Pesan dari @${sender.split('@')[0]} dihapus otomatis (${alasan}).`,
                mentions: [sender]
            }).catch(() => {});
        }
        return true;
    }

    // 1. Anti Tag/Mention Status WhatsApp (antitagsw)
    const isTagSW = msgType === 'groupStatusMentionMessage' || 
                    m.message?.groupStatusMentionMessage || 
                    m.message?.protocolMessage?.type === 25 ||
                    msg?.contextInfo?.statusJidList?.length > 0 ||
                    (bodyText && (bodyText.includes('@status') || bodyText.includes('status@broadcast'))) ||
                    (Array.isArray(m.mentionedJid) && m.mentionedJid.some(j => String(j).includes('status@broadcast') || j === 'status@broadcast'));

    if (s.antitagsw?.aktif && isTagSW) {
        return await enforce('antitagsw', 'melakukan Tag/Mention Status WhatsApp (SW)');
    }

    // 2. Anti Kirim/Forward/Quote Status WhatsApp ke Grup (antisw)
    const isShareSW = m.quoted?.sender === 'status@broadcast' || 
                      m.quoted?.chat === 'status@broadcast' ||
                      msg?.contextInfo?.remoteJid === 'status@broadcast' || 
                      msg?.contextInfo?.participant === 'status@broadcast' ||
                      (msg?.contextInfo?.remoteJid && typeof msg.contextInfo.remoteJid === 'string' && msg.contextInfo.remoteJid.endsWith('@broadcast') && !msg.contextInfo.remoteJid.includes('newsletter'));

    if (s.antisw?.aktif && isShareSW) {
        return await enforce('antisw', 'meneruskan/membagikan Status WhatsApp ke dalam grup');
    }

    // 3. Anti Link WhatsApp (Grup / Saluran)
    const waLinkRegex = /(chat\.whatsapp\.com|whatsapp\.com\/channel|wa\.me\/channel)/i;
    if (s.antilinkwa?.aktif && bodyText && waLinkRegex.test(bodyText)) {
        return await enforce('antilinkwa', 'mengirim link grup/channel WhatsApp');
    }

    // 4. Anti Link Umum (Semua jenis website/URL)
    const generalLinkRegex = /(https?:\/\/[^\s]+|wa\.me\/[^\s]+|t\.me\/[^\s]+|linktr\.ee\/[^\s]+|lynk\.id\/[^\s]+)/i;
    if (s.antilink?.aktif && bodyText && generalLinkRegex.test(bodyText)) {
        return await enforce('antilink', 'mengirim link/tautan website');
    }

    // 5. Anti Pesan Terusan (Forward)
    if (s.antiforward?.aktif && (msg?.contextInfo?.isForwarded || msg?.isForwarded)) {
        return await enforce('antiforward', 'mengirim pesan terusan/forward');
    }

    // 6. Anti Sticker
    if (s.antisticker?.aktif && msgType === 'stickerMessage') {
        return await enforce('antisticker', 'mengirim sticker');
    }

    // 7. Anti Foto
    if (s.antifoto?.aktif && (msgType === 'imageMessage' || mime.startsWith('image/'))) {
        return await enforce('antifoto', 'mengirim foto/gambar');
    }

    // 8. Anti Video
    if (s.antivideo?.aktif && (msgType === 'videoMessage' || mime.startsWith('video/'))) {
        return await enforce('antivideo', 'mengirim video');
    }

    // 9. Anti Voice Note / Audio
    if (s.antivoice?.aktif && (msgType === 'audioMessage' || mime.includes('ogg') || mime.startsWith('audio/'))) {
        return await enforce('antivoice', 'mengirim voice note/audio');
    }

    // 10. Anti Dokumen / File
    if (s.antidokumen?.aktif && (msgType === 'documentMessage' || msgType === 'documentWithCaptionMessage' || mime.includes('application') || mime.includes('pdf') || mime.includes('zip') || mime.includes('rar') || mime.includes('msword') || mime.includes('spreadsheet'))) {
        return await enforce('antidokumen', 'mengirim dokumen/file');
    }

    // 11. Anti Bot Lain
    if (s.antibot?.aktif) {
        const isForwardFromBot = msg?.contextInfo?.participant && msg.contextInfo.participant !== sender;
        if (isForwardFromBot) return await enforce('antibot', 'terdeteksi aktivitas bot lain');
    }

    // 12. Anti Kata Kasar / Toxic
    if (s.antitoxic?.aktif && bodyText && isToxic(bodyText)) {
        return await enforce('antitoxic', 'menggunakan kata kasar/toxic');
    }

    // 13. Anti NSFW
    if (s.antinsfw?.aktif && (msgType === 'imageMessage' || msgType === 'videoMessage') && mime.startsWith('image/')) {
        try {
            const buffer = await m.download?.() || await msg.download?.();
            if (buffer) {
                const imgUrl = await uploadBuffer(buffer, mime);
                if (imgUrl) {
                    const result = await checkNsfw(imgUrl);
                    if (result && result !== 'normal') {
                        return await enforce('antinsfw', `mengirim konten NSFW (${result})`);
                    }
                }
            }
        } catch (e) {
            console.error('[AntiNSFW Check Error]', e);
        }
    }

    return false;
};

handler.help = [];
handler.tags = ['group'];
handler.command = /^$/;
handler.group = true;

export default handler;
