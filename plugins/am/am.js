import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command, args, isOwner, isPrems }) => {
    let cmd = command.toLowerCase();
    let action = '';
    let paramString = '';

    // Direct command support (e.g. .amsend, .amverif, .ambulk, .ambulkcustom, .amverifcustom)
    if (cmd === 'amsend' || cmd === 'sendam') {
        action = 'send';
        paramString = text || '';
    } else if (cmd === 'amverif' || cmd === 'verifam') {
        action = 'verif';
        paramString = text || '';
    } else if (cmd === 'ambulk' || cmd === 'bulkam') {
        action = 'bulk';
        paramString = text || '';
    } else if (cmd === 'ambulkcustom' || cmd === 'bulkcustomam') {
        action = 'bulk-custom';
        paramString = text || '';
    } else if (cmd === 'amverifcustom' || cmd === 'verifcustomam') {
        action = 'verif-custom';
        paramString = text || '';
    } else {
        action = (args[0] || '').toLowerCase();
        paramString = args.slice(1).join(' ');
    }

    // 1. Jika user hanya cek menu daftar perintah (.am tanpa argumen)
    if (!action || !['send', 'verif', 'bulk', 'bulk-custom', 'verif-custom'].includes(action)) {
        return m.reply(`🎬 *ALIGHT MOTION PREMIUM ENGINE* 🎬\n\n` +
                       `📌 *Daftar Perintah (Khusus User Premium):*\n` +
                       `1️⃣ *${usedPrefix}am send <email>* ➔ Kirim link login ke email\n` +
                       `2️⃣ *${usedPrefix}am verif <email> | <link>* ➔ Verifikasi akun jadi Premium\n` +
                       `3️⃣ *${usedPrefix}am bulk <jumlah>* ➔ Generate massal akun AM\n` +
                       `4️⃣ *${usedPrefix}am bulk-custom <jumlah> | <orderId>* ➔ Custom order massal\n` +
                       `5️⃣ *${usedPrefix}am verif-custom <email> | <link> | <orderId>* ➔ Verif custom order\n\n` +
                       `💡 *Shortcut Langsung:*\n` +
                       `• *${usedPrefix}amsend <email>*\n` +
                       `• *${usedPrefix}amverif <email> | <link>*\n` +
                       `• *${usedPrefix}ambulk <jumlah>*\n` +
                       `• *${usedPrefix}ambulkcustom <jumlah> | <orderId>*\n` +
                       `• *${usedPrefix}amverifcustom <email> | <link> | <orderId>*\n\n` +
                       `> © _lumnztyz6x | sixcorecomunity_`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi;
        let url = '';
        let params = paramString.split('|').map(v => v.trim());

        // Step 1: SEND LINK
        if (action === 'send') {
            let email = params[0];
            if (!email) {
                return m.reply(`⚠️ Format salah!\nContoh: *${usedPrefix}am send abc@temp.com* atau *${usedPrefix}amsend abc@temp.com*`);
            }

            url = `${global.web}/api/am/send?apikey=${apiKey}&email=${encodeURIComponent(email)}`;
            let res = await fetch(url);
            let json = await res.json();
            if (!json.status) throw new Error(json.message || json.error || "Gagal mengirim verifikasi");
            
            let txt = `✅ *LINK VERIFIKASI BERHASIL DIKIRIM*\n\n` +
                      `📧 *Target Email:* \`${email}\`\n` +
                      `📬 *Status:* Link login Alight Motion telah dikirim ke email kamu.\n\n` +
                      `👉 *Langkah Terakhir (Aktivasi Premium):*\n` +
                      `Buka inbox email kamu, salin link verifikasinya, lalu ketik:\n` +
                      `*${usedPrefix}am verif ${email} | <link_verifikasi>*\n\n` +
                      `> © _lumnztyz6x | sixcorecomunity_`;
            m.reply(txt.trim());
            
        // Step 2: VERIFIKASI
        } else if (action === 'verif') {
            let email = params[0];
            let link = params[1];
            if (!email || !link) {
                return m.reply(`⚠️ Format salah!\nContoh: *${usedPrefix}am verif abc@temp.com | https://alight.link/...* atau *${usedPrefix}amverif abc@temp.com | https://alight.link/...*`);
            }

            url = `${global.web}/api/am/verif?apikey=${apiKey}`;
            let res = await fetch(url, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, link })
            });
            let json = await res.json();
            if (!json.status) throw new Error(json.message || json.error || "Gagal melakukan verifikasi");
            
            let txt = `🎉 *AKUN ALIGHT MOTION BERHASIL MENJADI PREMIUM!*\n\n` +
                      `📧 *Email:* \`${email}\`\n` +
                      `✨ *Status:* Akun Premium Alight Motion Aktif!\n\n` +
                      `> © _lumnztyz6x | sixcorecomunity_`;
            m.reply(txt.trim());
            
        // Step 3: BULK GENERATE
        } else if (action === 'bulk') {
            let amount = parseInt(params[0]) || 5;
            m.reply(`⏳ *PROSES GENERATE BULK AM*\nSedang memproses ${amount} akun... Mohon tunggu.`);
            url = `${global.web}/api/am/bulk?apikey=${apiKey}&amount=${amount}&stream=false`;
            
            let res = await fetch(url, { timeout: 300000 });
            let json = await res.json();
            if (json.statusCode && json.statusCode !== 200) throw new Error(json.message || json.error || "Gagal membuat bulk akun");
            
            let results = json.accounts || json.results || json.data || [];
            let resText = `🎉 *BULK AM GENERATE SUCCESS*\n` +
                          `📦 *Total Akun:* ${results.length}\n` +
                          `⏱️ *Success:* ${json.success_count || results.length} | *Failed:* ${json.failed_count || 0}\n\n`;
            
            results.forEach((acc, i) => {
                let accStr = acc.account || acc.email || acc;
                let loginUrl = acc.login_url || (acc.email ? `https://generator.email/${acc.email}` : '');
                resText += `*${i + 1}.* \`${accStr}\`\n`;
                if (loginUrl) resText += `   🔗 *Mailbox:* ${loginUrl}\n`;
            });
            resText += `\n> © _lumnztyz6x | sixcorecomunity_`;
            m.reply(resText.trim());
            
        // Step 4: BULK CUSTOM
        } else if (action === 'bulk-custom') {
            let amount = parseInt(params[0]);
            let orderId = params[1];
            if (!amount || !orderId) {
                return m.reply(`⚠️ Format salah!\nContoh: *${usedPrefix}am bulk-custom 1 | jereganteng* atau *${usedPrefix}ambulkcustom 1 | jereganteng*`);
            }
            
            m.reply(`⏳ *PROSES BULK CUSTOM AM*\nSedang memproses ${amount} akun untuk Order ID: *${orderId}*...`);
            url = `${global.web}/api/am/bulk-custom?apikey=${apiKey}`;
            
            let res = await fetch(url, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, orderId, stream: false }),
                timeout: 300000 
            });
            let json = await res.json();
            if (json.statusCode && json.statusCode !== 200) throw new Error(json.message || json.error || "Gagal membuat bulk custom akun");
            
            let results = json.accounts || json.results || json.data || [];
            let resText = `🎉 *BULK CUSTOM AM SUCCESS*\n` +
                          `🔖 *Order ID:* \`${orderId}\`\n` +
                          `📦 *Total Akun:* ${results.length}\n` +
                          `✅ *Success:* ${json.success_count || results.length} | ❌ *Failed:* ${json.failed_count || 0}\n\n`;
            
            results.forEach((acc, i) => {
                let accStr = acc.account || acc.email || acc;
                let loginUrl = acc.login_url || (acc.email ? `https://generator.email/${acc.email}` : '');
                resText += `*${i + 1}.* \`${accStr}\`\n`;
                if (loginUrl) resText += `   🔗 *Mailbox:* ${loginUrl}\n`;
            });
            resText += `\n> © _lumnztyz6x | sixcorecomunity_`;
            m.reply(resText.trim());
            
        // Step 5: VERIF CUSTOM
        } else if (action === 'verif-custom') {
            let email = params[0];
            let link = params[1];
            let orderId = params[2];
            if (!email || !link || !orderId) {
                return m.reply(`⚠️ Format salah!\nContoh: *${usedPrefix}am verif-custom abc@temp.com | https://alight.link/... | ORDER-123*\n\n_Pastikan dipisah dengan tanda |_`);
            }
            url = `${global.web}/api/am/verif-custom?apikey=${apiKey}`;
            
            let res = await fetch(url, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, link, orderId })
            });
            let json = await res.json();
            if (!json.status) throw new Error(json.message || json.error || "Gagal melakukan verifikasi custom");
            
            let txt = `🎉 *VERIF CUSTOM SUCCESS*\n\n` +
                      `🔖 *Order ID:* \`${orderId}\`\n` +
                      `📧 *Email:* \`${email}\`\n` +
                      `✨ *Status:* Akun Premium Alight Motion berhasil diverifikasi!\n\n` +
                      `> © _lumnztyz6x | sixcorecomunity_`;
            m.reply(txt.trim());
        }
        
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        let errMsg = e.message || 'Terjadi kesalahan pada server';
        m.reply(`❌ *ERROR ALIGHT MOTION*\n\n${errMsg}`);
    }
};

handler.help = [
    'am <action>',
    'amsend <email>',
    'amverif <email> | <link>',
    'ambulk <jumlah>',
    'ambulkcustom <jumlah> | <orderId>',
    'amverifcustom <email> | <link> | <orderId>'
];
handler.tags = ['am'];
handler.command = /^(am|amsend|sendam|amverif|verifam|ambulk|bulkam|ambulkcustom|bulkcustomam|amverifcustom|verifcustomam)$/i;
handler.premium = true;

export default handler;
