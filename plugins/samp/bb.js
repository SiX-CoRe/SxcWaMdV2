/*
* Gw LumnzTyz Ngasih Credits Thanks Faa
***/
import axios from 'axios';
import FormData from 'form-data';
import { load } from 'cheerio';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import yts from 'yt-search';

const API_URL = 'https://api-faa.my.id/faa/ytmp3';

// ==================== API YouTube (Faa) ====================
async function downloadYouTubeAudio(url) {
    try {
        console.log(`Processing YouTube URL: ${url}`);
        
        let normalizedUrl = url;
        if (url.includes('youtu.be')) {
            const videoId = url.split('/').pop().split('?')[0];
            normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
        }
        
        const apiUrl = `${API_URL}?url=${encodeURIComponent(normalizedUrl)}`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        });
        
        if (!response.data?.status || !response.data?.result?.mp3) {
            throw new Error(response.data?.message || 'Gagal mendapatkan audio dari API');
        }
        
        const data = response.data.result;
        const downloadUrl = data.mp3;
        
        console.log('Downloading audio from:', downloadUrl);
        
        const audioResponse = await axios.get(downloadUrl, {
            responseType: "arraybuffer",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://api-faa.my.id"
            },
            timeout: 60000
        });
        
        const audioBuffer = Buffer.from(audioResponse.data);
        
        const title = data.title || 'Unknown Title';
        const filename = title.replace(/[^\w\s]/gi, '') + '.mp3';
        const thumbnail = data.thumbnail || '';
        const duration = data.duration || '-';
        
        return {
            success: true,
            title: title,
            thumbnail: thumbnail,
            duration: duration,
            channel: '-',
            views: '-',
            publish: '-',
            videoId: url.split('v=')[1]?.split('&')[0] || '',
            audioBuffer: audioBuffer,
            filename: filename,
            quality: '128kbps',
            size: (audioBuffer.length / 1024 / 1024).toFixed(2) + " MB",
            url: downloadUrl,
            type: 'audio'
        };
        
    } catch (error) {
        console.error('[YouTube API Error]:', error.message);
        throw new Error('Gagal mendapatkan audio YouTube: ' + error.message);
    }
}

// Fungsi uploadTop4Top
async function uploadTop4Top(buffer, filename) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new TypeError('Invalid buffer: must be a non-empty Buffer');
    }

    if (buffer.length > 100 * 1024 * 1024) {
        throw new RangeError('File too large: maximum size is 100MB');
    }

    const form = new FormData();
    form.append('file_0_', buffer, { filename: filename });
    form.append('submitr', '[ رفع الملفات ]');

    const { data } = await axios.post('https://top4top.io/index.php', form, {
        headers: {
            ...form.getHeaders(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://top4top.io/',
            'Origin': 'https://top4top.io',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        },
        maxBodyLength: Infinity
    });

    const url = load(data)('input.all_boxes').attr('value');
    if (!url || !/^https:\/\/\w+\.top4top\.io\/.+$/.test(url)) {
        throw new Error('Upload failed: unable to retrieve download link from Top4Top');
    }

    const httpUrl = url.replace(/^https:/, 'http:');
    return httpUrl;
}

// ==================== API Spotify (Cuki) ====================
async function getSpotifyData(spotifyUrl) {
    try {
        const encodedUrl = encodeURIComponent(spotifyUrl);
        const apiUrl = `https://api.cuki.biz.id/api/downloader/aio?apikey=cuki-x&url=${encodedUrl}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        const data = response.data;
        
        if (!data.success || !data.data) {
            throw new Error(data.message || 'API Spotify gagal');
        }

        const result = data.data;
        
        let downloadUrl = null;
        if (result.medias && result.medias.length > 0) {
            downloadUrl = result.medias[0].url;
        }
        
        if (!downloadUrl) {
            throw new Error('Tidak menemukan link download audio Spotify');
        }

        return {
            success: true,
            data: {
                metadata: {
                    name: result.title,
                    artist: result.author || '-',
                    duration: result.duration || '-',
                    image: result.thumbnail,
                    download: downloadUrl
                }
            }
        };
    } catch (err) {
        console.error("Gagal mengambil data Spotify:");
        console.error(err.response?.data || err.message);
        return null;
    }
}

// ==================== API TikTok Music (Cuki) ====================
async function getTikTokData(tiktokUrl) {
    try {
        const encodedUrl = encodeURIComponent(tiktokUrl);
        const apiUrl = `https://api.cuki.biz.id/api/downloader/tiktok-music?apikey=cuki-x&url=${encodedUrl}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        const data = response.data;
        
        if (!data.success || !data.results) {
            throw new Error(data.message || 'API TikTok gagal');
        }

        const result = data.results;

        return {
            status: true,
            result: {
                title: result.title || "tiktok_audio",
                author: result.author || '-',
                cover: result.cover,
                duration: result.duration || '-',
                url: result.url
            }
        };
    } catch (err) {
        console.error("Gagal mengambil data TikTok:");
        console.error(err.response?.data || err.message);
        return null;
    }
}

// Fungsi untuk download media dari WA
async function downloadWAMedia(quoted, conn) {
    try {
        const media = await conn.downloadMediaMessage(quoted);
        if (!media) throw new Error('Gagal download media');
        return media;
    } catch (err) {
        console.error('Error download WA media:', err);
        throw new Error('Gagal mengunduh audio/voice note');
    }
}

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command,
    args,
    isCreator
}) => {
    const allowedGroups = [
        '123456789101112@g.us'
    ];
    const waChannel = '120363409912187282@newsletter';

    await conn.sendMessage(m.chat, {
        react: {
            text: '🔥',
            key: m.key
        }
    });

    if (!isCreator) {
        if (!m.isGroup) return m.reply('Fitur ini hanya untuk grup.');
        if (!allowedGroups.includes(m.chat)) {
            return m.reply(
                'Grup ini tidak diizinkan pakai fitur ini.\n' +
                'Silahkan join group ini:\n' +
                'https://whatsapp.com/channel/0029Vb7XYjLKgsNyWrRHL10k'
            );
        }
    }

    const quoted = m.quoted || m;
    const mime = quoted?.msg?.mimetype || quoted?.mimetype || '';
    const isAudio = /audio/.test(mime);
    const isVoice = /voice/.test(mime);
    const isPTT = quoted?.msg?.ptt === true;

    if (isAudio || isVoice || isPTT) {
        try {
            global.bbProcessing = global.bbProcessing || false;
            if (global.bbProcessing) {
                return m.reply('Fitur sedang dipakai user lain. Tunggu proses sebelumnya selesai!');
            }
            global.bbProcessing = true;

            await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            const audioBuffer = await downloadWAMedia(quoted, conn);
            
            const timestamp = Date.now();
            const filename = `wa_audio_${timestamp}.mp3`;

            await conn.sendMessage(m.chat, { react: { text: '📤', key: m.key } });

            const urlTop4Top = await uploadTop4Top(audioBuffer, filename);

            const caption = 
                `Audio/Note Suara WhatsApp\n\n` +
                `Nama File: ${filename}\n` +
                `Ukuran: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB\n` +
                `\nLink Top4top: ${urlTop4Top}`;

            const defaultThumb = "https://telegra.ph/file/5d9e5d6b0d8a8c5e5e5e5.jpg";

            await conn.sendMessage(
                m.chat,
                { 
                    image: { url: defaultThumb }, 
                    caption: caption 
                },
                { quoted: m }
            );

            try {
                await conn.sendMessage(
                    waChannel, 
                    { 
                        image: { url: defaultThumb }, 
                        caption: caption 
                    }
                );
            } catch (channelError) {
                console.error("Error kirim ke channel:", channelError);
            }

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error('Error processing WA audio:', err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply('Gagal memproses audio/voice note. Pastikan file tidak terlalu besar.');
        } finally {
            global.bbProcessing = false;
        }
        return;
    }

    if (!text) {
        return m.reply('Kirim command .bb dengan:\n' +
                       'Link YouTube/Spotify/TikTok\n' +
                       'Judul lagu (cari di YouTube)\n' +
                       'Reply audio/voice note WA');
    }

    const isLink = /(https?:\/\/[^\s]+)/.test(text);

    if (!isLink) {
        try {
            const searchResult = await yts(text);

            if (!searchResult?.videos?.length) {
                return m.reply('Tidak ditemukan hasil pencarian.');
            }

            const videos = searchResult.videos.slice(0, 10);
            const messageText = `Pilih Lagu Nya Total Nya: (${videos.length}).`;

            const sections = [{
                title: "Pilih Lagu YouTube Di Sini!",
                highlight_label: `Total ${videos.length} Search YouTube Nya`,
                rows: videos.map((v, i) => ({
                    title: `${v.title.substring(0, 50)}`,
                    description: `Duration: ${v.timestamp} | Views: ${v.views.toLocaleString()} views`,
                    id: `${usedPrefix + command} ${v.url}`,
                })),
            }];

            await conn.sendButton(m.chat, {
                text: messageText,
                footer: "Cari Lagu Di YouTube",
                buttons: [{
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                        title: "Pilih Lagu YouTube Di Sini!",
                        sections,
                    }),
                }],
            }, {
                quoted: m
            });

            return;

        } catch (err) {
            console.error("Search Error:", err);
            return m.reply("Gagal melakukan pencarian.");
        }
    }

    try {
        global.bbProcessing = global.bbProcessing || false;
        if (global.bbProcessing) {
            return m.reply('Fitur sedang dipakai user lain. Tunggu proses sebelumnya selesai!');
        }
        global.bbProcessing = true;

        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        let url = text.trim();
        let title, thumbnail, duration = '-', author = '-', quality = '128k', filename;
        let urlTop4Top;
        let success = false;

        if (/tiktok\.com/.test(url)) {
            const tiktokData = await getTikTokData(url);
            if (!tiktokData?.status || !tiktokData?.result?.url) throw new Error("ERR-TT01");

            const result = tiktokData.result;
            title = result.title || "tiktok_audio";
            author = result.author || '-';
            thumbnail = result.cover || "https://telegra.ph/file/5d9e5d6b0d8a8c5e5e5e5.jpg";
            duration = result.duration || '-';

            const buffer = await (await fetch(result.url)).arrayBuffer();
            filename = title.replace(/[^\w\s]/gi, '') + '.mp3';
            urlTop4Top = await uploadTop4Top(Buffer.from(buffer), filename);
            success = true;

        } else if (/spotify\.com/.test(url)) {
            const spotifyData = await getSpotifyData(url);
            if (!spotifyData?.success || !spotifyData?.data?.metadata?.download) throw new Error("ERR-SPOTIFY");

            const metadata = spotifyData.data.metadata;
            title = `${metadata.name} - ${metadata.artist}`;
            thumbnail = metadata.image || "https://telegra.ph/file/5d9e5d6b0d8a8c5e5e5e5.jpg";
            duration = metadata.duration || '-';
            author = metadata.artist || '-';

            const buffer = await (await fetch(metadata.download)).arrayBuffer();
            filename = title.replace(/[^\w\s]/gi, '') + '.mp3';
            urlTop4Top = await uploadTop4Top(Buffer.from(buffer), filename);
            success = true;

        } else if (/youtu\.be|youtube\.com/.test(url)) {
            await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

            try {
                const ytData = await downloadYouTubeAudio(url);
                
                title = ytData.title;
                thumbnail = ytData.thumbnail;
                duration = ytData.duration;
                author = ytData.channel || ytData.author;
                quality = ytData.quality;
                filename = ytData.filename;

                await conn.sendMessage(m.chat, { react: { text: '📤', key: m.key } });

                urlTop4Top = await uploadTop4Top(ytData.audioBuffer, filename);
                success = true;
                
            } catch (ytError) {
                console.error('YouTube API Error:', ytError);
                throw new Error("ERR-YT01");
            }

        } else {
            return m.reply('Link tidak didukung. Hanya mendukung YouTube, TikTok, Spotify.');
        }

        if (!success || !urlTop4Top) {
            throw new Error("Gagal mendapatkan link download");
        }

        let caption =
            `Judul: ${title}\n` +
            `${author !== '-' ? `Channel/Artist: ${author}\n` : ''}` +
            `${duration !== '-' ? `Duration: ${duration}\n` : ''}` +
            `${quality !== '-' ? `Quality: ${quality}\n` : ''}` +
            `\nLink Top4top: ${urlTop4Top}`;

        await conn.sendMessage(
            m.chat,
            { 
                image: { url: thumbnail }, 
                caption: caption 
            },
            { quoted: m }
        );

        try {
            await conn.sendMessage(
                waChannel, 
                { 
                    image: { url: thumbnail }, 
                    caption: caption 
                }
            );
        } catch (channelError) {
            console.error("Error kirim ke channel:", channelError);
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('Error BB:', err);
        
        let errorMessage = "Terjadi kesalahan saat memproses. Silakan coba lagi beberapa saat.";
        
        if (err.message.includes("ERR-TT01")) {
            errorMessage = "Gagal mendapatkan audio TikTok. Link mungkin tidak valid.";
        } else if (err.message.includes("ERR-SPOTIFY")) {
            errorMessage = "Gagal mendapatkan data Spotify. Link mungkin tidak valid atau API sedang error.";
        } else if (err.message.includes("ERR-YT01")) {
            errorMessage = "Gagal mendapatkan audio YouTube. Link mungkin tidak valid.";
        }
        
        m.reply(errorMessage);
    } finally {
        global.bbProcessing = false;
    }
};

handler.help = ['bb [link/query]'];
handler.tags = ['downloader'];
handler.command = ['bb'];
handler.limit = true;

export default handler;