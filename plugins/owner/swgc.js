import * as baileys from "@adiwajshing/baileys";
import crypto from "node:crypto";
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

async function splitVideoIntoSegments(videoBuffer, durationInSeconds, m, conn) {
    const segments = [];
    const maxSegmentDuration = 60;
    
    const totalSegments = Math.ceil(durationInSeconds / maxSegmentDuration);
    
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const inputPath = path.join(tempDir, `video_input_${Date.now()}.mp4`);
    fs.writeFileSync(inputPath, videoBuffer);
    
    
    for (let i = 0; i < totalSegments; i++) {
        await conn.sendMessage(m.chat, { react: { text: "✂️", key: m.key } });
        
        const startTime = i * maxSegmentDuration;
        const remainingDuration = durationInSeconds - startTime;
        const segmentDuration = Math.min(maxSegmentDuration, remainingDuration);
        
        const outputPath = path.join(tempDir, `video_segment_${Date.now()}_${i + 1}.mp4`);
        
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .setStartTime(startTime)
                .setDuration(segmentDuration)
                .output(outputPath)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .run();
        });
        
        const segmentBuffer = fs.readFileSync(outputPath);
        segments.push({
            buffer: segmentBuffer,
            index: i + 1,
            total: totalSegments,
            startTime: startTime,
            duration: segmentDuration
        });
        
        fs.unlinkSync(outputPath);
    }
    
    fs.unlinkSync(inputPath);
    return segments;
}

async function groupStatus(conn, jid, content) {
    const { backgroundColor } = content;
    delete content.backgroundColor;

    const inside = await baileys.generateWAMessageContent(content, {
        upload: conn.waUploadToServer,
        backgroundColor
    });

    const messageSecret = crypto.randomBytes(32);
    const m = baileys.generateWAMessageFromContent(jid, {
        messageContextInfo: { messageSecret },
        groupStatusMessageV2: {
            message: {
                ...inside,
                messageContextInfo: { messageSecret }
            }
        }
    }, {});

    await conn.relayMessage(jid, m.message, { messageId: m.key.id });
    return m;
}

async function toVN(inputBuffer) {
    return new Promise((resolve, reject) => {
        const inStream = new PassThrough();
        const outStream = new PassThrough();
        const chunks = [];

        inStream.end(inputBuffer);

        ffmpeg(inStream)
            .noVideo()
            .audioCodec('libopus')
            .format('ogg')
            .audioBitrate('48k')
            .audioChannels(1)
            .audioFrequency(48000)
            .outputOptions([
                '-map_metadata', '-1',
                '-application', 'voip',
                '-compression_level', '10',
                '-page_duration', '20000'
            ])
            .on('error', reject)
            .on('end', () => resolve(Buffer.concat(chunks)))
            .pipe(outStream, { end: true });

        outStream.on('data', c => chunks.push(c));
    });
}

async function generateWaveform(inputBuffer, bars = 64) {
    return new Promise((resolve, reject) => {
        const inputStream = new PassThrough();
        inputStream.end(inputBuffer);

        const chunks = [];

        ffmpeg(inputStream)
            .audioChannels(1)
            .audioFrequency(16000)
            .format("s16le")
            .on("error", reject)
            .on("end", () => {
                const rawData = Buffer.concat(chunks);
                const samples = rawData.length / 2;

                const amplitudes = [];
                for (let i = 0; i < samples; i++) {
                    let val = rawData.readInt16LE(i * 2);
                    amplitudes.push(Math.abs(val) / 32768);
                }

                let blockSize = Math.floor(amplitudes.length / bars);
                let avg = [];
                for (let i = 0; i < bars; i++) {
                    let block = amplitudes.slice(i * blockSize, (i + 1) * blockSize);
                    avg.push(block.reduce((a, b) => a + b, 0) / block.length);
                }

                let max = Math.max(...avg);
                let normalized = avg.map(v => Math.floor((v / max) * 100));

                let buf = Buffer.from(new Uint8Array(normalized));
                resolve(buf.toString("base64"));
            })
            .pipe()
            .on("data", chunk => chunks.push(chunk));
    });
}

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner }) => {
    if (command === 'swgc' || command === 'upswgc') {
        try {
            if (!isAdmin && !isOwner) {
                return m.reply('Akses ditolak! Fitur ini hanya untuk admin grup dan owner bot.');
            }

            let args = (text || '').split('|').map(v => v.trim()).filter(v => v);
            let caption = '';
            let warna = '';
            let targetGroup = m.chat;

            for (let v of args) {
                if (/chat\.whatsapp\.com\//.test(v)) {
                    try {
                        const inviteCode = v.split('/').pop().split('?')[0];
                        const inviteInfo = await conn.groupGetInviteInfo(inviteCode);
                        targetGroup = inviteInfo.id;
                    } catch {
                        return m.reply('Link grup tidak valid / bot belum join');
                    }
                } else if (!caption) {
                    caption = v;
                } else if (!warna) {
                    warna = v;
                }
            }

            const quoted = m.quoted || m;
            const mime = quoted?.mimetype || quoted?.msg?.mimetype || '';

            const warnaMap = {
                'biru': '#34B7F1', 'hijau': '#25D366', 'kuning': '#FFD700',
                'jingga': '#FF8C00', 'merah': '#FF3B30', 'ungu': '#9C27B0',
                'abu': '#9E9E9E', 'hitam': '#000000', 'putih': '#FFFFFF', 'cyan': '#00BCD4'
            };

            if (/image/.test(mime)) {
                const buffer = await quoted.download().catch(() => null);
                if (!buffer) return m.reply('Gagal ambil gambar!');
                await groupStatus(conn, targetGroup, { image: buffer, caption: caption || '' });
                await m.react('✅');
                return m.reply(`Story berhasil diupload ke grup!`);

            } else if (/video/.test(mime)) {
                const duration = quoted.duration || quoted.seconds || 0;
                const buffer = await quoted.download().catch(() => null);
                if (!buffer) return m.reply('Gagal ambil video!');
                
                if (duration <= 60) {
                    await groupStatus(conn, targetGroup, { video: buffer, caption: caption || '' });
                    await m.react('✅');
                    return m.reply(`Story berhasil diupload ke grup!`);
                }
                
                await m.react('✂️');
                await m.reply(`Video ${Math.floor(duration / 60)} menit ${duration % 60} detik, akan dipotong per 60 detik...`);
                
                const segments = await splitVideoIntoSegments(buffer, duration, m, conn);
                
                let uploadedCount = 0;
                for (const seg of segments) {
                    await groupStatus(conn, targetGroup, { video: seg.buffer, caption: '' });
                    uploadedCount++;
                    await new Promise(r => setTimeout(r, 1000));
                }
                
                await m.react('✅');
                return m.reply(`Story berhasil diupload ke grup! (${segments.length} bagian)`);

            } else if (/audio/.test(mime)) {
                const buffer = await quoted.download().catch(() => null);
                if (!buffer) return m.reply('Gagal ambil audio!');
                const audioVn = await toVN(buffer);
                const audioWaveform = await generateWaveform(buffer);
                await groupStatus(conn, targetGroup, {
                    audio: audioVn,
                    waveform: audioWaveform,
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true
                });
                await m.react('✅');
                return m.reply(`Story berhasil diupload ke grup!`);

            } else if (warna) {
                if (!caption) return m.reply('Masukkan teks untuk story!');
                let color = warnaMap[warna.toLowerCase()];
                if (!color) return m.reply(`Warna tidak dikenal!\n\nTersedia: ${Object.keys(warnaMap).join(', ')}`);
                await groupStatus(conn, targetGroup, { text: caption, backgroundColor: color });
                await m.react('✅');
                return m.reply(`Story berhasil diupload ke grup!`);

            } else if (caption) {
                await groupStatus(conn, targetGroup, { text: caption, backgroundColor: '#25D366' });
                await m.react('✅');
                return m.reply(`Story berhasil diupload ke grup!`);
            }

            return m.reply(
                `SWGC - GROUP STORY\n\n` +
                `Kirim ke grup ini:\n` +
                `${usedPrefix + command} (reply gambar/video/audio)\n` +
                `${usedPrefix + command} Teks story\n` +
                `${usedPrefix + command} Teks|merah (custom warna)\n\n` +
                `Ke grup lain (pakai link):\n` +
                `${usedPrefix + command} https://chat.whatsapp.com/xxx\n\n` +
                `Fitur ini hanya untuk ADMIN GRUP & OWNER BOT\n` +
                `Video akan dipotong per 60 detik jika lebih dari 1 menit`
            );
        } catch (e) {
            console.error(e);
            await m.react('❌');
            m.reply(`Error: ${e.message}`);
        }
    } else {
        try {
            if (!isOwner) {
                return m.reply('Akses ditolak! Fitur broadcast hanya untuk owner.');
            }

            let args = (text || '').split('|').map(v => v.trim()).filter(v => v);
            let caption = '';
            let warna = '';

            for (let v of args) {
                if (!caption) caption = v;
                else if (!warna) warna = v;
            }

            const quoted = m.quoted || m;
            const mime = quoted?.mimetype || quoted?.msg?.mimetype || '';
            let rawContent = {};
            let videoSegments = null;
            let duration = 0;

            const warnaMap = {
                'biru': '#34B7F1', 'hijau': '#25D366', 'kuning': '#FFD700',
                'jingga': '#FF8C00', 'merah': '#FF3B30', 'ungu': '#9C27B0',
                'abu': '#9E9E9E', 'hitam': '#000000', 'putih': '#FFFFFF', 'cyan': '#00BCD4'
            };

            if (/image/.test(mime)) {
                const buffer = await quoted.download().catch(() => null);
                if (!buffer) return m.reply('Gagal ambil gambar!');
                rawContent = { image: buffer, caption: caption || '' };
                await m.react('🖼️');
            } else if (/video/.test(mime)) {
                duration = quoted.duration || quoted.seconds || 0;
                const buffer = await quoted.download().catch(() => null);
                if (!buffer) return m.reply('Gagal ambil video!');
                
                rawContent = { video: buffer, caption: '' };
                await m.react('🎬');
                
                if (duration > 60) {
                    await m.react('✂️');
                    await m.reply(`Video ${Math.floor(duration / 60)} menit ${duration % 60} detik, akan dipotong per 60 detik...`);
                    videoSegments = await splitVideoIntoSegments(buffer, duration, m, conn);
                    await m.reply(`Video akan dibroadcast dalam ${videoSegments.length} bagian`);
                }
            } else if (/audio/.test(mime)) {
                const buffer = await quoted.download().catch(() => null);
                if (!buffer) return m.reply('Gagal ambil audio!');
                const audioVn = await toVN(buffer);
                const audioWaveform = await generateWaveform(buffer);
                rawContent = {
                    audio: audioVn,
                    waveform: audioWaveform,
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true
                };
                await m.react('🎵');
            } else if (caption) {
                let color = warnaMap[warna.toLowerCase()] || '#25D366';
                rawContent = { text: caption, backgroundColor: color };
                await m.react('📝');
            } else {
                return m.reply(
                    `BROADCAST SWGC\n\n` +
                    `Kirim ke SEMUA grup sekaligus.\n\n` +
                    `Contoh teks:\n${usedPrefix + command} Pengumuman penting!\n\n` +
                    `Reply media:\nReply gambar/video/audio + ${usedPrefix + command}\n\n` +
                    `Video otomatis dipotong per 60 detik jika lebih dari 1 menit`
                );
            }

            const groups = await conn.groupFetchAllParticipating();
            const groupList = Object.entries(groups);

            if (groupList.length === 0) {
                return m.reply(`Bot tidak berada di grup manapun.`);
            }

            let success = 0;
            let failed = 0;
            const failedGroups = [];
            const total = groupList.length;
            const delay = (ms) => new Promise(r => setTimeout(r, ms));
            let totalSegmentsToSend = videoSegments ? videoSegments.length : 1;
            let sentSegments = 0;

            await m.reply(`Memulai broadcast ke ${total} grup...`);

            for (let i = 0; i < groupList.length; i++) {
                const [groupId, meta] = groupList[i];
                try {
                    if (videoSegments && videoSegments.length > 0) {
                        for (let j = 0; j < videoSegments.length; j++) {
                            const seg = videoSegments[j];
                            await groupStatus(conn, groupId, { video: seg.buffer, caption: '' });
                            sentSegments++;
                            await m.reply(`Progress: ${sentSegments}/${totalSegmentsToSend * total}`);
                            await delay(1000);
                        }
                    } else if (rawContent.image) {
                        await groupStatus(conn, groupId, { image: rawContent.image, caption: rawContent.caption || '' });
                    } else if (rawContent.video) {
                        await groupStatus(conn, groupId, { video: rawContent.video, caption: rawContent.caption || '' });
                    } else if (rawContent.audio) {
                        await groupStatus(conn, groupId, rawContent);
                    } else if (rawContent.text) {
                        await groupStatus(conn, groupId, { text: rawContent.text, backgroundColor: rawContent.backgroundColor || '#25D366' });
                    }
                    success++;
                } catch (e) {
                    failed++;
                    failedGroups.push(meta.subject || groupId);
                }

                if ((i + 1) % 5 === 0) await delay(2000);
                else await delay(500);
            }

            let report = `BROADCAST SWGC SELESAI\n\n` +
                `Total: ${total} grup\n` +
                `Berhasil: ${success}\n` +
                `Gagal: ${failed}`;

            if (failedGroups.length > 0) {
                report += `\n\nGrup gagal:\n` + failedGroups.map(g => `• ${g}`).join('\n');
            }

            await m.reply(report);
            await m.react('✅');

        } catch (e) {
            console.error(e);
            m.reply(`Error: ${e.message}`);
        }
    }
};

handler.command = /^(swgc|upswgc|swgcall|swgcbc|groupstoryall)$/i;
handler.tags = ["group"];
handler.owner = true;

export default handler;