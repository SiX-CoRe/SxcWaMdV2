
import path from 'path'
import { tmpdir } from "os";
import convert from './toAll.js'
import chalk from 'chalk'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import fs_1 from "fs/promises";
import os from 'os'
import util from 'util'
import { exec as _exec } from "child_process";
import * as fileTypeModule from 'file-type';
const fileTypeFromBuffer = async (buf) => {
  try {
    if (fileTypeModule.fileTypeFromBuffer) return await fileTypeModule.fileTypeFromBuffer(buf);
    if (fileTypeModule.fromBuffer) return await fileTypeModule.fromBuffer(buf);
    if (fileTypeModule.default?.fromBuffer) return await fileTypeModule.default.fromBuffer(buf);
    if (typeof fileTypeModule.default === 'function') return await fileTypeModule.default(buf);
  } catch (_) {}
  return null;
};
import { format, promisify } from "util";
import crypto from "crypto";
import { fileURLToPath } from 'url'
import store from './store.js'
const sharp = (await import('sharp')).default
const exec = promisify(_exec);
const tmpFile = (ext = "") => path.join(tmpdir(), Date.now() + ext);

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const _isStatusJid = (id) => !id || id === "status@broadcast";
const _isGroupJid = (id = "") => id && id.endsWith("@g.us");

/**
 * @type {import('@adiwajshing/baileys')}
 */

const baill = await import("@adiwajshing/baileys")

const {
    default: _makeWaSocket,
    proto,
    areJidsSameUser,
    downloadContentFromMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    generateWAMessage,
    getDevice,
    WAMessageStubType,
    prepareWAMessageMedia,
    extractMessageContent,
    jidDecode,
    jidNormalizedUser,
    MessageType,
    Mimetype,
} = baill
import pino from "pino"

const logger = pino({
    level: "debug",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "HH:MM",
            ignore: "pid,hostname",
        },
    },
});

export function makeWASocket(connectionOptions, options = {}) {
    /**
     * @type {import('@adiwajshing/baileys').WASocket | import('@adiwajshing/baileys').WALegacySocket}
     */
    let conn = _makeWaSocket(connectionOptions)

    let sock = Object.defineProperties(conn, {
        chats: {
            value: { ...(options.chats || {}) },
            writable: true
        },
        decodeJid: {
            value(jid) {
                if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null
                return jid.decodeJid()
            }
        },
        logger: {
            get() {
                const log = (level, args) => {
                    switch (level) {
                        case "info":
                            logger.info(...args);
                            break;
                        case "warn":
                            logger.warn(...args);
                            break;
                        case "error":
                            logger.error(...args);
                            break;
                        case "debug":
                            logger.debug(...args);
                            break;
                        case "trace":
                            logger.trace?.(...args);
                            break;
                        default:
                            logger.info(...args);
                    }
                };

                return {
                    info: (...a) => log("info", a),
                    error: (...a) => log("error", a),
                    warn: (...a) => log("warn", a),
                    trace: (...a) => log("trace", a),
                    debug: (...a) => log("debug", a),
                };
            },
            enumerable: true,
        },
        getFile: {
            /**
             * getBuffer hehe
             * @param {fs.PathLike | Buffer | string} PATH - The path to the file, or a URL, or a base64 string, or a buffer
             * @param {Boolean} saveToFile - Whether to save the file locally
             * @returns {Promise<Object>} - An object containing file data, type, and utility functions
             */
            async value(PATH, saveToFile = false) {
                let res, filename;
                let data = Buffer.alloc(0);
                if (Buffer.isBuffer(PATH)) {
                    data = PATH;
                } else if (PATH instanceof ArrayBuffer) {
                    data = Buffer.from(PATH);
                } else if (/^data:.*?\/.*?;base64,/i.test(PATH)) {
                    data = Buffer.from(PATH.split`,` [1], "base64");
                } else if (/^https?:\/\//.test(PATH)) {
                    res = await fetch(PATH);
                    data = Buffer.from(await res.arrayBuffer());
                } else if (typeof PATH === "string" && fs.existsSync(PATH)) {
                    filename = PATH;
                    data = fs.readFileSync(PATH);
                } else if (typeof PATH === "string") {
                    data = Buffer.from(PATH);
                }
                if (!Buffer.isBuffer(data))
                    throw new TypeError("Result is not a buffer");
                const type = (await fileTypeFromBuffer(data)) || {
                    mime: "application/octet-stream",
                    ext: "bin",
                };
                if (data.length && saveToFile && !filename) {
                    const tmpDir = path.join(global.__dirname(import.meta.url), "../tmp");
                    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
                    filename = path.join(tmpDir, +new Date() + "." + type.ext);
                    await fs.promises.writeFile(filename, data);
                }
                return {
                    res,
                    filename,
                    ...type,
                    data,
                    deleteFile() {
                        return filename && fs.promises.unlink(filename);
                    },
                };
            },
            enumerable: true,
        },
        waitEvent: {
            /**
             * Wait for a specific event to be emitted
             * @param {String} eventName - The name of the event to wait for
             * @param {Function} is - A function that returns true when the desired condition is met
             * @param {Number} maxTries - The maximum number of attempts to wait for the event (default: 25)
             * @param {Number} timeoutMs - Optional timeout in milliseconds (default: 5000 ms)
             * @returns {Promise<*>} - Resolves with event data if successful, or rejects with an error
             */
            value(eventName, is = () => true, maxTries = 25, timeoutMs = 5000) {
                return new Promise((resolve, reject) => {
                    let tries = 0;
                    let timeout;

                    
                    const onEvent = (...args) => {
                        tries++;
                        if (is(...args)) {  
                            clearTimeout(timeout); 
                            conn.ev.off(eventName, onEvent); 
                            resolve(...args); 
                        } else if (tries >= maxTries) {
                            clearTimeout(timeout); 
                            conn.ev.off(eventName, onEvent); 
                            reject(new Error(`Max tries reached for event: ${eventName}`));
                        }
                    };

                    
                    conn.ev.on(eventName, onEvent);

                    
                    timeout = setTimeout(() => {
                        conn.ev.off(eventName, onEvent); 
                        reject(new Error(`Timeout reached for event: ${eventName}`));
                    }, timeoutMs);
                });
            },
            enumerable: true
        },
        sendFile: {
            /**
             * Send Media/File with Automatic Type Specifier
             * @param {String} jid - WhatsApp JID to send the message to
             * @param {String|Buffer} path - The path to the file or a buffer
             * @param {String} filename - The name of the file (optional)
             * @param {String} caption - The caption for the media (optional)
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted - Message to reply to (optional)
             * @param {Boolean} ptt - If the file is a voice note
             * @param {Object} options - Additional options for sending media
             * @returns {Promise<import('@adiwajshing/baileys').proto.WebMessageInfo>}
             */
            async value(
                jid,
                path,
                filename = "",
                text = "",
                quoted,
                ptt = false,
                options = {},
            ) {
                let ephemeral =
                    this.chats[jid]?.metadata?.ephemeralDuration ||
                    this.chats[jid]?.ephemeralDuration ||
                    false;
                let caption = text;
                let type = await this.getFile(path, true);
                let {
                    res,
                    data: file,
                    filename: pathFile
                } = type;
                if (res?.status !== 200 || file.length <= 65536) {
                    try {
                        throw {
                            json: JSON.parse(file.toString())
                        };
                    } catch (e) {
                        if (e.json) throw e.json;
                    }
                }
                let opt = {};
                if (quoted) opt.quoted = quoted;
                if (!type) options.asDocument = true;
                let mtype = "";
                let mimetype = options.mimetype || type.mime;
                if (
                    /webp/.test(type.mime) ||
                    (/image/.test(type.mime) && options.asSticker)
                )
                    mtype = "sticker";
                else if (
                    /image/.test(type.mime) ||
                    (/webp/.test(type.mime) && options.asImage)
                )
                    mtype = "image";
                else if (/video/.test(type.mime)) {
                    if (options.asPTV) {
                        mtype = "video";
                        options.ptv = true;
                    } else mtype = "video";
                } else if (/audio/.test(type.mime)) {
                    let output = tmpFile(".opus");
                    await exec(
                      `ffmpeg -i ${pathFile} -vn -c:a libopus -b:a 128k ${output}`,
                    );
                    file = fs.readFileSync(output);
                    pathFile = output;
                    mtype = "audio";
                    mimetype = options.mimetype || "audio/ogg; codecs=opus";
                } else mtype = "document";
                if (options.asDocument) mtype = "document";
                for (let o of [
                        "asSticker",
                        "asLocation",
                        "asVideo",
                        "asDocument",
                        "asImage",
                    ])
                    delete options[o];
                let message = {
                    ...options,
                    caption,
                    ptt,
                    ptv: options.ptv || false,
                    [mtype]: pathFile ? {
                        url: pathFile
                    } : file,
                    mimetype,
                    fileName: filename ||
                        (pathFile ? pathFile.split("/").pop() : `file.${type.ext}`),
                };
                let m = null;
                try {
                    m = await this.sendMessage(jid, message, {
                        ...opt,
                        ...options,
                        ephemeralExpiration: ephemeral,
                    });
                } catch (e) {
                    console.error(e);
                }
                if (!m) {
                    m = await this.sendMessage(
                        jid, {
                            ...message,
                            [mtype]: file
                        }, {
                            ...opt,
                            ...options,
                            ephemeralExpiration: ephemeral
                        },
                    );
                }
                file = null;
                return m;
            },
            enumerable: true,
        },
        /** Resize Image
          *
          * @param {Buffer} Buffer (Only Image)
          * @param {Numeric} Width
          * @param {Numeric} Height
          */
        resize: {
            async value(image, width, height) {
                const buffer = Buffer.isBuffer(image) ? image : Buffer.from(image);

                return await sharp(buffer)
                    .resize(width, height, {
                        fit: "cover"
                    })
                    .toBuffer();
            }
        },
        reply: {
            /**
             * Reply to a message - SIMPLIFIED without externalAdReply
             * @param {String} jid
             * @param {String|Buffer} text
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
             * @param {Object} options
             */
            value(jid, text = '', quoted, options) {
                
                if (Buffer.isBuffer(text)) {
                    return conn.sendFile(jid, text, 'file', '', quoted, false, options)
                }

                return conn.sendMessage(jid, {
                    text: text,
                    ...options
                }, {
                    quoted,
                    ephemeralExpiration: options?.ephemeralExpiration || global.ephemeral
                })
            }
        },
        sendMedia: {
            /**
             * Send Media/File with Automatic Type Specifier
             * @param {String} jid - WhatsApp JID to send the message to
             * @param {String|Buffer} path - The path to the file or a buffer
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted - Message to reply to (optional)
             * @param {Object} options - Additional options for sending media
             * @returns {Promise<import('@adiwajshing/baileys').proto.WebMessageInfo>}
             */
            async value(jid, path, quoted, options = {}) {
                try {
                    
                    let type = await conn.getFile(path, true);
                    let { ext, mime, data: file } = type;

                    
                    if (!mime) throw new Error('File type could not be determined.');
                    let messageType = mime.split('/')[0];

                    /**
             * Helper to determine the media type
             * @param {String} mime - The MIME type of the file
             * @param {Object} options - Options that may affect media type selection
             * @returns {String} - The media type ('image', 'video', 'audio', 'document')
             */
                    let getMediaType = function (mime, options) {
                        if (options.asDocument) return 'document'; 
                        if (/image/.test(mime)) return 'image';
                        if (/video/.test(mime)) return 'video';
                        if (/audio/.test(mime)) return 'audio';
                        return null;
                    }

                    let mediaType = getMediaType(mime, options);
                    if (!mediaType) throw new Error('Unsupported media type.');

                    
                    let message = {
                        [mediaType]: file,
                        mimetype: mime,
                        fileName: options.fileName || path.split('/').pop(),
                        ...options
                    };

                    
                    return await conn.sendMessage(jid, message, { quoted });
                } catch (err) {
                    console.error('Error in sendMedia:', err);
                    throw new Error('Failed to send media: ' + err.message);
                }
            },
            enumerable: true
        },
        /**
    *status 
    */
        updateProfileStatus: {
            async value(status) {
                return await conn.query({
                    tag: 'iq',
                    attrs: {
                        to: 's.whatsapp.net',
                        type: 'set',
                        xmlns: 'status',
                    },
                    content: [
                        {
                            tag: 'status',
                            attrs: {},
                            content: Buffer.from(status, 'utf-8')
                        }
                    ]
                })
            }
        },
        
        sendButton: {
            async value(jid, content = {}, options = {}) {
                if (!this.user?.id) {
                    throw new Error("User not authenticated");
                }

                const {
                    text = "",
                        caption = "",
                        title = "",
                        footer = "",
                        buttons = [],
                        hasMediaAttachment = false,
                        image = null,
                        video = null,
                        document = null,
                        mimetype = null,
                        jpegThumbnail = null,
                        location = null,
                        product = null,
                        businessOwnerJid = null,
                        messageJson = null,
                } = content;

                if (!Array.isArray(buttons) || buttons.length === 0) {
                    throw new Error("buttons must be a non-empty array");
                }

                const interactiveButtons = [];

                for (let i = 0; i < buttons.length; i++) {
                    const btn = buttons[i];

                    if (!btn || typeof btn !== "object") {
                        throw new Error(`button[${i}] must be an object`);
                    }

                    if (btn.name && btn.buttonParamsJson) {
                        interactiveButtons.push(btn);
                        continue;
                    }

                    if (btn.id || btn.text || btn.displayText) {
                        interactiveButtons.push({
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: btn.text || btn.displayText || `Button ${i + 1}`,
                                id: btn.id || `quick_${i + 1}`,
                            }),
                        });
                        continue;
                    }

                    if (btn.buttonId && btn.buttonText?.displayText) {
                        interactiveButtons.push({
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: btn.buttonText.displayText,
                                id: btn.buttonId,
                            }),
                        });
                        continue;
                    }

                    throw new Error(`button[${i}] has invalid shape`);
                }

                let messageContent = {};

                if (image) {
                    const mediaInput = {};
                    if (Buffer.isBuffer(image)) {
                        mediaInput.image = image;
                    } else if (typeof image === "object" && image.url) {
                        mediaInput.image = {
                            url: image.url
                        };
                    } else if (typeof image === "string") {
                        mediaInput.image = {
                            url: image
                        };
                    }

                    const preparedMedia = await prepareWAMessageMedia(mediaInput, {
                        upload: this.waUploadToServer,
                    });

                    messageContent.header = {
                        title: title || "",
                        hasMediaAttachment: hasMediaAttachment,
                        imageMessage: preparedMedia.imageMessage,
                    };
                } else if (video) {
                    const mediaInput = {};
                    if (Buffer.isBuffer(video)) {
                        mediaInput.video = video;
                    } else if (typeof video === "object" && video.url) {
                        mediaInput.video = {
                            url: video.url
                        };
                    } else if (typeof video === "string") {
                        mediaInput.video = {
                            url: video
                        };
                    }

                    const preparedMedia = await prepareWAMessageMedia(mediaInput, {
                        upload: this.waUploadToServer,
                    });

                    if (content.gifPlayback || options.gifPlayback) {
                        preparedMedia.videoMessage.gifPlayback = true;
                    }

                    messageContent.header = {
                        title: title || "",
                        hasMediaAttachment: hasMediaAttachment,
                        videoMessage: preparedMedia.videoMessage,
                    };
                } else if (document) {
                    const mediaInput = {
                        document: {}
                    };

                    if (Buffer.isBuffer(document)) {
                        mediaInput.document = document;
                    } else if (typeof document === "object" && document.url) {
                        mediaInput.document = {
                            url: document.url
                        };
                    } else if (typeof document === "string") {
                        mediaInput.document = {
                            url: document
                        };
                    }

                    if (mimetype && typeof mediaInput.document === "object") {
                        mediaInput.document.mimetype = mimetype;
                    }

                    if (jpegThumbnail && typeof mediaInput.document === "object") {
                        if (Buffer.isBuffer(jpegThumbnail)) {
                            mediaInput.document.jpegThumbnail = jpegThumbnail;
                        }
                    }

                    const preparedMedia = await prepareWAMessageMedia(mediaInput, {
                        upload: this.waUploadToServer,
                    });

                    messageContent.header = {
                        title: title || "",
                        hasMediaAttachment: hasMediaAttachment,
                        documentMessage: preparedMedia.documentMessage,
                    };
                } else if (location && typeof location === "object") {
                    messageContent.header = {
                        title: title || location.name || "Location",
                        hasMediaAttachment: hasMediaAttachment,
                        locationMessage: {
                            degreesLatitude: location.degressLatitude || location.degreesLatitude || 0,
                            degreesLongitude: location.degressLongitude || location.degreesLongitude || 0,
                            name: location.name || "",
                            address: location.address || "",
                        },
                    };
                } else if (product && typeof product === "object") {
                    let productImageMessage = null;
                    if (product.productImage) {
                        const mediaInput = {};
                        if (Buffer.isBuffer(product.productImage)) {
                            mediaInput.image = product.productImage;
                        } else if (
                            typeof product.productImage === "object" &&
                            product.productImage.url
                        ) {
                            mediaInput.image = {
                                url: product.productImage.url
                            };
                        } else if (typeof product.productImage === "string") {
                            mediaInput.image = {
                                url: product.productImage
                            };
                        }

                        const preparedMedia = await prepareWAMessageMedia(mediaInput, {
                            upload: this.waUploadToServer,
                        });
                        productImageMessage = preparedMedia.imageMessage;
                    }

                    messageContent.header = {
                        title: title || product.title || "Product",
                        hasMediaAttachment: hasMediaAttachment,
                        productMessage: {
                            product: {
                                productImage: productImageMessage,
                                productId: product.productId || "",
                                title: product.title || "",
                                description: product.description || "",
                                currencyCode: product.currencyCode || "USD",
                                priceAmount1000: parseInt(product.priceAmount1000) || 0,
                                retailerId: product.retailerId || "",
                                url: product.url || "",
                                productImageCount: product.productImageCount || 1,
                            },
                            businessOwnerJid: businessOwnerJid || product.businessOwnerJid || this.user.id,
                        },
                    };
                } else if (title) {
                    messageContent.header = {
                        title: title,
                        hasMediaAttachment: false,
                    };
                }

                const hasMedia = !!(image || video || document || location);
                const bodyText = hasMedia ? caption : text || caption;

                if (bodyText) {
                    messageContent.body = {
                        text: bodyText
                    };
                }

                if (footer) {
                    messageContent.footer = {
                        text: footer
                    };
                }

                messageContent.nativeFlowMessage = {
                    buttons: interactiveButtons,
                };

                if (messageJson) {
                    messageContent.nativeFlowMessage.messageParamsJson = JSON.stringify(messageJson);
                }

                const payload = proto.Message.InteractiveMessage.create(messageContent);

                const msg = generateWAMessageFromContent(
                    jid, {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: payload,
                            },
                        },
                    }, {
                        userJid: this.user.id,
                        quoted: options?.quoted || null,
                    }
                );

                const isGroup = jid.endsWith("@g.us");
                const additionalNodes = [{
                    tag: "biz",
                    attrs: {},
                    content: [{
                        tag: "interactive",
                        attrs: {
                            type: "native_flow",
                            v: "1"
                        },
                        content: [{
                            tag: "native_flow",
                            attrs: {
                                v: "9",
                                name: "mixed"
                            },
                        }, ],
                    }, ],
                }, ];

                if (!isGroup) {
                    additionalNodes.push({
                        tag: "bot",
                        attrs: {
                            biz_bot: "1"
                        },
                    });
                }

                await this.relayMessage(jid, msg.message, {
                    messageId: msg.key.id,
                    additionalNodes,
                });

                return msg;
            },
            enumerable: true,
        },
        
        sendAlbum: {
            async value(jid, items = [], options = {}) {
                options = {
                    ...options
                };

                const delay = !isNaN(options.delay) ? options.delay : 500;
                const album = generateWAMessageFromContent(jid, {
                    messageContextInfo: {
                        messageSecret: crypto.randomBytes(32)
                    },
                    albumMessage: {
                        expectedImageCount: items.filter(a => a.hasOwnProperty("image")).length,
                        expectedVideoCount: items.filter(a => a.hasOwnProperty("video")).length,
                        ...(options.quoted ? {
                            contextInfo: {
                                remoteJid: options.quoted.key.remoteJid,
                                fromMe: options.quoted.key.fromMe,
                                stanzaId: options.quoted.key.id,
                                participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                                quotedMessage: options.quoted.message,
                                ...(options.mentions ? {
                                    mentionedJid: options.mentions
                                } : {})
                            }
                        } : {})
                    }
                }, {
                    userJid: this.user.jid,
                    upload: this.waUploadToServer
                });

                await this.relayMessage(album.key.remoteJid, album.message, {
                    messageId: album.key.id
                });

                for (let content of items) {
                    const img = await generateWAMessage(album.key.remoteJid, content, {
                        ...(options.quoted ? {
                            quoted: options.quoted
                        } : {}),
                        ...(options.mentions ? {
                            mentions: options.mentions
                        } : {}),
                        upload: this.waUploadToServer,
                    });

                    img.message.messageContextInfo = {
                        messageSecret: crypto.randomBytes(32),
                        messageAssociation: {
                            associationType: 1,
                            parentMessageKey: album.key
                        }
                    };

                    await this.relayMessage(img.key.remoteJid, img.message, {
                        messageId: img.key.id
                    });
                    await baill.delay(delay);
                }
                return album;
            },
            enumerable: true,
        },
        sendInviteGroup: {
            async value(
                jid,
                participant,
                inviteCode,
                inviteExpiration,
                groupName = "Unknown Subject",
                caption = "Invitation to join my WhatsApp group",
                jpegThumbnail = null,
                options = {}
            ) {
                if (!this.user?.id) {
                    throw new Error("User not authenticated");
                }

                const msg = proto.Message.create({
                    groupInviteMessage: {
                        inviteCode,
                        inviteExpiration:
                            parseInt(inviteExpiration) || Date.now() + 3 * 24 * 60 * 60 * 1000,
                        groupJid: jid,
                        groupName,
                        jpegThumbnail: Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail : null,
                        caption,
                        contextInfo: {
                            mentionedJid: options.mentions || [],
                        },
                    },
                });

                const message = generateWAMessageFromContent(participant, msg, {
                    userJid: this.user.id,
                    ...options,
                });

                return await this.relayMessage(participant, message.message, {
                    messageId: message.key.id,
                });
            },
            enumerable: true,
        },
        sendCard: {
            async value(jid, content = {}, options = {}) {
                if (!this.user?.id) {
                    throw new Error("User not authenticated");
                }

                const { text = "", title = "", footer = "", cards = [] } = content;

                if (!Array.isArray(cards) || cards.length === 0) {
                    throw new Error("Cards must be a non-empty array");
                }

                const carouselCards = await Promise.all(
                    cards.map(async (card) => {
                        let mediaType = null;
                        let mediaContent = null;

                        if (card.image) {
                            mediaType = "image";
                            mediaContent = card.image;
                        } else if (card.video) {
                            mediaType = "video";
                            mediaContent = card.video;
                        } else {
                            throw new Error("Card must have 'image' or 'video' property");
                        }

                        const mediaInput = {};
                        if (Buffer.isBuffer(mediaContent)) {
                            mediaInput[mediaType] = mediaContent;
                        } else if (typeof mediaContent === "object" && mediaContent.url) {
                            mediaInput[mediaType] = {
                                url: mediaContent.url,
                            };
                        } else if (typeof mediaContent === "string") {
                            mediaInput[mediaType] = { url: mediaContent };
                        } else {
                            throw new Error("Media must be Buffer, URL string, or { url: string }");
                        }

                        const preparedMedia = await prepareWAMessageMedia(mediaInput, {
                            upload: this.waUploadToServer,
                        });

                        const cardObj = {
                            header: {
                                title: card.title || "",
                                hasMediaAttachment: true,
                            },
                            body: {
                                text: card.body || "",
                            },
                            footer: {
                                text: card.footer || "",
                            },
                        };

                        if (mediaType === "image") {
                            cardObj.header.imageMessage = preparedMedia.imageMessage;
                        } else if (mediaType === "video") {
                            cardObj.header.videoMessage = preparedMedia.videoMessage;
                        }

                        if (Array.isArray(card.buttons) && card.buttons.length > 0) {
                            const processedButtons = [];

                            for (const btn of card.buttons) {
                                if (btn.name && btn.buttonParamsJson) {
                                    processedButtons.push({
                                        name: btn.name,
                                        buttonParamsJson: btn.buttonParamsJson,
                                    });
                                    continue;
                                }

                                if (!btn.type) continue;

                                let buttonData = null;

                                switch (btn.type) {
                                    case "quick_reply":
                                        if (btn.id && btn.display_text) {
                                            buttonData = {
                                                name: "quick_reply",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: btn.display_text,
                                                    id: btn.id,
                                                }),
                                            };
                                        }
                                        break;

                                    case "cta_url":
                                        if (btn.url && btn.display_text) {
                                            buttonData = {
                                                name: "cta_url",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: btn.display_text,
                                                    url: btn.url,
                                                    merchant_url: btn.merchant_url || btn.url,
                                                }),
                                            };
                                        }
                                        break;

                                    case "cta_copy":
                                        if (btn.copy_code && btn.display_text) {
                                            buttonData = {
                                                name: "cta_copy",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: btn.display_text,
                                                    copy_code: btn.copy_code,
                                                }),
                                            };
                                        }
                                        break;

                                    case "cta_call":
                                        if (btn.phone_number && btn.display_text) {
                                            buttonData = {
                                                name: "cta_call",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: btn.display_text,
                                                    phone_number: btn.phone_number,
                                                }),
                                            };
                                        }
                                        break;

                                    case "cta_catalog":
                                        if (btn.business_phone_number) {
                                            buttonData = {
                                                name: "cta_catalog",
                                                buttonParamsJson: JSON.stringify({
                                                    business_phone_number:
                                                        btn.business_phone_number,
                                                }),
                                            };
                                        }
                                        break;

                                    case "cta_reminder":
                                        if (btn.display_text) {
                                            buttonData = {
                                                name: "cta_reminder",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: btn.display_text,
                                                }),
                                            };
                                        }
                                        break;

                                    case "cta_cancel_reminder":
                                        if (btn.display_text) {
                                            buttonData = {
                                                name: "cta_cancel_reminder",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: btn.display_text,
                                                }),
                                            };
                                        }
                                        break;

                                    case "address_message":
                                        if (btn.display_text) {
                                            buttonData = {
                                                name: "address_message",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: btn.display_text,
                                                }),
                                            };
                                        }
                                        break;

                                    case "send_location":
                                        if (btn.display_text) {
                                            buttonData = {
                                                name: "send_location",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: btn.display_text,
                                                }),
                                            };
                                        }
                                        break;

                                    case "open_webview":
                                        if (btn.url && btn.title) {
                                            buttonData = {
                                                name: "open_webview",
                                                buttonParamsJson: JSON.stringify({
                                                    title: btn.title,
                                                    link: {
                                                        in_app_webview:
                                                            btn.in_app_webview !== false,
                                                        url: btn.url,
                                                    },
                                                }),
                                            };
                                        }
                                        break;

                                    case "mpm":
                                        if (btn.product_id) {
                                            buttonData = {
                                                name: "mpm",
                                                buttonParamsJson: JSON.stringify({
                                                    product_id: btn.product_id,
                                                }),
                                            };
                                        }
                                        break;

                                    case "wa_payment_transaction_details":
                                        if (btn.transaction_id) {
                                            buttonData = {
                                                name: "wa_payment_transaction_details",
                                                buttonParamsJson: JSON.stringify({
                                                    transaction_id: btn.transaction_id,
                                                }),
                                            };
                                        }
                                        break;

                                    case "automated_greeting_message_view_catalog":
                                        if (btn.business_phone_number && btn.catalog_product_id) {
                                            buttonData = {
                                                name: "automated_greeting_message_view_catalog",
                                                buttonParamsJson: JSON.stringify({
                                                    business_phone_number:
                                                        btn.business_phone_number,
                                                    catalog_product_id: btn.catalog_product_id,
                                                }),
                                            };
                                        }
                                        break;

                                    case "galaxy_message":
                                        if (btn.flow_id && btn.flow_token) {
                                            buttonData = {
                                                name: "galaxy_message",
                                                buttonParamsJson: JSON.stringify({
                                                    mode: btn.mode || "published",
                                                    flow_message_version:
                                                        btn.flow_message_version || "3",
                                                    flow_token: btn.flow_token,
                                                    flow_id: btn.flow_id,
                                                    flow_cta: btn.flow_cta || "",
                                                    flow_action: btn.flow_action || "navigate",
                                                    flow_action_payload:
                                                        btn.flow_action_payload || {},
                                                    flow_metadata: btn.flow_metadata || {},
                                                }),
                                            };
                                        }
                                        break;

                                    case "single_select":
                                        if (btn.sections && btn.title) {
                                            buttonData = {
                                                name: "single_select",
                                                buttonParamsJson: JSON.stringify({
                                                    title: btn.title,
                                                    sections: btn.sections,
                                                }),
                                            };
                                        }
                                        break;
                                }

                                if (buttonData) {
                                    processedButtons.push(buttonData);
                                }
                            }

                            if (processedButtons.length > 0) {
                                cardObj.nativeFlowMessage = { buttons: processedButtons };
                            }
                        }

                        return cardObj;
                    })
                );

                const payload = proto.Message.InteractiveMessage.create({
                    body: { text: text },
                    footer: { text: footer },
                    header: title ? { title: title } : undefined,
                    carouselMessage: {
                        cards: carouselCards,
                        messageVersion: 1,
                    },
                });

                const msg = generateWAMessageFromContent(
                    jid,
                    {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: payload,
                            },
                        },
                    },
                    {
                        userJid: this.user.id,
                        quoted: options?.quoted || null,
                    }
                );

                await this.relayMessage(jid, msg.message, {
                    messageId: msg.key.id,
                });

                return msg;
            },
            enumerable: true,
        },
        /**
            * Send Poll
            */
        sendPoll: {
            async value(jid, name = '', optiPoll, options) {
                if (!Array.isArray(optiPoll[0]) && typeof optiPoll[0] === 'string') optiPoll = [optiPoll]
                if (!options) options = {}
                const pollMessage = {
                    name: name,
                    options: optiPoll.map(btn => ({
                        optionName: !nullish(btn[0]) && btn[0] || ''
                    })),
                    selectableOptionsCount: 1
                }
                return conn.relayMessage(jid, { pollCreationMessage: pollMessage }, { ...options });
            }
        },
        downloadAndSaveMediaMessage: {
            /**
             * Download and save a media message to a file
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} message - The message containing media
             * @param {String} filename - The base name of the file to save
             * @param {Boolean} attachExtension - Whether to attach the file extension based on the media type
             * @returns {Promise<String>} - The path to the saved file
             */
            async value(message, filename, attachExtension = true) {
                try {
                    
                    let quoted = message.msg || message;
                    let mime = (message.msg || message).mimetype || '';
                    let messageType = mime.split('/')[0];

                    if (!['image', 'video', 'audio', 'document'].includes(messageType)) {
                        throw new Error('Message does not contain downloadable media.');
                    }

                    let fileLen = Number(quoted?.fileLength || quoted?.msg?.fileLength || 0);
                    if (fileLen > 100 * 1024 * 1024) {
                        throw new Error('Ukuran file dokumen/media melebihi batas maksimal 100MB (VPS Protection).');
                    }

                    const stream = await downloadContentFromMessage(quoted, messageType);
                    let buffer = Buffer.from([]);

                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                        if (buffer.length > 100 * 1024 * 1024) {
                            throw new Error('Ukuran file dokumen/media melebihi batas maksimal 100MB (VPS Protection).');
                        }
                    }

                    
                    let fileType = await fileTypeFromBuffer(buffer);
                    if (!fileType) {
                        fileType = { ext: 'bin', mime: 'application/octet-stream' }; 
                    }

                    
                    const trueFileName = attachExtension ? `${filename}.${fileType.ext}` : filename;

                    
                    await fs.promises.writeFile(trueFileName, buffer);

                    return trueFileName; 
                } catch (err) {
                    console.error('Error downloading and saving media message:', err);
                    throw new Error('Failed to download and save media message: ' + err.message);
                }
            },
            enumerable: true
        },
        /**
     * ms to date
     * @param {String} ms
     */
        msToDate: {
            async value(ms) {
                let days = Math.floor(ms / (24 * 60 * 60 * 1000));
                let daysms = ms % (24 * 60 * 60 * 1000);
                let hours = Math.floor((daysms) / (60 * 60 * 1000));
                let hoursms = ms % (60 * 60 * 1000);
                let minutes = Math.floor((hoursms) / (60 * 1000));
                let minutesms = ms % (60 * 1000);
                let sec = Math.floor((minutesms) / (1000));
                return days + " Hari " + hours + " Jam " + minutes + " Menit";
                
            }
        },
        delay: {
            async value(ms) {
                return new Promise((resolve, reject) => setTimeout(resolve, ms)
                )
            }
        },
        cMod: {
            /**
             * cMod
             * @param {String} jid 
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} message 
             * @param {String} text 
             * @param {String} sender 
             * @param {*} options 
             * @returns 
             */
            value(jid, message, text = '', sender = conn.user.jid, options = {}) {
                if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions]
                let copy = message.toJSON()
                delete copy.message.messageContextInfo
                delete copy.message.senderKeyDistributionMessage
                let mtype = Object.keys(copy.message)[0]
                let msg = copy.message
                let content = msg[mtype]
                if (typeof content === 'string') msg[mtype] = text || content
                else if (content.caption) content.caption = text || content.caption
                else if (content.text) content.text = text || content.text
                if (typeof content !== 'string') {
                    msg[mtype] = { ...content, ...options }
                    msg[mtype].contextInfo = {
                        ...(content.contextInfo || {}),
                        mentionedJid: options.mentions || content.contextInfo?.mentionedJid || []
                    }
                }
                if (copy.participant) sender = copy.participant = sender || copy.participant
                else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
                if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
                else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
                copy.key.remoteJid = jid
                copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false
                return proto.WebMessageInfo.create(copy)
            },
            enumerable: true
        },
        copyNForward: {
            /**
             * Exact Copy Forward - SIMPLIFIED
             * @param {String} jid
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} message
             * @param {Boolean|Number} forwardingScore
             * @param {Object} options
             */
            async value(jid, message, forwardingScore = true, options = {}) {
                let vtype
                if (options.readViewOnce && message.message.viewOnceMessage?.message) {
                    vtype = Object.keys(message.message.viewOnceMessage.message)[0]
                    delete message.message.viewOnceMessage.message[vtype].viewOnce
                    message.message = proto.Message.create(
                        JSON.parse(JSON.stringify(message.message.viewOnceMessage.message))
                    )
                    message.message[vtype].contextInfo = message.message.viewOnceMessage.contextInfo
                }
                let mtype = Object.keys(message.message)[0]
                let m = generateForwardMessageContent(message, !!forwardingScore)
                let ctype = Object.keys(m)[0]
                if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) m[ctype].contextInfo.forwardingScore += forwardingScore
                m[ctype].contextInfo = {
                    ...(message.message[mtype].contextInfo || {}),
                    ...(m[ctype].contextInfo || {})
                }
                m = generateWAMessageFromContent(jid, m, {
                    ...options,
                    userJid: conn.user.jid
                })
                await conn.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: { ...options } })
                return m
            },
            enumerable: true
        },
        fakeReply: {
            /**
             * Fake Replies - SIMPLIFIED
             * @param {String} jid
             * @param {String|Object} text
             * @param {String} fakeJid
             * @param {String} fakeText
             * @param {String} fakeGroupJid
             * @param {String} options
             */
            value(jid, text = '', fakeJid = this.user.jid, fakeText = '', fakeGroupJid, options) {
                return conn.sendMessage(jid, {
                    text: text,
                    ...options
                }, { 
                    quoted: { 
                        key: { 
                            fromMe: areJidsSameUser(fakeJid, conn.user.id), 
                            participant: fakeJid, 
                            ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}) 
                        }, 
                        message: { conversation: fakeText } 
                    }
                })
            }
        },
        downloadM: {
            /**
             * Download media message
             * @param {Object} m - The message object containing media
             * @param {String} type - The type of media to download (e.g., 'image', 'video', 'audio', 'document')
             * @param {fs.PathLike | fs.promises.FileHandle} saveToFile - Path to save the downloaded file (optional)
             * @returns {Promise<fs.PathLike | fs.promises.FileHandle | Buffer>} - Returns path to file or buffer
             */
            async value(m, type, saveToFile) {
                try {
                    
                    if (!m || !(m.url || m.directPath)) {
                        throw new Error('Invalid message or media not found.');
                    }

                    let fileLen = Number(m?.fileLength || m?.msg?.fileLength || 0);
                    if (fileLen > 100 * 1024 * 1024) {
                        throw new Error('Ukuran file dokumen/media melebihi batas maksimal 100MB (VPS Protection).');
                    }

                    const stream = await downloadContentFromMessage(m, type);
                    let buffer = Buffer.from([]);

                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                        if (buffer.length > 100 * 1024 * 1024) {
                            throw new Error('Ukuran file dokumen/media melebihi batas maksimal 100MB (VPS Protection).');
                        }
                    }

                    
                    if (saveToFile) {
                        const fileType = await fileTypeFromBuffer(buffer);
                        const filename = saveToFile || `downloaded_media.${fileType?.ext || 'bin'}`;
                        await fs.promises.writeFile(filename, buffer);
                        return filename; 
                    }

                    return buffer; 
                } catch (err) {
                    console.error('Error downloading media message:', err);
                    throw new Error('Failed to download media: ' + err.message);
                }
            },
            enumerable: true
        },
        parseMention: {
            /**
             * Parses string into mentionedJid(s)
             * @param {String} text
             * @returns {Array<String>}
             */
            value(text = '') {
                const regex = /@([0-9]{5,16}|0)/g;
                const mentions = [];
                let match;

                while ((match = regex.exec(text)) !== null) {
                    mentions.push(match[1] + '@s.whatsapp.net');
                }

                return mentions;
            },
            enumerable: true
        },
        saveName: {
            async value(id, name = '') {
                if (!id) return
                id = conn.decodeJid(id)
                let isGroup = id.endsWith('@g.us')
                if (id in conn.contacts && conn.contacts[id][isGroup ? 'subject' : 'name'] && id in conn.chats) return
                let metadata = {}
                if (isGroup) metadata = await conn.groupMetadata(id)
                let chat = { ...(conn.contacts[id] || {}), id, ...(isGroup ? { subject: metadata.subject, desc: metadata.desc } : { name }) }
                conn.contacts[id] = chat
                conn.chats[id] = chat
            }
        },
        getName: {
            value: async function (jid = "", withoutContact = false) {
                jid = conn.decodeJid(jid);
                withoutContact = conn.withoutContact || withoutContact;

                if (!jid) return "";

                if (_isGroupJid(jid)) {
                    const chat = conn.chats[jid];
                    if (chat?.subject) return chat.subject;

                    const cached = conn._groupMetaCache.get(jid);
                    if (cached) return cached.subject;

                    try {
                        const md = await conn.groupMetadata(jid);
                        if (md) {
                            conn._groupMetaCache.set(jid, md);
                            return md.subject || chat?.name || jid;
                        }
                    } catch {
                        return chat?.name || jid;
                    }
                }

                const self =
                    conn.user?.lid && areJidsSameUser ? areJidsSameUser(jid, conn.user.lid) : false;

                const v =
                    jid === "12066409886@s.whatsapp.net"
                        ? {
                              jid,
                              vname: "WhatsApp",
                          }
                        : self
                          ? conn.user
                          : conn.chats[jid] || {};

                const name = v.name || v.vname || v.notify || v.verifiedName || v.subject;
                return withoutContact ? "" : name || jid;
            },
            enumerable: true,
        },
        loadMessage: {
            /**
             * 
             * @param {String} messageID 
             * @returns {import('@adiwajshing/baileys').proto.WebMessageInfo}
             */
            value(messageID) {
                return Object.entries(conn.chats)
                    .filter(([_, { messages }]) => typeof messages === 'object')
                    .find(([_, { messages }]) => Object.entries(messages)
                        .find(([k, v]) => (k === messageID || v.key?.id === messageID)))
                    ?.[1].messages?.[messageID]
            },
            enumerable: true
        },
        sendGroupV4Invite: {
            /**
             * sendGroupV4Invite
             * @param {String} jid 
             * @param {*} participant 
             * @param {String} inviteCode 
             * @param {Number} inviteExpiration 
             * @param {String} groupName 
             * @param {String} caption 
             * @param {Buffer} jpegThumbnail
             * @param {*} options 
             */
            async value(jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', jpegThumbnail, options = {}) {
                const msg = proto.Message.create({
                    groupInviteMessage: proto.GroupInviteMessage.create({
                        inviteCode,
                        inviteExpiration: parseInt(inviteExpiration) || + new Date(new Date + (3 * 86400000)),
                        groupJid: jid,
                        groupName: (groupName ? groupName : await conn.getName(jid)) || null,
                        jpegThumbnail: Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail : null,
                        caption
                    })
                })
                const message = generateWAMessageFromContent(participant, msg, options)
                await conn.relayMessage(participant, message.message, { messageId: message.key.id, additionalAttributes: { ...options } })
                return message
            },
            enumerable: true
        },
        processMessageStubType: {
            /**
             * to process MessageStubType
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} m 
             */
            async value(m) {
                if (!m.messageStubType) return
                const chat = conn.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '')
                if (!chat || chat === 'status@broadcast') return
                const emitGroupUpdate = (update) => {
                    conn.ev.emit('groups.update', [{ id: chat, ...update }])
                }
                switch (m.messageStubType) {
                    case WAMessageStubType.REVOKE:
                    case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
                        emitGroupUpdate({ revoke: m.messageStubParameters[0] })
                        break
                    case WAMessageStubType.GROUP_CHANGE_ICON:
                        emitGroupUpdate({ icon: m.messageStubParameters[0] })
                        break
                    default: {
                        console.log({
                            messageStubType: m.messageStubType,
                            messageStubParameters: m.messageStubParameters,
                            type: WAMessageStubType[m.messageStubType]
                        })
                        break
                    }
                }
                const isGroup = chat.endsWith('@g.us')
                if (!isGroup) return
                let chats = conn.chats[chat]
                if (!chats) chats = conn.chats[chat] = { id: chat }
                chats.isChats = true
                const metadata = await conn.groupMetadata(chat).catch(_ => null)
                if (!metadata) return
                chats.subject = metadata.subject
                chats.metadata = metadata
            }
        },
        relayWAMessage: {
            async value(pesanfull) {
                if (pesanfull.message.audioMessage) {
                    await conn.sendPresenceUpdate('recording', pesanfull.key.remoteJid)
                } else {
                    await conn.sendPresenceUpdate('composing', pesanfull.key.remoteJid)
                }
                var mekirim = await conn.relayMessage(pesanfull.key.remoteJid, pesanfull.message, { messageId: pesanfull.key.id })
                conn.ev.emit('messages.upsert', { messages: [pesanfull], type: 'append' });
                return mekirim
            }
        },
        insertAllGroup: {
            async value() {
                const groups = await conn.groupFetchAllParticipating().catch(_ => null) || {}
                for (const group in groups) conn.chats[group] = { ...(conn.chats[group] || {}), id: group, subject: groups[group].subject, isChats: true, metadata: groups[group] }
                return conn.chats
            },
        },
        pushMessage: {
            /**
             * pushMessage
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo[]} m 
             */
            async value(m) {
                if (!m) return
                if (!Array.isArray(m)) m = [m]
                for (const message of m) {
                    try {
                        
                        if (!message) continue
                        if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT) conn.processMessageStubType(message).catch(console.error)
                        const _mtype = Object.keys(message.message || {})
                        const mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) ||
                            (_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) ||
                            _mtype[_mtype.length - 1]
                        const chat = conn.decodeJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '')
                        if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
                            /**
                             * @type {import('@adiwajshing/baileys').proto.IContextInfo}
                             */
                            let context = message.message[mtype].contextInfo
                            let participant = conn.decodeJid(context.participant)
                            const remoteJid = conn.decodeJid(context.remoteJid || participant)
                            /**
                             * @type {import('@adiwajshing/baileys').proto.IMessage}
                             * 
                             */
                            let quoted = message.message[mtype].contextInfo.quotedMessage
                            if ((remoteJid && remoteJid !== 'status@broadcast') && quoted) {
                                let qMtype = Object.keys(quoted)[0]
                                if (qMtype == 'conversation') {
                                    quoted.extendedTextMessage = { text: quoted[qMtype] }
                                    delete quoted.conversation
                                    qMtype = 'extendedTextMessage'
                                }
                                if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {}
                                quoted[qMtype].contextInfo.mentionedJid = context.mentionedJid || quoted[qMtype].contextInfo.mentionedJid || []
                                const isGroup = remoteJid.endsWith('g.us')
                                if (isGroup && !participant) participant = remoteJid
                                const qM = {
                                    key: {
                                        remoteJid,
                                        fromMe: areJidsSameUser(conn.user.jid, remoteJid),
                                        id: context.stanzaId,
                                        participant,
                                    },
                                    message: JSON.parse(JSON.stringify(quoted)),
                                    ...(isGroup ? { participant } : {})
                                }
                                let qChats = conn.chats[participant]
                                if (!qChats) qChats = conn.chats[participant] = { id: participant, isChats: !isGroup }
                                if (!qChats.messages) qChats.messages = {}
                                if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM
                                let qChatsMessages
                                if ((qChatsMessages = Object.entries(qChats.messages)).length > 40) qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length)) 
                            }
                        }
                        if (!chat || chat === 'status@broadcast') continue
                        const isGroup = chat.endsWith('@g.us')
                        let chats = conn.chats[chat]
                        if (!chats) {
                            if (isGroup) await conn.insertAllGroup().catch(console.error)
                            chats = conn.chats[chat] = { id: chat, isChats: true, ...(conn.chats[chat] || {}) }
                        }
                        let metadata, sender
                        if (isGroup) {
                            if (!chats.subject || !chats.metadata) {
                                metadata = await conn.groupMetadata(chat).catch(_ => ({})) || {}
                                if (!chats.subject) chats.subject = metadata.subject || ''
                                if (!chats.metadata) chats.metadata = metadata
                            }
                            sender = conn.decodeJid(message.key?.fromMe && conn.user.id || message.participant || message.key?.participant || chat || '')
                            if (sender !== chat) {
                                let chats = conn.chats[sender]
                                if (!chats) chats = conn.chats[sender] = { id: sender }
                                if (!chats.name) chats.name = message.pushName || chats.name || ''
                            }
                        } else if (!chats.name) chats.name = message.pushName || chats.name || ''
                        if (['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype)) continue
                        chats.isChats = true
                        if (!chats.messages) chats.messages = {}
                        const fromMe = message.key.fromMe || areJidsSameUser(sender || chat, conn.user.id)
                        if (!['protocolMessage'].includes(mtype) && !fromMe && message.messageStubType != WAMessageStubType.CIPHERTEXT && message.message) {
                            delete message.message.messageContextInfo
                            delete message.message.senderKeyDistributionMessage
                            chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2))
                            let chatsMessages
                            if ((chatsMessages = Object.entries(chats.messages)).length > 40) chats.messages = Object.fromEntries(chatsMessages.slice(30, chatsMessages.length))
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
        },
        serializeM: {
            /**
             * Serialize Message, so it easier to manipulate
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} m
             */
            value(m) {
                return smsg(conn, m)
            }
        },
        ...(typeof conn.chatRead !== 'function' ? {
            chatRead: {
                /**
                 * Read message
                 * @param {String} jid 
                 * @param {String|undefined|null} participant 
                 * @param {String} messageID 
                 */
                value(jid, participant = conn.user.jid, messageID) {
                    return conn.sendReadReceipt(jid, participant, [messageID])
                },
                enumerable: true
            }
        } : {}),
        ...(typeof conn.setStatus !== 'function' ? {
            setStatus: {
                /**
                 * setStatus bot
                 * @param {String} status 
                 */
                value(status) {
                    return conn.query({
                        tag: 'iq',
                        attrs: {
                            to: 's.whatsapp.net',
                            type: 'set',
                            xmlns: 'status',
                        },
                        content: [
                            {
                                tag: 'status',
                                attrs: {},
                                content: Buffer.from(status, 'utf-8')
                            }
                        ]
                    })
                },
                enumerable: true
            }
        } : {})
    })
    if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id)
    store.bind(sock)
    return sock
}
/**
 * Serialize Message
 * @param {ReturnType<typeof makeWASocket>} conn 
 * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} m 
 * @param {Boolean} hasParent 
 */
export function smsg(conn, m, hasParent) {
    if (!m) return m
    /**
     * @type {import('@adiwajshing/baileys').proto.WebMessageInfo}
     */
    let M = proto.WebMessageInfo
    m = M.create(m)
    Object.defineProperty(m, 'conn', { enumerable: false, writable: true, value: conn })
    let protocolMessageKey
    if (m.message) {
        if (m.mtype == 'protocolMessage' && m.msg.key) {
            protocolMessageKey = m.msg.key
            if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat
            if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender
            protocolMessageKey.fromMe = conn.decodeJid(protocolMessageKey.participant) === conn.decodeJid(conn.user.id)
            if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === conn.decodeJid(conn.user.id)) protocolMessageKey.remoteJid = m.sender
        }
        if (m.quoted) if (!m.quoted.mediaMessage) delete m.quoted.download
    }
    if (!m.mediaMessage) delete m.download

    try {
        if (protocolMessageKey && m.mtype == 'protocolMessage') conn.ev.emit('message.delete', protocolMessageKey)
    } catch (e) {
        console.error(e)
    }
    return m
}


export function serialize() {
    const MediaType = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage'];
    return Object.defineProperties(proto.WebMessageInfo.prototype, {
        conn: {
            value: undefined,
            enumerable: false,
            writable: true
        },
        id: {
            get() {
                return this.key?.id
            }
        },
        isBaileys: {
            get() {
                return this.id?.length === 16 || this.id?.startsWith('3EB0') && this.id?.length === 22 || false
            }
        },
        chat: {
            get() {
                const senderKeyDistributionMessage = this.message?.senderKeyDistributionMessage?.groupId
                return (
                    this.key?.remoteJid ||
                    (senderKeyDistributionMessage &&
                        senderKeyDistributionMessage !== 'status@broadcast'
                    ) || ''
                ).decodeJid()
            }
        },
        isGroup: {
            get() {
                return this.chat.endsWith('@g.us') ? true : false;
            },
            enumerable: true
        },
        sender: {
            get() {
                return this.conn?.decodeJid(this.key?.fromMe && this.conn?.user.id || this.participant || this.key.participant || this.chat || '')
            },
            enumerable: true
        },
        mtype: {
            get() {
                if (!this.message) return ''
                const type = Object.keys(this.message)
                return (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || 
                    (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || 
                    type[type.length - 1] 
            },
            enumerable: true
        },
        msg: {
            get() {
                if (!this.message) return null
                return this.message[this.mtype]
            }
        },
        mediaMessage: {
            get() {
                if (!this.message) return null
                const Message = ((this.msg?.url || this.msg?.directPath) ? {
                    ...this.message
                } : extractMessageContent(this.message)) || null
                if (!Message) return null
                const mtype = Object.keys(Message)[0]
                return MediaType.includes(mtype) ? Message : null
            },
            enumerable: true
        },
        messages: {
            get() {
                return this.message ? this.message : null
            },
            enumerable: true
        },
        mediaType: {
            get() {
                let message
                if (!(message = this.mediaMessage)) return null
                return Object.keys(message)[0]
            },
            enumerable: true,
        },
        quoted: {
            get() {
                /**
                 * @type {ReturnType<typeof _makeWaSocket>}
                 */
                const self = this
                const msg = self.msg
                const contextInfo = msg?.contextInfo
                const quoted = contextInfo?.quotedMessage
                if (!msg || !contextInfo || !quoted) return null
                const type = Object.keys(quoted)[0]
                let q = quoted[type]
                const text = typeof q === 'string' ? q : q.text
                return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? {
                    text: q
                } : q)), {
                    mtype: {
                        get() {
                            return type
                        },
                        enumerable: true
                    },
                    mediaMessage: {
                        get() {
                            const Message = ((q.url || q.directPath) ? {
                                ...quoted
                            } : extractMessageContent(quoted)) || null
                            if (!Message) return null
                            const mtype = Object.keys(Message)[0]
                            return MediaType.includes(mtype) ? Message : null
                        },
                        enumerable: true
                    },
                    messages: {
                        get() {
                            return quoted ? quoted : null
                        },
                        enumerable: true
                    },
                    mediaType: {
                        get() {
                            let message
                            if (!(message = this.mediaMessage)) return null
                            return Object.keys(message)[0]
                        },
                        enumerable: true,
                    },
                    id: {
                        get() {
                            return contextInfo.stanzaId
                        },
                        enumerable: true
                    },
                    chat: {
                        get() {
                            return contextInfo.remoteJid || self.chat
                        },
                        enumerable: true
                    },
                    isBaileys: {
                        get() {
                            return this.id?.length === 16 || this.id?.startsWith('3EB0') && this.id.length === 22 || false
                        },
                        enumerable: true
                    },
                    sender: {
                        get() {
                            return (contextInfo.participant || this.chat || '').decodeJid()
                        },
                        enumerable: true
                    },
                    fromMe: {
                        get() {
                            return areJidsSameUser(this.sender, self.conn?.user.jid)
                        },
                        enumerable: true,
                    },
                    text: {
                        get() {
                            return text || this.caption || this.contentText || this.selectedDisplayText || ''
                        },
                        enumerable: true
                    },
                    mentionedJid: {
                        get() {
                            return q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || []
                        },
                        enumerable: true
                    },
                    name: {
                        get() {
                            const sender = this.sender
                            return sender ? self.conn?.getName(sender) : null
                        },
                        enumerable: true

                    },
                    vM: {
                        get() {
                            return proto.WebMessageInfo.create({
                                key: {
                                    fromMe: this.fromMe,
                                    remoteJid: this.chat,
                                    id: this.id
                                },
                                message: quoted,
                                ...(self.isGroup ? {
                                    participant: this.sender
                                } : {})
                            })
                        }
                    },
                    fakeObj: {
                        get() {
                            return this.vM
                        }
                    },
                    download: {
                        value(saveToFile = false) {
                            const mtype = this.mediaType
                            return self.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
                        },
                        enumerable: true,
                        configurable: true,
                    },
                    reply: {
                        /**
                         * Reply to quoted message - SIMPLIFIED
                         * @param {String|Object} text
                         * @param {String|false} chatId
                         * @param {Object} options
                         */
                        value(text, chatId, options) {
                            return self.conn?.sendMessage(chatId ? chatId : this.chat, {
                                text: text,
                                ...options
                            }, { 
                                quoted: this.vM,
                                ephemeralExpiration: options?.ephemeralExpiration
                            })
                        },
                        enumerable: true,
                    },
                    copy: {
                        /**
                         * Copy quoted message
                         */
                        value() {
                            const M = proto.WebMessageInfo
                            return smsg(conn, M.create(M.toObject(this.vM)))
                        },
                        enumerable: true,
                    },
                    forward: {
                        /**
                         * Forward quoted message
                         * @param {String} jid
                         *  @param {Boolean} forceForward
                         */
                        value(jid, force = false, options) {
                            return self.conn?.sendMessage(jid, {
                                forward: this.vM,
                                force,
                                ...options
                            }, {
                                ...options
                            })
                        },
                        enumerable: true,
                    },
                    copyNForward: {
                        /**
                         * Exact Forward quoted message
                         * @param {String} jid
                         * @param {Boolean|Number} forceForward
                         * @param {Object} options
                         */
                        value(jid, forceForward = false, options) {
                            return self.conn?.copyNForward(jid, this.vM, forceForward, options)
                        },
                        enumerable: true,

                    },
                    cMod: {
                        /**
                         * Modify quoted Message
                         * @param {String} jid
                         * @param {String} text
                         * @param {String} sender
                         * @param {Object} options
                         */
                        value(jid, text = '', sender = this.sender, options = {}) {
                            return self.conn?.cMod(jid, this.vM, text, sender, options)
                        },
                        enumerable: true,

                    },
                    delete: {
                        /**
                         * Delete quoted message
                         */
                        value() {
                            return self.conn?.sendMessage(this.chat, {
                                delete: this.vM.key
                            })
                        },
                        enumerable: true,

                    },
                    react: {
                        value(text) {
                            return self.conn?.sendMessage(this.chat, {
                                react: {
                                    text,
                                    key: this.vM.key
                                }
                            })
                        },
                        enumerable: true,
                    },
                    command: {
                        get() {
                            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
                            let _prefix = this.prefix ? this.prefix : global.prefix
                            let match = (_prefix instanceof RegExp ? [
                                [_prefix.exec(text || this.caption || this.contentText || this.selectedDisplayText || ''), _prefix]
                            ] :
                                Array.isArray(_prefix) ?
                                    _prefix.map(p => {
                                        let re = p instanceof RegExp ?
                                            p :
                                            new RegExp(str2Regex(p))
                                        return [re.exec(text || this.caption || this.contentText || this.selectedDisplayText || ''), re]
                                    }) :
                                    typeof _prefix === "string" ? [
                                        [new RegExp(str2Regex(_prefix)).exec(text || this.caption || this.contentText || this.selectedDisplayText || ''), new RegExp(str2Regex(_prefix))]
                                    ] : [
                                        [
                                            [], new RegExp
                                        ]
                                    ]
                            ).find(p => p[1])
                            let result = ((opts?.['multiprefix'] ?? true) && (match[0] || "")[0]) || ((opts?.['noprefix'] ?? false) ? null : (match[0] || "")[0]);
                            let noPrefix = !result ? (text || this.caption || this.contentText || this.selectedDisplayText || '') : (text || this.caption || this.contentText || this.selectedDisplayText || '').replace(result, "");
                            let args_v2 = noPrefix.trim().split(/ +/);
                            let [command, ...args] = noPrefix.trim().split(" ").filter(v => v);
                            return {
                                command,
                                args,
                                args_v2,
                                noPrefix,
                                match
                            };
                        },
                        enumerable: true
                    },
                    device: {
                        get() {
                            const device = getDevice(this.vM.key?.id);
                            const platform = os.platform();
                            const isUnknownDevice = device === 'unknown' && platform;
                            const res = device ? (isUnknownDevice ? (platform === 'android' ? 'Android' : ['win32', 'darwin', 'linux'].includes(platform) ? 'Desktop' : 'Unknown') : device) : 'Unknown Device';

                            return res;

                        },
                        enumerable: true
                    },
                    isBot: {
                        get() {
                            const idBot = this.vM.key?.id;
                            return ["3EB0"].some(k => idBot.includes(k) && this.sender !== this.conn?.user.jid);
                        },
                        enumerable: true
                    }
                })
            },
            enumerable: true
        },
        _text: {
            value: null,
            writable: true,
        },
        text: {
            get() {
                const msg = this.msg
                const text = (typeof msg === 'string' ? msg : msg?.text) || msg?.caption || msg?.contentText || ''
                return typeof this._text === 'string' ? this._text : '' || (typeof text === 'string' ? text : (
                    text?.selectedDisplayText ||
                    text?.hydratedTemplate?.hydratedContentText ||
                    text
                )) || ''
            },
            set(str) {
                return this._text = str
            },
            enumerable: true
        },
        mentionedJid: {
            get() {
                return this.msg?.contextInfo?.mentionedJid?.length && this.msg.contextInfo.mentionedJid || []
            },
            enumerable: true
        },
        name: {
            get() {
                return !nullish(this.pushName) && this.pushName || this.conn?.getName(this.sender)
            },
            enumerable: true
        },
        download: {
            value(saveToFile = false) {
                const mtype = this.mediaType
                return this.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
            },
            enumerable: true,
            configurable: true
        },
        reply: {
            /**
             * Reply to message - SIMPLIFIED without externalAdReply
             * @param {String} text
             * @param {String} chatId
             * @param {Object} options
             */
            value(text, chatId, options) {
                const conn = this.conn
                const m = this
                const jidChat = chatId ? chatId : m.chat

                return conn.sendMessage(jidChat, {
                    text: text,
                    ...options
                }, { 
                    quoted: m,
                    ephemeralExpiration: options?.ephemeralExpiration
                })
            }
        },
        copy: {
            value() {
                const M = proto.WebMessageInfo
                return smsg(this.conn, M.create(M.toObject(this)))
            },
            enumerable: true
        },
        forward: {
            value(jid, force = false, options = {}) {
                return this.conn?.sendMessage(jid, {
                    forward: this,
                    force,
                    ...options
                }, {
                    ...options
                })
            },
            enumerable: true
        },
        copyNForward: {
            value(jid, forceForward = false, options = {}) {
                return this.conn?.copyNForward(jid, this, forceForward, options)
            },
            enumerable: true
        },
        cMod: {
            value(jid, text = '', sender = this.sender, options = {}) {
                return this.conn?.cMod(jid, this, text, sender, options)
            },
            enumerable: true
        },
        getQuotedObj: {
            value() {
                if (!this.quoted.id) return null
                const q = proto.WebMessageInfo.create(this.conn?.loadMessage(this.quoted.id) || this.quoted.vM)
                return smsg(this.conn, q)
            },
            enumerable: true
        },
        getQuotedMessage: {
            get() {
                return this.getQuotedObj
            }
        },
        delete: {
            value() {
                return this.conn?.sendMessage(this.chat, {
                    delete: this.key
                })
            },
            enumerable: true
        },
        react: {
            value(text) {
                return this.conn?.sendMessage(this.chat, {
                    react: {
                        text,
                        key: this.key
                    }
                })
            },
            enumerable: true
        },
        device: {
            get() {
                const device = getDevice(this.key?.id);
                const platform = os.platform();
                const isUnknownDevice = device === 'unknown' && platform;
                const res = device ? (isUnknownDevice ? (platform === 'android' ? 'Android Device' : ['win32', 'darwin', 'linux'].includes(platform) ? 'Desktop' : 'Unknown Device') : device) : 'Unknown Device';

                return res;

            },
            enumerable: true
        },
        isBot: {
            get() {
                const idBot = this.key?.id;
                return ["3EB0"].some(k => idBot.includes(k) && this.sender !== this.conn?.user.jid);
            },
            enumerable: true
        }
    })
}

export function logic(check, inp, out) {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length')
    for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i]
    return null
}

export function protoType() {
    Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
        const ab = new ArrayBuffer(this.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < this.length; ++i) {
            view[i] = this[i];
        }
        return ab;
    }
    /**
     * @returns {ArrayBuffer}
     */
    Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
        return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength)
    }
    /**
     * @returns {Buffer}
     */
    ArrayBuffer.prototype.toBuffer = function toBuffer() {
        return Buffer.from(new Uint8Array(this))
    }
    Uint8Array.prototype.getFileType = ArrayBuffer.prototype.getFileType = Buffer.prototype.getFileType = async function getFileType() {
        return await fileTypeFromBuffer(this)
    }
    /**
     * @returns {Boolean}
     */
    String.prototype.isNumber = Number.prototype.isNumber = isNumber
    /**
     * 
     * @returns {String}
     */
    String.prototype.capitalize = function capitalize() {
        return this.charAt(0).toUpperCase() + this.slice(1, this.length)
    }
    /**
     * @returns {String}
     */
    String.prototype.capitalizeV2 = function capitalizeV2() {
        const str = this.split(' ')
        return str.map(v => v.capitalize()).join(' ')
    }
    String.prototype.decodeJid = function decodeJid() {
        if (/:\d+@/gi.test(this)) {
            const decode = jidDecode(this) || {}
            return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim()
        } else return this.trim()
    }
    /**
     * number must be milliseconds
     * @returns {string}
     */
    Number.prototype.toTimeString = function toTimeString() {
        
        const seconds = Math.floor((this / 1000) % 60)
        const minutes = Math.floor((this / (60 * 1000)) % 60)
        const hours = Math.floor((this / (60 * 60 * 1000)) % 24)
        const days = Math.floor((this / (24 * 60 * 60 * 1000)))
        return (
            (days ? `${days} day(s) ` : '') +
            (hours ? `${hours} hour(s) ` : '') +
            (minutes ? `${minutes} minute(s) ` : '') +
            (seconds ? `${seconds} second(s)` : '')
        ).trim()
    }
    Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom
}
function isNumber() {
    const int = parseInt(this)
    return typeof int === 'number' && !isNaN(int)
}

function getRandom() {
    if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)]
    return Math.floor(Math.random() * this)
}


/**
 * ??
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
 * @returns {boolean}
 */
function nullish(args) {
    return !(args !== null && args !== undefined)
}