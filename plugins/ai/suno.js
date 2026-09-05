import axios from 'axios';
import convert from "@library/toAll.js";

let isSunoProcessing = false;

async function createSunoTask(prompt, title, style, instrument, API_KEY) {
    const url = `${global.web}/api/ai/suno?apikey=${API_KEY}&prompt=${encodeURIComponent(prompt)}&title=${encodeURIComponent(title || 'Suno Song')}&style=${encodeURIComponent(style || 'Pop')}&instrument=${encodeURIComponent(instrument ? 'true' : 'false')}`;
    const response = await axios.get(url, { timeout: 60000 });
    
    const resData = response.data;
    if (!resData?.status || (!resData?.result?.task_id && !resData?.result?.audios)) {
        throw new Error(resData?.error || resData?.detail || "Gagal membuat antrean lagu Suno AI di JereAPI");
    }
    
    // Jika langsung selesai
    if (resData.result?.status_ai === 'SUCCESS' && resData.result?.audios?.length > 0) {
        return { instantAudios: resData.result.audios };
    }
    
    return { taskId: resData.result.task_id };
}

async function checkSunoStatus(taskId, API_KEY, retryCount = 0) {
    const maxRetries = 3;
    
    try {
        const url = `${global.web}/api/ai/suno?apikey=${API_KEY}&task_id=${encodeURIComponent(taskId)}`;
        const response = await axios.get(url, { timeout: 30000 });
        const data = response.data;
        
        if (!data?.status || !data?.result) {
            throw new Error(data?.error || data?.detail || "Gagal mendapatkan status dari JereAPI");
        }
        
        const isCompleted = data.result.status_ai === 'SUCCESS';
        const audios = data.result.audios || [];
        
        return {
            status: isCompleted ? 'completed' : 'pending',
            audios: audios
        };
    } catch (error) {
        if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            return checkSunoStatus(taskId, API_KEY, retryCount + 1);
        }
        throw error;
    }
}

async function waitForSunoResult(taskId, API_KEY) {
    // Tunggu 45 detik awal render lagu Suno AI agar tidak spam endpoint
    await new Promise(resolve => setTimeout(resolve, 45000)); 
    
    const maxChecks = 15;
    const interval = 10000;
    
    for (let i = 0; i < maxChecks; i++) {
        const result = await checkSunoStatus(taskId, API_KEY);
        
        if (result.status === 'completed' && result.audios.length > 0) {
            const hasAudio = result.audios.some(a => a.audio_url);
            if (hasAudio) {
                return result.audios;
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('Waktu tunggu habis (lebih dari 3.5 menit). Silakan coba beberapa saat lagi.');
}

async function toWhatsAppVoice(inputBuffer) {
    const audioBuffer = await convert.toVN(inputBuffer);
    const waveform = await convert.generateWaveform(audioBuffer);
    return { audio: audioBuffer, waveform };
}

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isPrems }) => {
    const API_KEY = global.apikey?.jereapi;
    if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
        return m.reply("❌ API Key JereAPI belum dikonfigurasi di config.js!");
    }

    if (isSunoProcessing) {
        return m.reply("⏳ Ada permintaan Suno yang sedang diproses. Mohon tunggu giliran...");
    }

    if (!text) {
        return m.reply(
`🎵 *Suno AI Music Generator*

📌 *Cara Penggunaan:*
${usedPrefix + command} <deskripsi lagu>

📝 *Contoh:*
${usedPrefix + command} lagu pop ceria tentang kopi pagi
${usedPrefix + command} lagu rock sedih tentang patah hati
${usedPrefix + command} lagu akustik santai buat belajar

⚙️ *Format Lanjutan:*
${usedPrefix + command} prompt | judul | genre | instrumen(true/false)

📝 *Contoh Lanjutan:*
${usedPrefix + command} coffee in the morning | Morning Coffee | Acoustic Pop | false`
        );
    }

    let prompt = text.trim();
    let title = 'Suno Song';
    let style = 'Pop';
    let instrument = false;

    if (text.includes('|')) {
        const parts = text.split('|').map(p => p.trim());
        prompt = parts[0] || prompt;
        title = parts[1] || title;
        style = parts[2] || style;
        instrument = parts[3] === 'true' || parts[3] === '1';
    }

    isSunoProcessing = true;

    try {
        await m.react('⏳');
        await m.reply(
`🎵 *Membuat Musik dengan Suno AI...*

📝 *Prompt:* ${prompt}
🏷️ *Judul:* ${title}
🎸 *Genre:* ${style}
🎻 *Instrumen:* ${instrument ? 'Ya' : 'Tidak'}

⏳ *Estimasi waktu:* 2-4 menit
_Bot akan mengirim lagu otomatis jika sudah selesai..._`
        );

        const taskResult = await createSunoTask(prompt, title, style, instrument, API_KEY);
        let audios = taskResult.instantAudios;
        if (!audios && taskResult.taskId) {
            console.log(`[SUNO] Task created: ${taskResult.taskId}`);
            audios = await waitForSunoResult(taskResult.taskId, API_KEY);
            console.log(`[SUNO] Task ${taskResult.taskId} completed with ${audios.length} audio(s)`);
        }

        for (let i = 0; i < audios.length; i++) {
            const audio = audios[i];
            
            if (!audio.audio_url) continue;

            const response = await axios.get(audio.audio_url, {
                responseType: 'arraybuffer',
                timeout: 60000
            });
            const audioBuffer = Buffer.from(response.data);

            let durationFormatted = '2:00';
            if (audio.duration && Number(audio.duration) > 0) {
                const durationSec = Math.round(Number(audio.duration));
                const minutes = Math.floor(durationSec / 60);
                const seconds = durationSec % 60;
                durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }

            const finalTitle = title && title !== 'Suno Song' 
                ? (audio.title && audio.title !== title ? `${title} (${audio.title})` : title)
                : (audio.title || 'Suno Song');

            const caption = 
`🎵 *Suno AI Music #${i + 1}*

📌 *Judul:* ${finalTitle}
🏷️ *Tags:* ${audio.tags || style}
⏱️ *Durasi:* ${durationFormatted}
🤖 *Model:* ${audio.model_name || 'v3.5'}

✨ Request by: ${m.pushName || 'User'}`;

            let coverBuffer = null;
            if (audio.cover_url || audio.image_large_url) {
                try {
                    const coverUrl = audio.image_large_url || audio.cover_url;
                    const coverResponse = await axios.get(coverUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000
                    });
                    coverBuffer = Buffer.from(coverResponse.data);
                } catch (e) {
                    console.log('[SUNO] Gagal download cover:', e.message);
                }
            }

            if (coverBuffer) {
                await conn.sendMessage(m.chat, {
                    image: coverBuffer,
                    caption: caption
                }, { quoted: m });
            }

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${(audio.title || title).replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
                ptt: false}, { quoted: m });

            try {
                const { audio: pttBuffer, waveform } = await toWhatsAppVoice(audioBuffer);
                await conn.sendMessage(m.chat, {
                    audio: pttBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    waveform: waveform
                }, { quoted: m });
            } catch (e) {
                console.log('[SUNO] Gagal kirim VN version:', e.message);
            }
        }

        await m.react('✅');

    } catch (error) {
        console.error('[SUNO] Error:', error);
        await m.react('❌');
        
        let errorMsg = '❌ *Gagal membuat lagu!*\n\n';
        if (error.message.includes('Timeout')) {
            errorMsg += '⏰ Waktu tunggu habis. Server Suno sedang sibuk, silakan coba lagi nanti.';
        } else if (error.response?.data?.error) {
            errorMsg += `Server: ${error.response.data.error}`;
        } else {
            errorMsg += error.message || 'Terjadi kesalahan sistem.';
        }
        
        m.reply(errorMsg);
    } finally {
        isSunoProcessing = false;
    }
};

handler.help = ['suno <deskripsi lagu>'];
handler.tags = ['ai', 'music'];
handler.premium = true;
handler.command = /^(suno|sunomusic|buatsong|ai-music)$/i;

handler.limit = 5;
export default handler;
