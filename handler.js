import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import moment from 'moment-timezone'
import util from 'util'
import knights from 'knights-canvas'

const isNumber = x => typeof x === 'number' && !isNaN(x)

const cooldown = new Map()
const cmdDailyLimit = new Map()

setInterval(() => {
    const now = Date.now()
    for (const [key, time] of cooldown) {
        if (now - time > 60000) cooldown.delete(key) 
    }
}, 60000)

setInterval(() => {
    const now = new Date()
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        cmdDailyLimit.clear()
        console.log(chalk.green('[✅ DAILY LIMIT] Reset harian berhasil'))
    }
}, 60000)

export async function handler(chatUpdate) {
    const conn = this || global.conn
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m) return
        m.exp = 0
        m.limit = 0
        m.success = true

        try {
            // Normalize LID sender and chat to phone JID (@s.whatsapp.net) immediately
            const botNum = (this.user?.jid || this.user?.id || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '');
            const botJid = (this.decodeJid ? this.decodeJid(this.user?.jid || this.user?.id || '') : (this.user?.jid || '')).replace(/:\d+@/, '@');
            const botLid = (this.user?.lid || '').replace(/:\d+@/, '@');
            const ownerNumbers = (global.owner || []).map(num => (Array.isArray(num) ? num[0] : (typeof num === 'object' ? num.number || num.jid : num)).toString().replace(/[^0-9]/g, '')).filter(Boolean);
            if (botNum && !ownerNumbers.includes(botNum)) ownerNumbers.push(botNum);

            const resolveLid = async (lid) => {
                if (!lid || typeof lid !== 'string') return lid;
                const cleanLid = lid.replace(/:\d+@/, '@');
                if (!cleanLid.endsWith('@lid')) return this.decodeJid ? this.decodeJid(cleanLid) : cleanLid;

                if (botLid && (cleanLid === botLid || cleanLid.startsWith(botLid.split('@')[0]))) {
                    return botJid;
                }

                // 1. Signal Repository LID Mapping
                try {
                    const pn = await this.signalRepository?.lidMapping?.getPNForLID(cleanLid);
                    if (pn && pn.endsWith('@s.whatsapp.net')) return this.decodeJid ? this.decodeJid(pn) : pn;
                } catch (_) {}

                // 2. Contacts lookup
                try {
                    const contacts = this.contacts || global.conn?.contacts || {};
                    const contact = Object.values(contacts).find(c => c && (c.lid?.replace(/:\d+@/, '@') === cleanLid || c.id?.replace(/:\d+@/, '@') === cleanLid));
                    if (contact?.id && contact.id.endsWith('@s.whatsapp.net')) return this.decodeJid ? this.decodeJid(contact.id) : contact.id;
                } catch (_) {}

                // 3. Group Participants lookup
                if (m.isGroup) {
                    try {
                        const groupMetadata = (this.chats?.[m.chat] || global.conn?.chats?.[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(() => null);
                        const p = groupMetadata?.participants?.find(u => 
                            (u.lid && u.lid.replace(/:\d+@/, '@') === cleanLid) ||
                            (u.id && u.id.replace(/:\d+@/, '@') === cleanLid)
                        );
                        if (p) {
                            if (p.id && p.id.endsWith('@s.whatsapp.net')) return this.decodeJid ? this.decodeJid(p.id) : p.id;
                            if (p.jid && p.jid.endsWith('@s.whatsapp.net')) return this.decodeJid ? this.decodeJid(p.jid) : p.jid;
                            if (p.phoneNumber) {
                                let pn = p.phoneNumber.replace(/[^0-9]/g, '');
                                if (pn) return pn + '@s.whatsapp.net';
                            }
                        }
                    } catch (_) {}
                }

                // 4. Check existing database users
                try {
                    for (let [k, u] of Object.entries(global.db?.data?.users || {})) {
                        if (u && (u.lid === cleanLid || u.lid === lid)) {
                            if (k.endsWith('@s.whatsapp.net')) return k;
                            if (u.phone) return `${u.phone}@s.whatsapp.net`;
                        }
                    }
                } catch (_) {}

                const lidClean = cleanLid.split('@')[0].replace(/[^0-9]/g, '');
                for (let num of ownerNumbers) {
                    if (lidClean === num || lidClean.startsWith(num)) {
                        return num + '@s.whatsapp.net';
                    }
                }
                return this.decodeJid ? this.decodeJid(cleanLid) : cleanLid;
            };

            let realSender = await resolveLid(m.sender);
            if (m.key?.fromMe) {
                realSender = botJid;
            } else if (!realSender || realSender.endsWith('@lid')) {
                if (m.key?.participant && m.key.participant.endsWith('@s.whatsapp.net')) {
                    realSender = this.decodeJid ? this.decodeJid(m.key.participant) : m.key.participant;
                }
            }

            m._normSender = realSender ? realSender.replace(/:\d+@/, '@') : realSender;
            const normSender = m._normSender;
            const rawSenderClean = (m.sender || '').replace(/:\d+@/, '@');
            const _sender = normSender || rawSenderClean;
            const isRealUser = _sender && !_sender.endsWith('@g.us') && !_sender.endsWith('@newsletter') && !_sender.startsWith('120363') && _sender !== 'status@broadcast';

            // Find existing user across all potential keys
            let user = null;
            if (isRealUser) {
                if (global.db.data.users[_sender]) user = global.db.data.users[_sender];
                else if (normSender && global.db.data.users[normSender]) user = global.db.data.users[normSender];
                else if (rawSenderClean && global.db.data.users[rawSenderClean]) user = global.db.data.users[rawSenderClean];
                else {
                    let cleanNum = _sender.split('@')[0].replace(/[^0-9]/g, '');
                    if (cleanNum && global.db.data.users[`${cleanNum}@s.whatsapp.net`]) {
                        user = global.db.data.users[`${cleanNum}@s.whatsapp.net`];
                    } else if (cleanNum) {
                        for (let [k, u] of Object.entries(global.db.data.users || {})) {
                            if (u && (u.phone === cleanNum || (u.lid && (u.lid === rawSenderClean || u.lid === _sender)))) {
                                user = u;
                                break;
                            }
                        }
                    }
                }
            }

            if (isRealUser && (!user || typeof user !== 'object')) {
                user = {
                    exp: 20,
                    limit: 25,
                    name: m.pushName || 'User',
                    phone: _sender.endsWith('@s.whatsapp.net') ? _sender.split('@')[0] : null,
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    banReason: '',
                    role: 'Free user',
                    autolevelup: true,
                    warn: 0,
                    cmdLimit: {},
                    lastCommand: {}
                };
            }

            if (isRealUser && user) {
                // Link across all user keys
                global.db.data.users[_sender] = user;
                if (normSender) global.db.data.users[normSender] = user;
                if (rawSenderClean) global.db.data.users[rawSenderClean] = user;
                if (m.sender && m.sender !== _sender) global.db.data.users[m.sender] = user;
                if (user.phone) global.db.data.users[`${user.phone}@s.whatsapp.net`] = user;
                if (rawSenderClean.endsWith('@lid')) user.lid = rawSenderClean;
                if (_sender.endsWith('@s.whatsapp.net') && !user.phone) {
                    user.phone = _sender.split('@')[0];
                }

                // Check default fields
                if (!isNumber(user.exp)) user.exp = 20;
                if (!isNumber(user.limit)) user.limit = user.premium ? 1000 : 20;
                if (user.premium && (!isNumber(user.limit) || user.limit < 1000)) user.limit = 1000;
                if (!isNumber(user.afk)) user.afk = -1;
                if (!('afkReason' in user)) user.afkReason = '';
                if (!('warn' in user)) user.warn = 0;
                if (!('banned' in user)) user.banned = false;
                if (!('banReason' in user)) user.banReason = '';
                if (!('role' in user)) user.role = 'Free user';
                if (!('autolevelup' in user)) user.autolevelup = true;
                if (!('name' in user)) user.name = m.pushName || 'User';
                if (m.pushName) user.name = m.pushName;
                if (!('regTime' in user)) user.regTime = -1;
                if (!('cmdLimit' in user)) user.cmdLimit = {};
                if (!('lastCommand' in user)) user.lastCommand = {};

                // Sync data across LID and Phone JID records
                let cleanP = _sender.split('@')[0].replace(/[^0-9]/g, '');
                let linkedKeys = [];
                if (_sender.endsWith('@s.whatsapp.net')) {
                    for (let [k, u] of Object.entries(global.db.data.users || {})) {
                        if (k.endsWith('@lid') && (u.phone === cleanP || (u.name && user.name && u.name === user.name))) linkedKeys.push(u);
                    }
                } else if (_sender.endsWith('@lid')) {
                    if (user.phone && global.db.data.users[`${user.phone}@s.whatsapp.net`]) {
                        linkedKeys.push(global.db.data.users[`${user.phone}@s.whatsapp.net`]);
                    }
                }
                for (let lk of linkedKeys) {
                    if (lk.role && lk.role.toLowerCase() !== 'free user' && (!user.role || user.role.toLowerCase() === 'free user')) {
                        user.role = lk.role;
                        user.status = lk.status || lk.role;
                        user.roleDate = lk.roleDate;
                    }
                    if (lk.premium && !user.premium) user.premium = true, user.premiumDate = lk.premiumDate;
                }

                // --- SYSTEM EXPIRED & WARNING USER (Role, Premium, VIP) ---
                const now = Date.now()
                const oneDayMs = 86400000
                const targetTag = _sender.includes('@') ? _sender : `${_sender}@s.whatsapp.net`
                const tagUser = `@${_sender.split('@')[0]}`

                // 1. Custom Role
                if (user.roleDate && user.roleDate !== Infinity && user.roleDate !== 'permanen') {
                    if (user.roleDate > now && (user.roleDate - now) <= oneDayMs && !user.warnedRoleExpiry) {
                        user.warnedRoleExpiry = true
                        let sisaJam = Math.ceil((user.roleDate - now) / 3600000)
                        this.sendMessage(m.chat, {
                            text: `⚠️ *PENGINGAT ROLE KUSTOM*\n\nHalo ${tagUser}! Masa aktif custom role *${user.role || user.status}* kamu tersisa sekitar *${sisaJam} jam lagi*.\nSegera perpanjang di *.shop* agar role tidak dicabut otomatis!`,
                            mentions: [targetTag]
                        }).catch(() => {})
                    } else if (user.roleDate <= now) {
                        let oldRole = user.role || user.status
                        user.role = 'Free user'
                        user.status = 'Free user'
                        user.roleDate = 0
                        delete user.warnedRoleExpiry
                        this.sendMessage(m.chat, {
                            text: `⚠️ *PEMBERITAHUAN*\n\nPerhatian ${tagUser}, masa aktif custom role *${oldRole}* kamu telah habis dan telah dicabut otomatis oleh sistem.\nTerima kasih telah berlangganan!`,
                            mentions: [targetTag]
                        }).catch(() => {})
                    }
                }

                // 2. Premium User
                if (user.premium && user.premiumDate && user.premiumDate !== Infinity && user.premiumDate !== 'permanen') {
                    if (user.premiumDate > now && (user.premiumDate - now) <= oneDayMs && !user.warnedPremExpiry) {
                        user.warnedPremExpiry = true
                        let sisaJam = Math.ceil((user.premiumDate - now) / 3600000)
                        this.sendMessage(m.chat, {
                            text: `⚠️ *PENGINGAT PREMIUM*\n\nHalo ${tagUser}! Masa aktif status *Premium* kamu tersisa sekitar *${sisaJam} jam lagi*.\nSegera perpanjang di *.shop* agar limit tetap deras 1.000/hari!`,
                            mentions: [targetTag]
                        }).catch(() => {})
                    } else if (user.premiumDate <= now) {
                        user.premium = false
                        user.premiumDate = 0
                        delete user.warnedPremExpiry
                        this.sendMessage(m.chat, {
                            text: `⚠️ *PEMBERITAHUAN*\n\nPerhatian ${tagUser}, masa aktif status *Premium* kamu telah habis.\nStatus kamu sekarang kembali menjadi user biasa.`,
                            mentions: [targetTag]
                        }).catch(() => {})
                    }
                }

                // 3. VIP Sultan Removed

            } else {
                global.db.data.users[_sender] = {
                    exp: 20,
                    limit: 25,
                    name: m.pushName || 'User',
                    phone: _sender.endsWith('@s.whatsapp.net') ? _sender.split('@')[0] : null,
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    banReason: '',
                    warn: 0,
                    cmdLimit: {},
                    lastCommand: {}
                }
            }
            if (isRealUser && m.sender && m.sender !== _sender) {
                global.db.data.users[m.sender] = global.db.data.users[_sender];
            }

            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object' || !chat) {
                global.db.data.chats[m.chat] = {}
                chat = global.db.data.chats[m.chat]
            }
            if (chat) {
                if (!('welcome' in chat)) chat.welcome = false
                if (!('sWelcome' in chat)) chat.sWelcome = ''
                if (!('sBye' in chat)) chat.sBye = ''
                if (!('sPromote' in chat)) chat.sPromote = '@user telah di promote'
                if (!('sDemote' in chat)) chat.sDemote = '@user telah di demote'
                if (!('delete' in chat)) chat.delete = true
                if (!('blacklist' in chat)) chat.blacklist = []
                if (!('tagsw' in chat)) chat.tagsw = { delete: false, kick: false }
                if (!isNumber(chat.expired)) chat.expired = 0
                if (!('detect' in chat)) chat.detect = false
                if (!('mute' in chat)) chat.mute = false
                if (!('isBanned' in chat)) chat.isBanned = false
                if (!('mutedUntil' in chat)) chat.mutedUntil = null
                if (!('antilink' in chat)) chat.antilink = false
                if (!('antispam' in chat)) chat.antispam = true

                // --- SYSTEM EXPIRED & WARNING SEWA BOT GRUP ---
                const now = Date.now()
                const oneDayMs = 86400000
                if (m.isGroup && chat.expired && chat.expired !== Infinity) {
                    if (chat.expired > now && (chat.expired - now) <= oneDayMs && !chat.warnedExpiry) {
                        chat.warnedExpiry = true
                        let sisaJam = Math.ceil((chat.expired - now) / 3600000)
                        this.reply(m.chat, `⚠️ *PENGINGAT SEWA BOT*\n\nPerhatian member grup! Masa sewa bot di grup ini tersisa sekitar *${sisaJam} jam lagi*.\nSegera hubungi Owner untuk memperpanjang sewa agar bot tidak keluar otomatis!\n\n📞 *Owner:* https://t.me/LumnzTyz`).catch(() => {})
                    } else if (chat.expired <= now && chat.expired > 0) {
                        chat.expired = 0
                        delete chat.warnedExpiry
                        await this.reply(m.chat, `👋 *MASA SEWA HABIS*\n\nMasa sewa bot di grup ini telah berakhir. Bot akan otomatis keluar dari grup sekarang. Terima kasih telah menggunakan layanan kami!\n\n_Untuk menyewa kembali, silakan hubungi Owner di https://t.me/LumnzTyz_`).catch(() => {})
                        await this.groupLeave(m.chat).catch(() => {})
                    }
                }
            }

            // Track chat activity per member in group
            if (m.isGroup && user && chat) {
                if (!user.chatGroup) user.chatGroup = {}
                user.chatGroup[m.chat] = (user.chatGroup[m.chat] || 0) + 1
                user.chat = (user.chat || 0) + 1

                if (!chat.memberChat) chat.memberChat = {}
                chat.memberChat[_sender] = (chat.memberChat[_sender] || 0) + 1
                if (m.sender && m.sender !== _sender) {
                    chat.memberChat[m.sender] = (chat.memberChat[m.sender] || 0) + 1
                }
            }

            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('resetlimit' in settings)) settings.resetlimit = '02:00'
                if (!('autoread' in settings)) settings.autoread = false
                if (!('restrict' in settings)) settings.restrict = true
                if (!('maintenance' in settings)) settings.maintenance = false
                if (!('antispam' in settings)) settings.antispam = true
                if (!('cooldown' in settings)) settings.cooldown = 3000
            } else {
                global.db.data.settings[this.user.jid] = {
                    self: false,
                    resetlimit: '02:00',
                    autoread: false,
                    restrict: true,
                    maintenance: false,
                    antispam: true,
                    cooldown: 3000
                }
            }
        } catch (e) {
            console.error(e)
        }

        const botNum = (this.user?.jid || this.user?.id || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '')
        const botJid = (this.decodeJid ? this.decodeJid(this.user?.jid || this.user?.id || '') : (this.user?.jid || '')).replace(/:\d+@/, '@')
        const botLid = ((this.user?.lid || '')).replace(/:\d+@/, '@')

        const ownerNumbers = (global.owner || []).map(num => (Array.isArray(num) ? num[0] : (typeof num === 'object' ? num.number || num.jid : num)).toString().replace(/[^0-9]/g, '')).filter(Boolean)
        if (botNum && !ownerNumbers.includes(botNum)) ownerNumbers.push(botNum)

        const rawSender = (m.sender || '').replace(/:\d+@/, '@')
        const senderNum = (m.sender || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
        const chatNum = (m.chat || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

        let isDirectOwner = m.fromMe || 
                            m.key?.fromMe ||
                            rawSender === botJid || 
                            rawSender === botLid ||
                            (senderNum && ownerNumbers.includes(senderNum)) || 
                            (chatNum && !m.isGroup && ownerNumbers.includes(chatNum)) ||
                            ownerNumbers.some(n => n && (rawSender.startsWith(n) || (senderNum && senderNum.startsWith(n))))

        let isROwner = isDirectOwner
        if (!isROwner) {
            try {
                let pnFromLid = await this.signalRepository?.lidMapping?.getPNForLID(m.sender) || await this.signalRepository?.lidMapping?.getPNForLID(m.chat)
                if (pnFromLid) {
                    let pnNum = pnFromLid.split('@')[0].replace(/[^0-9]/g, '')
                    if (ownerNumbers.includes(pnNum) || ownerNumbers.some(n => n && pnNum.startsWith(n))) {
                        isROwner = true
                    }
                }
            } catch (_) {}
        }
        if (!isROwner) {
            const contacts = this.contacts || global.conn?.contacts || {}
            for (let c of Object.values(contacts)) {
                if (c.lid === m.sender || c.id === m.sender || c.lid === m.chat || c.id === m.chat) {
                    let cNum = (c.id || '').split('@')[0].replace(/[^0-9]/g, '')
                    if (ownerNumbers.includes(cNum) || ownerNumbers.some(n => n && cNum.startsWith(n))) {
                        isROwner = true
                        break
                    }
                }
            }
        }

        const isOwner = isROwner || m.fromMe || m.key?.fromMe
        const isPrems = global.db.data.users[m._normSender || m.sender]?.premium || isROwner || m.fromMe
                const isBans = global.db.data.users[m._normSender || m.sender]?.banned

        if (db.data.settings[this.user.jid]?.maintenance && !isOwner) {
            return m.reply('🔧 *Bot dalam pemeliharaan!* Kembali lagi nanti.')
        }

        if (db.data.settings[this.user.jid]?.autoread) await this.readMessages([m.key])
        if (opts['nyimak']) return
        if (opts['pconly'] && m.chat.endsWith('g.us')) return
        if (opts['gconly'] && !m.chat.endsWith('g.us') && !isOwner) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        const msg = m
        let usedPrefix
        let _user = global.db.data && global.db.data.users && global.db.data.users[m._normSender || m.sender]

        const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []
        const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.jid) === m.sender || conn.decodeJid(u.id) === m.sender || u.id === m.sender || u.lid === m.sender) : {}) || {}
        const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.jid) == this.user.jid || conn.decodeJid(u.id) == this.user.jid || u.id == this.user.lid.replace(/:\d+@/, '@') || u.lid == this.user.lid.replace(/:\d+@/, '@')) : {}) || {}
        const isRAdmin = user?.admin == 'superadmin' || false
        const isAdmin = isRAdmin || user?.admin == 'admin' || false
        const isBotAdmin = bot?.admin || false

        if (!isOwner && db.data.settings[this.user.jid]?.self) return
        if (!isOwner && !global.db.data.users[m._normSender || m.sender]?.vip && !global.db.data.users[m._normSender || m.sender]?.premium && db.data.chats[m.chat]?.mute) return
        if (isBans) {
            if (m.isGroup && isBotAdmin) await this.sendMessage(m.chat, { delete: m.key })
            return
        }
        if (db.data.chats[m.chat]?.isBanned) return

        const isBot = m?.id?.startsWith("3EB0") ||
            m?.id?.startsWith("FELZ") ||
            m?.id?.startsWith("F3FD") ||
            m?.id?.startsWith("SSA") ||
            m?.id?.startsWith("B1EY") ||
            m?.id?.startsWith("BAE5") ||
            m?.id?.startsWith("HSK") ||
            m?.id?.indexOf("-") > 1
        if (isBot && !isOwner) {
            if (m.isGroup && isBotAdmin && !isAdmin && global.groupSecurity?.[m.chat]?.antibot?.aktif) {
                const setting = global.groupSecurity[m.chat].antibot;
                const mode = setting.mode || 'delete';
                try { await this.sendMessage(m.chat, { delete: m.key }) } catch(e) {}
                if (mode === 'kick') {
                    await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
                    await this.sendMessage(m.chat, { text: `*乂 [ antibot ]*\n\n@${m.sender.split('@')[0]} di-kick karena terdeteksi sebagai bot lain!\n\n⚡ *group security aktif*`, mentions: [m.sender] }).catch(() => {});
                } else {
                    await this.sendMessage(m.chat, { text: `*乂 [ antibot ]*\n\n@${m.sender.split('@')[0]} pesan bot lain dihapus!\n\n⚠️ *group security aktif*`, mentions: [m.sender] }).catch(() => {});
                }
            }
            return
        }

        if (m.isGroup && db.data.chats[m.chat]?.blacklist?.length > 0) {
            let isImmune = isOwner || global.db.data.users[m._normSender || m.sender]?.vip || global.db.data.users[m._normSender || m.sender]?.premium;
            if (!isImmune) {
                const isBlacklisted = db.data.chats[m.chat].blacklist.some(word => 
                    m.text.toLowerCase().includes(word.toLowerCase())
                )
                if (isBlacklisted) {
                    if (db.data.chats[m.chat]?.tagsw?.delete) {
                        await this.sendMessage(m.chat, { delete: m.key })
                    }
                    if (db.data.chats[m.chat]?.tagsw?.kick && isBotAdmin) {
                        await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                    }
                    return
                }
            }
        }

        let isResetting = false
        let lastResetTime = 0

        const now = Date.now()
        const resetTime = db.data.settings[this.user.jid]?.resetlimit || '02:00'

        if (resetTime && !isResetting) {
            const [targetHour, targetMinute] = resetTime.split(':').map(Number)
            const currentTime = moment.tz(global.tz || 'Asia/Jakarta')

            if (currentTime.hours() === targetHour &&
                currentTime.minutes() === targetMinute &&
                now - lastResetTime > 60000) {

                isResetting = true
                lastResetTime = now

                try {
                    const users = Object.keys(db.data.users)
                    for (const uId of users) {
                        let u = db.data.users[uId]
                        if (u) {
                            if (u.premium) u.limit = 1000
                            else u.limit = 20
                        }
                    }
                    console.log(chalk.blue(`[📊 LIMIT RESET] Berhasil direset pukul ${resetTime} untuk ${users.length} pengguna (Free: 20, Prem: 1000)`))
                } catch (e) {
                    console.error(chalk.red('[❌ LIMIT RESET ERROR]'), e)
                } finally {
                    isResetting = false
                }
            }
        }

        if (isROwner || isOwner ) {
            if (global.db.data.users[m._normSender || m.sender]) {
                global.db.data.users[m._normSender || m.sender].limit = 999999
            }
        }

        if (opts['queque'] && m.text && !(isOwner || isPrems )) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function() {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
            }, time)
        }

        m.exp += Math.ceil(Math.random() * 10)

        for (let name in pg.plugins) {
            let plugin
            if (typeof pg.plugins[name].code === "function") {
                let anu = pg.plugins[name]
                plugin = anu.code
                for (let prop in anu) {
                    if (prop !== "run") {
                        plugin[prop] = anu[prop]
                    }
                }
            } else {
                plugin = pg.plugins[name]
            }
            if (!plugin) continue
            if (plugin.disabled) continue

            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) {
                    global.dfail('restrict', m, this)
                    continue
                }
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ?
                [
                    [_prefix.exec(m.text), _prefix]
                ] :
                Array.isArray(_prefix) ?
                _prefix.map(p => {
                    let re = p instanceof RegExp ?
                        p :
                        new RegExp(str2Regex(p))
                    return [re.exec(m.text), re]
                }) :
                typeof _prefix === 'string' ?
                [
                    [new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]
                ] : [
                    [
                        [], new RegExp
                    ]
                ]
            ).find(p => p[1])
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                        match,
                        conn: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isRAdmin,
                        isAdmin,
                        isBotAdmin,
                        isPrems,
                        chatUpdate,
                    }))
                    continue
            }
            if (typeof plugin !== 'function') continue
            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ?
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                    plugin.command.some(cmd => cmd instanceof RegExp ?
                        cmd.test(command) :
                        cmd === command
                    ) :
                    typeof plugin.command === 'string' ?
                    plugin.command === command :
                    false

                if (!isAccept) continue
                
                m.plugin = name
                if (m.chat in global.db.data.chats || (m._normSender || m.sender) in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m._normSender || m.sender]
                    if (name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && chat?.isBanned) return
                    if (name != 'owner-unbanuser.js' && user?.banned) return
                }
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
                    fail('owner', m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) {
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) {
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isOwner) {
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems ) {
                    fail('premium', m, this)
                    continue
                }

                if (plugin.group && !m.isGroup && !isOwner) {
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) {
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin && !isOwner) {
                    fail('admin', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) {
                    fail('private', m, this)
                    continue
                }
                if (plugin.register == true && _user?.registered == false) {
                    fail('unreg', m, this)
                    continue
                }
                
                const exemptTags = ['owner', 'main', 'info', 'group', 'store', 'rpg_free']
                const pluginTag = (plugin.tags && plugin.tags[0]) ? plugin.tags[0].toLowerCase() : ''
                
                if (plugin.limit !== undefined) {
                    m.limit = typeof plugin.limit === 'number' ? plugin.limit : (plugin.limit ? 1 : 0)
                } else if (!exemptTags.includes(pluginTag)) {
                    m.limit = 1
                } else {
                    m.limit = 0
                }
                
                if (m.limit > 0 && !isOwner) {
                    if (_user && (_user.limit || 0) < m.limit) {
                        const premHrg = (global.harga?.premiumPerHari || 1000).toLocaleString('id-ID');
                        const vipHrg = (global.harga?.vipPerHari || 2000).toLocaleString('id-ID');
                        const vipPerm = (global.harga?.vipPermanen || 50000).toLocaleString('id-ID');
                        
                        let limitMsg = `⛔ *LIMIT HARIAN KAMU SUDAH HABIS!*\n\n`;
                        limitMsg += `Halo kak @${(m._normSender || m.sender).split('@')[0]}! Sisa limit kamu: *${_user.limit || 0} Limit* (Dibutuhkan: *${m.limit} Limit*).\n\n`;
                        limitMsg += `⏰ *Reset Limit:* Otomatis direset setiap hari pukul *02:00 WIB*.\n\n`;
                        limitMsg += `💎 *INGIN AKSES TANPA BATAS & LIMIT DERAS?*\n`;
                        limitMsg += `🌟 *PREMIUM USER*\n`;
                        limitMsg += `   • Limit deras *1.000 Request / Hari*\n`;
                        limitMsg += `   • Akses semua fitur downloader, AI & tools\n\n`;
                        limitMsg += `> © _lumnztyz6x | sixcorecomunity_`;

                        m.reply(limitMsg.trim(), null, { mentions: [m._normSender || m.sender] });
                        continue;
                    }
                }

                const cooldownTime = plugin.cooldown || db.data.settings[this.user.jid]?.cooldown || 3000
                const cmdKey = `${m.sender}-${name}`
                
                if (cooldown.has(cmdKey) && !isOwner && !isPrems ) {
                    const remaining = cooldownTime - (Date.now() - cooldown.get(cmdKey))
                    if (remaining > 0) {
                        m.reply(`⏳ *Cooldown!* Tunggu ${Math.ceil(remaining/1000)} detik lagi.`)
                        continue
                    }
                }
                cooldown.set(cmdKey, Date.now())
                
                if (plugin.dailyLimit && typeof plugin.dailyLimit === 'number' && !isOwner ) {
                    const today = moment.tz(global.tz || 'Asia/Jakarta').format('YYYY-MM-DD');
                    const categoryOrName = plugin.dailyLimitKey || name;
                    const limitKey = `${m._normSender || m.sender}_${categoryOrName}_${today}`;
                    
                    const uObj = global.db.data.users[m._normSender || m.sender] || _user;
                    if (uObj) {
                        if (!uObj.cmdLimit) uObj.cmdLimit = {};
                        const used = uObj.cmdLimit[limitKey] || 0;
                        if (used >= plugin.dailyLimit) {
                            if (false) {
} else {
                                m.reply(`⛔ *Limit harian fitur ini habis!* (${plugin.dailyLimit}x / hari)\n\nSilakan coba lagi besok!\n\n> © _lumnztyz6x | sixcorecomunity_`);
                            }
                            continue;
                        }
                        m._dailyLimitKey = limitKey;
                    }
                }

                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 200) {
                    console.log(chalk.yellow("⚠️ XP terlalu besar, command mungkin ngecit"))
                } else {
                    m.exp += xp
                }
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    
                    chatUpdate,
                }
                try {
                    await plugin.call(this, m, extra)
                    m.success = true
                } catch (e) {
                    m.error = e
                    m.success = false
                    if (global.eror) {
                        let errMsg = e?.message || String(e);
                        m.reply(`${global.eror}\n\n*📄 Detail Error:*\n\`\`\`${errMsg.substring(0, 300)}\`\`\``);
                    }
                    console.error(chalk.red(`[❌ ERROR] Plugin: ${m.plugin}`))
                    console.error(chalk.red(`[👤 Sender]: ${m.sender}`))
                    console.error(chalk.red(`[💬 Chat]: ${m.chat}`))
                    console.error(chalk.red(`[📝 Command]: ${usedPrefix}${command} ${args.join(' ')}`))
                    console.error(e)
                    
                    if (e) {
                        let textErr = format(e)
                        conn.logger.error(`[ERROR LOG]\n${textErr}`)
                        
                        // Reliable Error Dispatch to all Owners
                        const ownerList = (global.owner || []).map(num => (Array.isArray(num) ? num[0] : (typeof num === 'object' ? num.number || num.jid : num)).toString().replace(/[^0-9]/g, '')).filter(Boolean)
                        for (let num of ownerList) {
                            let targetOwnerJid = num + '@s.whatsapp.net'
                            await conn.sendMessage(targetOwnerJid, {
                                text: `*📛 ERROR DETECTED*\n\n` +
                                      `*🗂️ Plugin:* ${m.plugin}\n` +
                                      `*👤 Sender:* ${m.sender}\n` +
                                      `*💬 Chat:* ${m.chat}\n` +
                                      `*📝 Command:* ${usedPrefix}${command} ${args.join(' ')}\n\n` +
                                      `*📄 Error:*\n\`\`\`${textErr.substring(0, 1500)}\`\`\``
                            }).catch(() => {})
                        }
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }
                break
            }
        }
    } catch (e) {
        console.error(chalk.red('[❌ MAIN HANDLER ERROR]'))
        console.error(e)
    } finally {
        if (m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        
        let user, stats = global.db.data.stats
        if (m) {
            const _fs = m._normSender || m.sender
            if (_fs && (user = global.db.data.users[_fs])) {
                user.exp += m.exp
                user.hit = (user.hit || 0) + 1
                
                const isUserOwner = m.fromMe || global.owner.map(v => (typeof v === 'string' ? v : v[0]).replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(_fs) || _fs === String(this.user?.jid || this.user?.id).replace(/:\d+/, '')

                if (m.limit > 0 && m.success === true && !m.isMenuOnly && user.limit >= m.limit) {
                    if (!isUserOwner && !user.vip) {
                        user.limit = Math.max(0, user.limit - (m.limit * 1));
                        
                        // Increment daily limit pool if applicable
                        if (m._dailyLimitKey) {
                            if (!user.cmdLimit) user.cmdLimit = {};
                            user.cmdLimit[m._dailyLimitKey] = (user.cmdLimit[m._dailyLimitKey] || 0) + 1;
                        }

                        // Sync limit across all user record keys
                        if (m._normSender && global.db.data.users[m._normSender]) global.db.data.users[m._normSender].limit = user.limit;
                        if (m.sender && global.db.data.users[m.sender]) global.db.data.users[m.sender].limit = user.limit;
                        if (user.phone && global.db.data.users[`${user.phone}@s.whatsapp.net`]) global.db.data.users[`${user.phone}@s.whatsapp.net`].limit = user.limit;
                        
                        if (user.limit === 0) {
                            conn.sendMessage(m.chat, {
                                text: `⚠️ *Limit kamu telah habis (0 Limit)!*\n💡 *Upgrade ke Premium / VIP Sultan via .shop untuk limit deras & tanpa batas!*`,
                                mentions: [_fs]
                            }, { quoted: m });
                        } else if (user.limit > 0 && user.limit <= 3) {
                            conn.sendMessage(m.chat, {
                                text: `> 🍀 *Limit hampir habis:* ${user.limit} tersisa\n> 💢 *Ketik .shop untuk upgrade Premium / VIP!*`
                            }, { quoted: m });
                        }
                    }
                } else if (m.limit > 0 && m.success !== true) {
                    console.log(chalk.yellow(`[⚠️ LIMIT NOT REDUCED] Command gagal, tidak mengurangi limit: ${m.plugin}`))
                }
                
                if (user.autolevelup && user.exp > 1000) {
                    let level = Math.floor(Math.sqrt(user.exp / 100))
                    if (level > user.level || !user.level) {
                        user.level = level
                        conn.sendMessage(m.chat, {
                            text: `🎉 *LEVEL UP!*\n\n` +
                                  `👤 *Name:* ${user.name}\n` +
                                  `📊 *Level:* ${level}\n` +
                                  `⭐ *Exp:* ${user.exp}\n` +
                                  `🎁 *Reward:* +5 Limit`
                        }, { quoted: m })
                        user.limit += 5
                    }
                }
            }
            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total)) stat.total = 1
                    if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last)) stat.last = now
                    if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
                } else {
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }
        try {
            if (m.isCommand) {
                await (await import(`./lib/print.js`)).default(m, this)
            }
        } catch (e) {
            console.log(m, m.quoted, e)
        }
        if (db.data.settings[this.user.jid]?.autoread) await conn.readMessages([m.key])
    }
}

export async function participantsUpdate({
    id,
    participants,
    action
}) {
    if (this.isInit) return
    if (global.db.data == null) await loadDatabase()
    let chat = global.db.data.chats[id] || {}
    let text = ''
    
    switch (action) {
        case 'add':
        case 'remove':
            if (chat.welcome) {
                let groupMetadata = await this.groupMetadata(id) || (conn.chats[id] || {}).metadata
                for (let user of participants) {
                    let seni = user?.phoneNumber || user?.id || user?.lid
                    let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
                    let ppgc = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
                    let userName = seni.split('@')[0]
                    try {
                        pp = await this.profilePictureUrl(seni, 'image')
                        ppgc = await this.profilePictureUrl(id, 'image')
                        const userData = global.db.data.users[seni.split('@')[0]]
                        if (userData && userData.name) {
                            userName = userData.name
                        }
                    } catch (e) {} 
                    
                    text = (action === 'add' ?
                        (chat.sWelcome || this.welcome || conn.welcome || 'Welcome, @user!')
                            .replace('@subject', await this.getName(id))
                            .replace('@desc', groupMetadata.desc?.toString() || 'unknown') :
                        (chat.sBye || this.bye || conn.bye || 'Bye, @user!'))
                        .replace('@user', `@` + seni.split('@')[0])
                    
                    try {
                        let wel = await new knights.Welcome2()
                            .setAvatar(pp)
                            .setUsername(await this?.getName(seni) || "No Name")
                            .setBg("https://c.top4top.io/p_36048izxw1.jpg")
                            .setGroupname(groupMetadata.subject)
                            .setMember(groupMetadata.participants.length)
                            .toAttachment()

                        let lea = await new knights.Goodbye()
                            .setUsername(await this?.getName(seni) || "No Name")
                            .setGuildName(groupMetadata.subject)
                            .setGuildIcon(ppgc)
                            .setMemberCount(groupMetadata.participants.length)
                            .setAvatar(pp)
                            .setBackground("https://l.top4top.io/p_36040fspy1.jpg")
                            .toAttachment()

                        this.sendMessage(id, {
                            image: action === 'add' ? wel.toBuffer() : lea.toBuffer(),
                            caption: text,
                            mentions: [seni]
                        })
                        console.log(chalk.green(`[${action === 'add' ? '👋 WELCOME' : '👋 GOODBYE'}] ${userName} di ${groupMetadata.subject}`))
                    } catch (e) {
                        console.error(chalk.red(`[❌ ${action.toUpperCase()} ERROR]`), e)
                        this.sendMessage(id, {
                            text: text,
                            mentions: [seni]
                        })
                    }
                }
            }
            break
        case 'promote':
            if (chat.antiKudeta || global.groupSecurity?.[id]?.antikudeta?.aktif) {
                const botNumber = (this.user?.jid || this.user?.id || '').split('@')[0].replace(/[^0-9]/g, '');
                const authorNumber = (author || '').split('@')[0].replace(/[^0-9]/g, '');
                const isOwner = (global.owner && global.owner.some(o => (Array.isArray(o) ? o[0] : o).toString().replace(/[^0-9]/g, '') === authorNumber));
                if (authorNumber && authorNumber !== botNumber && !isOwner) {
                    await this.groupParticipantsUpdate(id, participants, 'demote').catch(() => {});
                    await this.sendMessage(id, {
                        text: `🛡️ *ANTI-KUDETA TERDETEKSI!*\n\n⚠️ Admin @${authorNumber} mencoba mem-promote anggota tanpa izin Owner.\n⚡ Tindakan: Status promote dibatalkan & pelaku di-KICK dari grup demi keamanan!`,
                        mentions: [author, ...participants]
                    }).catch(() => {});
                    await this.groupParticipantsUpdate(id, [author], 'remove').catch(() => {});
                    break;
                }
            }
            text = (chat.sPromote || this.spromote || conn.spromote || '@user sekarang Admin!')
            if (chat.detect) {
                this.sendMessage(id, {
                    text: text.replace('@user', '@' + participants[0].split('@')[0]),
                    mentions: [participants[0]]
                })
                console.log(chalk.blue(`[👑 PROMOTE] ${participants[0].split('@')[0]} di ${id}`))
            }
            break
        case 'demote':
            if (chat.antiKudeta || global.groupSecurity?.[id]?.antikudeta?.aktif) {
                const botNumber = (this.user?.jid || this.user?.id || '').split('@')[0].replace(/[^0-9]/g, '');
                const authorNumber = (author || '').split('@')[0].replace(/[^0-9]/g, '');
                const isOwner = (global.owner && global.owner.some(o => (Array.isArray(o) ? o[0] : o).toString().replace(/[^0-9]/g, '') === authorNumber));
                if (authorNumber && authorNumber !== botNumber && !isOwner) {
                    await this.groupParticipantsUpdate(id, participants, 'promote').catch(() => {});
                    await this.sendMessage(id, {
                        text: `🛡️ *ANTI-KUDETA TERDETEKSI!*\n\n⚠️ Admin @${authorNumber} mencoba melengserkan admin lain tanpa izin Owner.\n⚡ Tindakan: Admin dipulihkan & pelaku di-KICK dari grup demi keamanan!`,
                        mentions: [author, ...participants]
                    }).catch(() => {});
                    await this.groupParticipantsUpdate(id, [author], 'remove').catch(() => {});
                    break;
                }
            }
            text = (chat.sDemote || this.sdemote || conn.sdemote || '@user bukan Admin lagi!')
            if (chat.detect) {
                this.sendMessage(id, {
                    text: text.replace('@user', '@' + participants[0].split('@')[0]),
                    mentions: [participants[0]]
                })
                console.log(chalk.yellow(`[📉 DEMOTE] ${participants[0].split('@')[0]} di ${id}`))
            }
            break
    }
}

export async function groupsUpdate(groupsUpdate) {
    const conn = this || global.conn
    if (!groupsUpdate || groupsUpdate.length === 0) return
    
    const botNumber = this.user.id.split(':')[0]
    const currentTime = Date.now()
    
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        
        try {
            let chats = global.db.data.chats[id] || {}
            if (!chats.detect) continue
            
            const author = groupUpdate.author
            if (author) {
                const authorNumber = author.split('@')[0]
                if (authorNumber === botNumber) {
                    continue
                }
            }
            
            const updateTimestamp = groupUpdate.timestamp || currentTime
            const fiveMinutesAgo = currentTime - (5 * 60 * 1000)
            
            if (updateTimestamp < fiveMinutesAgo) {
                continue
            }
            
            let text = ''
            
            if (groupUpdate.desc) {
                text = (chats.sDesc || this.sDesc || conn.sDesc || '📝 Deskripsi grup telah diubah')
                console.log(chalk.cyan(`[📝 DESC UPDATE] ${id}`))
            } else if (groupUpdate.subject) {
                text = (chats.sSubject || this.sSubject || conn.sSubject || '🏷️ Nama grup telah diubah menjadi:\n' + groupUpdate.subject)
                console.log(chalk.cyan(`[🏷️ NAME UPDATE] ${id}: ${groupUpdate.subject}`))
            } else if (groupUpdate.icon) {
                text = (chats.sIcon || this.sIcon || conn.sIcon || '🖼️ Icon grup telah diubah!')
                console.log(chalk.cyan(`[🖼️ ICON UPDATE] ${id}`))
            } else if (groupUpdate.revoke) {
                text = (chats.sRevoke || this.sRevoke || conn.sRevoke || '🔗 Link grup telah diubah')
                console.log(chalk.cyan(`[🔗 LINK UPDATE] ${id}`))
            } else if (groupUpdate.announce === true) {
                text = (chats.sAnnounceOn || this.sAnnounceOn || conn.sAnnounceOn || '🔒 Grup telah ditutup!')
                console.log(chalk.yellow(`[🔒 GROUP CLOSED] ${id}`))
            } else if (groupUpdate.announce === false) {
                text = (chats.sAnnounceOff || this.sAnnounceOff || conn.sAnnounceOff || '🔓 Grup telah dibuka!')
                console.log(chalk.green(`[🔓 GROUP OPENED] ${id}`))
            } else if (groupUpdate.restrict === true) {
                text = (chats.sRestrictOn || this.sRestrictOn || conn.sRestrictOn || '⚙️ Edit info grup diubah ke semua member!')
                console.log(chalk.blue(`[⚙️ RESTRICT ON] ${id}`))
            } else if (groupUpdate.restrict === false) {
                text = (chats.sRestrictOff || this.sRestrictOff || conn.sRestrictOff || '⚙️ Edit info grup diubah ke hanya admin!')
                console.log(chalk.blue(`[⚙️ RESTRICT OFF] ${id}`))
            } else {
                continue
            }
            
            if (text && author) {
                const mentions = author.includes('@') ? [author] : []
                await this.sendMessage(id, { 
                    text: text + (author ? `\n👤 Oleh: @${author.split('@')[0]}` : ''),
                    mentions: mentions
                })
            } else if (text) {
                await this.sendMessage(id, { text: text })
            }
        } catch (e) {
            console.error(chalk.red(`[❌ GROUP UPDATE ERROR] ${id}`), e)
        }
    }
}

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: '🚫 *ACCESS DENIED*\nKamu bukan real owner!',
        owner: '🚫 *ACCESS DENIED*\nKamu bukan owner!',
        mods: '🚫 *ACCESS DENIED*\nCommand khusus moderator!',
        premium: '🚫 *ACCESS DENIED*\nKamu harus premium dulu!',
        group: '🚫 *ACCESS DENIED*\nCommand khusus group!',
        private: '🚫 *ACCESS DENIED*\nCommand khusus private chat!',
        admin: '🚫 *ACCESS DENIED*\nKamu harus admin!',
        botAdmin: '🚫 *ACCESS DENIED*\nJadikan bot admin dulu!',
        unreg: '🚫 *ACCESS DENIED*\nKamu harus daftar dulu!\nKetik: .daftar nama|umur',
        restrict: '🚫 *ACCESS DENIED*\nFitur ini sedang dinonaktifkan!',
        disable: '🚫 *ACCESS DENIED*\nCommand ini sedang dimatikan!',
        timeout: '⏳ *Timeout!* Proses terlalu lama.',
        maintenance: '🔧 *Maintenance!* Bot sedang diperbaiki.',
    }[type]
    
    if (msg) {
        conn.sendMessage(m.chat, {
            text: msg,
            mentions: [m.sender]
        }, { quoted: m })
        console.log(chalk.yellow(`[⚠️ ACCESS DENIED] ${type} - ${m.sender}`))
    }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.cyan('[🔄 UPDATE] handler.js diperbarui'))
    if (global.reloadHandler) {
        console.log(chalk.green('[✅ RELOAD] Handler direload'))
        await global.reloadHandler()
    }
})