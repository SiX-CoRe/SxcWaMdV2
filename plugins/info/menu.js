import os from "node:os";
import fs from "node:fs";
import path from 'path';
import {
    fileURLToPath
} from 'url';
let num = "13135550002@s.whatsapp.net";
import convert from "@library/toAll.js";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginFolder = path.join(__dirname, '../plugins');
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

let handler = async (m, {
    conn,
    text,
    isROwner,
    usedPrefix,
    command
}) => {
    try {
        async function loadPlugins() {
            const pluginsObj = (global.pg || (typeof pg !== 'undefined' ? pg : null))?.plugins || global.plugins || {};
            const pluginFile = Object.values(pluginsObj).filter(plu => plu);
            return pluginFile;
        }

        const plugins = await loadPlugins();

        let resize = null;
        try {
            const url = await conn.profilePictureUrl(num, 'image').catch(() => null);
            if (url) {
                const res = await fetch(url);
                const metre = Buffer.from(await res.arrayBuffer());
                resize = await conn.resize(metre, 200, 200).catch(() => null);
            }
        } catch (e) {}

        const floc = {
            key: {
                participant: num,
                ...(m.chat ? {
                    remoteJid: 'status@broadcast'
                } : {})
            },
            message: {
                locationMessage: {
                    name: global.botname || 'SXCWA-MD',
                    jpegThumbnail: resize
                }
            }
        };

        function getBadge(plugin) {
            
            if (plugin.premium) return ' 🌟 (PREM)';
            if (plugin.limit) return ' ⚡';
            return '';
        }

        function getPluginsByTags(selectedTags = []) {
            const tagCount = {};
            const tagHelpMapping = {};
            const selectedTagsLower = selectedTags.map(tag => tag.toLowerCase());

            Object.keys(plugins)
                .filter(pluginName => !plugins[pluginName]?.disabled)
                .forEach(pluginName => {
                    const plugin = plugins[pluginName];
                    if (!plugin) return;
                    const tagsArray = Array.isArray(plugin.tags) ? plugin.tags : [];
                    const helpArray = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : []);
                    const badge = getBadge(plugin);

                    tagsArray.forEach(tag => {
                        if (!tag || typeof tag !== 'string') return;
                        const tagLower = tag.toLowerCase();
                        if (selectedTags.length > 0 && !selectedTagsLower.includes(tagLower)) return;

                        if (tagCount[tag]) {
                            tagCount[tag]++;
                            tagHelpMapping[tag].push(...helpArray.map(h => ({ help: h, badge })));
                        } else {
                            tagCount[tag] = 1;
                            tagHelpMapping[tag] = [...helpArray.map(h => ({ help: h, badge }))];
                        }
                    });
                });

            if (!Object.keys(tagCount).length) return "Tidak ada plugin yang ditemukan dengan tag yang ditentukan.";

            return Object.keys(tagCount)
                .map(tag => {
                    const helpList = (tagHelpMapping[tag] || [])
                        .map((item) => `  │ ✧ ${usedPrefix}${item.help}${item.badge}`)
                        .join("\n");

                    return `╭── [ *${tag.toUpperCase()}* ]
${helpList}
╰──────────────`;
                })
                .join("\n\n");
        }

        const jidsen = await (await conn?.signalRepository?.lidMapping?.getPNForLID(m.sender).catch(() => null))?.replace(/:\d+@/, '@');
        let senderJid = (m.sender || '').replace(/:\d+/, '');
        let ownerList = (global.owner || []).map(v => (Array.isArray(v) ? v[0] : v).toString().replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        let isOwner = ownerList.includes(senderJid) || m.fromMe || isROwner;
        let isPremium = global.db?.data?.users?.[m._normSender || m.sender]?.premium || false;
        
        let userStatus = '👤 Free User';
        if (isROwner || isOwner) userStatus = '👑 Owner';
        else if (isPremium) userStatus = '🌟 Premium';

        let curLimit = global.db?.data?.users?.[m._normSender || m.sender]?.limit;
        if (isOwner) curLimit = 'Unlimited (∞)';
        else if (isPremium) curLimit = (curLimit && curLimit > 20) ? curLimit : 1000;
        else curLimit = (curLimit !== undefined && curLimit !== null) ? curLimit : 20;

        const user = {
            name: m.pushName || 'User',
            number: (jidsen || m.sender || '').split('@')[0].split(':')[0] || '62xxx-xxx-xxx',
            limit: curLimit,
            status: userStatus
        };

        const botNumber = Array.isArray(global.owner) && global.owner.length > 0 ? (Array.isArray(global.owner[0]) ? global.owner[0][0] : global.owner[0]) : '';
        const cleanBotNumber = String(botNumber).replace('@s.whatsapp.net', '').split('@')[0];

        const botInfo = {
            name: global.botname || 'SXCWA-MD',
            number: cleanBotNumber
        };

        const stylishHeader = `
╭── [ *SXCWA-MD* ] ──╮
│ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
│╭──── [ ✨ *INFORMATION* ✨ ]
│├ Name   : *${String(user.name).toLowerCase()}*
│├ Number : *${user.number}*
│├ Limit  : *${curLimit}*
│└ Role   : *${String(user.status).toLowerCase()}*
│
│╭───── [ 🤖 *Status Bot* 🤖 ]
│├ time     : *${getIndonesiaTime()} wib*
│├ date     : *${getIndonesiaDate().toLowerCase()}*
│├ plugins  : *${plugins.length} file*
│└ server   : *active (fast response)*
│
│*quick navigation:*
│• \`.menu all\` ➔ tampilkan seluruh fitur bot
│• \`.menu list\` ➔ tampilkan kategori fitur
│• \`.menu prem\` ➔ tampilkan fitur khusus premium
│• \`.owner\` ➔ chat pembuat bot
╰─────────────────────╯
> https://github.com/SiX-CoRe - Source Code No Enc
`;

        const teksdx = `terima kasih telah menggunakan ${botInfo.name.toLowerCase()}!\n\n> © _sixcorecomunity_`;

        let finalCaption = '';
        let normalizedQuery = (text || '').trim().toLowerCase();

        if (normalizedQuery === "all") {
            await conn.delay(1000);
            const allCommands = getPluginsByTags();
            finalCaption = `${stylishHeader}${readmore}\n\n*all commands*\n\n${allCommands}\n\n${teksdx}`;
        } else if (normalizedQuery === "prem" || normalizedQuery === "premium") {
            const premItems = [];
            Object.values(plugins).forEach(plugin => {
                if (plugin && !plugin.disabled && plugin.premium) {
                    const helpArray = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : []);
                    helpArray.forEach(h => {
                        premItems.push(`  ┣ ✧ ${usedPrefix}${h}${getBadge(plugin)}`);
                    });
                }
            });
            const listStr = premItems.length > 0 ? premItems.join('\n') : '  ┣ ✧ Belum ada fitur premium.';
            finalCaption = `${stylishHeader}${readmore}\n\n*🌟 FITUR KHUSUS USER PREMIUM 🌟*\n\n╭── [ *PREMIUM EXCLUSIVE* ]\n${listStr}\n╰──────────────\n\n${teksdx}`;
        } else if (normalizedQuery === "list") {
            const allTags = [];
            Object.values(plugins).forEach(plugin => {
                if (plugin && !plugin.disabled && plugin.tags) {
                    const tList = Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags];
                    tList.forEach(tag => {
                        if (tag && typeof tag === 'string' && !allTags.includes(tag.toLowerCase())) {
                            allTags.push(tag.toLowerCase());
                        }
                    });
                }
            });

            if (!allTags.includes('premium')) allTags.push('premium (🌟)');
            

            allTags.sort();
            let tagsList = '';
            for (let i = 0; i < allTags.length; i += 3) {
                const row = allTags.slice(i, i + 3);
                const formattedRow = row.map(tag => `  ┣ ${tag.toLowerCase()}`).join('\n');
                tagsList += formattedRow + '\n';
            }

            finalCaption = `${stylishHeader}${readmore}\n\n*categories list*\n\n╭── [ available tags ]\n${tagsList}╰──────────────\n\n${teksdx}`;
        } else if (normalizedQuery) {
            await conn.delay(1000);
            const tags = normalizedQuery.split(/[,\s]+/).filter(t => t);
            const filteredCommands = getPluginsByTags(tags);
            finalCaption = `${stylishHeader}${readmore}\n\n*filtered commands [${tags.join(', ').toLowerCase()}]*\n\n${filteredCommands}\n\n${teksdx}`;
        } else {
            finalCaption = `${stylishHeader}${readmore}\n\n*quick selection:*\n• \`.menu all\` ➔ tampilkan seluruh fitur bot\n• \`.menu list\` ➔ tampilkan kategori fitur\n• \`.menu prem\` ➔ tampilkan fitur khusus premium\n\n${teksdx}`;
        }

        let aestheticCaption = finalCaption.toLowerCase();
        
        try {
            await menuBut(m, conn, aestheticCaption);
        } catch (e) {
            console.error(e);
            await m.reply(aestheticCaption);
        }
    } catch (err) {
        console.error(err);
        m.reply("Error: " + (err.message || err));
    }
};

handler.help = ["menu", "coremenu"];
handler.command = ["menu", "coremenu", "help", "cmd"];
handler.tags = ["main"];

const menuBut = async (m, conn, text, options = {}) => {
    let thumbnailBase64 = '';
    try {
        let imageBuffer = null;
        if (fs.existsSync("./media/thumbnail.jpg")) {
            imageBuffer = fs.readFileSync("./media/thumbnail.jpg");
        } else if (fs.existsSync("/sdcard/Download/sxcwamd/assets/banner.jpg")) {
            imageBuffer = fs.readFileSync("/sdcard/Download/sxcwamd/assets/banner.jpg");
        }
        
        if (imageBuffer) {
            try {
                if (typeof conn.resize === 'function') {
                    const thumbnailBuffer = await conn.resize(imageBuffer, 300, 300);
                    thumbnailBase64 = thumbnailBuffer.toString('base64');
                } else {
                    thumbnailBase64 = imageBuffer.toString('base64');
                }
            } catch (err) {
                thumbnailBase64 = imageBuffer.toString('base64');
            }
        }
    } catch (e) {
        console.error("Error generating thumbnail:", e);
    }

    const buttons = [
        { buttonId: ".owner", buttonText: { displayText: 'Owner' }, type: 1 },
        { buttonId: ".menu", buttonText: { displayText: 'Menu' }, type: 1 },
        { buttonId: ".menu all", buttonText: { displayText: 'All Menu' }, type: 1 },
        { buttonId: ".menu list", buttonText: { displayText: 'List Menu' }, type: 1 }
    ];

    const buttonsMessage = {
        buttons: buttons,
        locationMessage: {
            degreesLatitude: 0,
            degreesLongitude: 0,
            name: `🎮 ${global?.botname || 'SXCWA-MD'}`,
            address: "Powered by lumnztyz6x",
            url: global.linkch || "https://whatsapp.com/channel/0029Vb7XYjLKgsNyWrRHL10k",
            jpegThumbnail: thumbnailBase64
        },
        contentText: text,
        footerText: `📞 ${global?.botname || 'SXCWA-MD'} • ${getIndonesiaTime()} WIB`,
        headerType: 6
    };

    return await conn.relayMessage(m.chat, {
        buttonsMessage
    }, {
        messageId: Math.random().toString(36).substring(2, 15).toUpperCase(),
        quoted: m,
        additionalNodes: [
            {
                tag: "biz",
                attrs: {},
                content: [
                    {
                        tag: "interactive",
                        attrs: {
                            type: "native_flow",
                            v: "1"
                        },
                        content: [
                            {
                                tag: "native_flow",
                                attrs: {
                                    v: "9",
                                    name: "mixed"
                                }
                            }
                        ]
                    }
                ]
            }
        ],
        ...options
    });
};

async function toWhatsAppVoice(inputBuffer) {
    const audioBuffer = await convert.toVN(inputBuffer);
    const waveform = await convert.generateWaveform(audioBuffer);
    return {
        audio: audioBuffer,
        waveform
    };
}

async function sendWhatsAppVoice(conn, chatId, inputBuffer, options = {}) {
    try {
        const {
            audio,
            waveform
        } = await toWhatsAppVoice(inputBuffer);

        await conn.sendMessage(chatId, {
            audio: audio,
            waveform: waveform,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            ...options,
        }, {
            ...options
        });
    } catch (err) {
        console.error("Failed to send voice:", err);
    }
}

function getIndonesiaTime() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return new Intl.DateTimeFormat('en-GB', options).format(now);
}

function getIndonesiaDate() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    return new Intl.DateTimeFormat('en-GB', options).format(now);
}

function getVpsSpecs() {
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const cpu = os.cpus()[0] || {};
    const cpuModel = cpu.model || 'Unknown';
    const cpuSpeed = cpu.speed || 0;
    const cpuCores = os.cpus().length || 1;
    const uptime = formatUptime(os.uptime());

    return `
╭─「 📊 SYSTEM INFO 」
├ Model: ${cpuModel}
├ Total RAM: ${totalMem} GB
├ Free RAM: ${freeMem} GB
├ Speed: ${cpuSpeed} MHz
├ Cores: ${cpuCores}
└ Uptime: ${uptime}
╰─────────────`.trim();
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function Styles(text, style = 1) {
    const xStr = "abcdefghijklmnopqrstuvwxyz1234567890".split("");
    const yStr = Object.freeze({
        1: "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890",
        2: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶遭𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵𝟬",
        3: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗𝟎"
    });
    const replacer = xStr.map((v, i) => ({
        original: v,
        convert: yStr[style]?.split("")[i] || v
    }));
    return String(text).toLowerCase().split("").map(v => replacer.find(x => x.original == v)?.convert || v).join("");
}

export default handler;
