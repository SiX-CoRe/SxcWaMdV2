import cron from 'node-cron';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const systemConfig = { apacoba: false };
let backupScheduled = false;
let apacobaScheduled = false;

function getOwnerJid() {
    try {
        let owner = Array.isArray(global.owner) ? global.owner[0] : global.owner;
        let normalizedOwner = Array.isArray(owner) ? owner[0] : owner;
        let ownerNumber = String(normalizedOwner || '').replace(/[^0-9]/g, '');
        if (ownerNumber) return ownerNumber + '@s.whatsapp.net';
        
        let globalNumber = String(global.number || '').replace(/[^0-9]/g, '');
        return globalNumber ? globalNumber + '@s.whatsapp.net' : '';
    } catch (error) {
        return '';
    }
}

export function initSystem(client) {
    if (!client) return;

    // Menjadwalkan tugas backup otomatis menggunakan node-cron
    if (!backupScheduled) {
        backupScheduled = true;
        cron.schedule('0 0 * * *', async () => {
            if (global.isMaintenance === false) return;
            try {
                const backupFileName = 'backup.zip';
                const backupFilePath = path.join(process.cwd(), backupFileName);
                const outputStream = fs.createWriteStream(backupFilePath);
                const archive = archiver('zip', { zlib: { level: 9 } });

                outputStream.on('close', async () => {
                    try {
                        const ownerJid = getOwnerJid();
                        if (ownerJid && fs.existsSync(backupFilePath)) {
                            const fileBuffer = fs.readFileSync(backupFilePath);
                            await client.sendMessage(ownerJid, {
                                document: fileBuffer,
                                mimetype: 'application/zip',
                                fileName: backupFileName,
                                caption: '📦 Backup Session Berhasil pada ' + new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
                            }).catch(() => {});

                            // Hapus file zip sementara setelah 10 detik
                            setTimeout(() => {
                                if (fs.existsSync(backupFilePath)) {
                                    fs.unlinkSync(backupFilePath);
                                }
                            }, 10000);
                        }
                    } catch (err) {}
                });

                archive.on('error', (err) => {});
                archive.pipe(outputStream);
                
                // Menambahkan folder/file yang di-backup dengan mengabaikan direktori tertentu
                archive.glob('session/**', {
                    cwd: process.cwd(),
                    ignore: [
                        'node_modules/**',
                        'session/pre-key*',
                        'session/sender-key*',
                        'session/session-*',
                        'session/app-state*'
                    ]
                });
                
                await archive.finalize();
            } catch (err) {}
        }, {
            scheduled: true,
            timezone: 'Asia/Jakarta'
        });
    }

    // Menjadwalkan tugas broadcast/pengumuman berkala (apacoba)
    if (!apacobaScheduled) {
        apacobaScheduled = true;
        const runBroadcast = async () => {
            if (!systemConfig.apacoba) return;
            try {
                const announcementText = 'Official announcement or update message from system...';
                
                // Cek ketersediaan video banner
                let videoPath = '/sdcard/Download/lumnztyz6x/assets/banner.mp4';
                let videoBuffer = fs.existsSync(videoPath) ? fs.readFileSync(videoPath) : null;

                const ownerJid = getOwnerJid();
                const chats = Object.keys(await client.fetchChats().catch(() => ({})));
                const recipients = Array.from(new Set([ownerJid, ...chats].filter(Boolean)));

                for (let recipient of recipients) {
                    try {
                        if (videoBuffer && client.sendMessage) {
                            await client.sendMessage(recipient, {
                                video: videoBuffer,
                                gifPlayback: true,
                                title: 'Informasi Sistem',
                                caption: announcementText,
                                footer: '⚡ Powered by lumnztyz6x • Official Announcement',
                                buttons: [
                                    {
                                        name: 'cta_url',
                                        buttonParamsJson: JSON.stringify({
                                            display_text: 'Open',
                                            url: 'https://lynk.id/six6core'
                                        })
                                    }
                                ],
                                hasMediaAttachment: true
                            }).catch(() => {});
                        } else {
                            await client.sendMessage(recipient, { text: announcementText }).catch(() => {});
                        }
                        
                        // Jeda 3 detik antar pesan untuk menghindari rate-limit
                        await new Promise((resolve) => setTimeout(resolve, 3000));
                    } catch (innerErr) {}
                }
            } catch (err) {}
        };

        // Menjalankan fungsi broadcast setiap 5 jam (5 * 60 * 60 * 1000 ms)
        setInterval(runBroadcast, 5 * 60 * 60 * 1000);
    }
}
