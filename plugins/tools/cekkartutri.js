import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`📱 *CEK KARTU TRI (3)*\n\nPeriksa status dan informasi kartu SIM 3 (Tri)!\nContoh:\n${usedPrefix + command} 089512345678`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let nomor = text.replace(/\D/g, '');
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/cekkartutri?apikey=${apiKey}&nomor=${encodeURIComponent(nomor)}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.message || "Gagal cek kartu Tri.");

        let data = json.data || json.result || json;
        let caption = `📱 *INFO KARTU TRI (3)*\n\n`;
        caption += `📞 *Nomor (MSISDN):* ${json.msisdn || data.msisdn || nomor}\n`;
        if (json.iccid || data.iccid) caption += `🆔 *ICCID:* ${json.iccid || data.iccid}\n`;
        caption += `📶 *Status Kartu:* ${json.status_kartu || data.status_kartu || data.cardStatus || 'Aktif'}\n`;
        caption += `📝 *Status Registrasi:* ${json.status_registrasi || data.status_registrasi || data.activationStatus || '-'}\n`;
        if (json.tanggal_aktivasi || data.tanggal_aktivasi || data.activationDate) caption += `📅 *Tanggal Aktivasi:* ${json.tanggal_aktivasi || data.tanggal_aktivasi || data.activationDate}\n`;
        if (json.tanggal_berakhir || data.tanggal_berakhir || data.actEndDate) caption += `⏳ *Masa Berlaku:* ${json.tanggal_berakhir || data.tanggal_berakhir || data.actEndDate}\n`;
        if (json.sisa_hari_aktif !== undefined && json.sisa_hari_aktif !== null) caption += `⏱️ *Sisa Hari Aktif:* ${json.sisa_hari_aktif} Hari\n`;
        if (json.produk || data.produk || data.prodDesc) caption += `🎁 *Produk / Paket:* ${json.produk || data.produk || data.prodDesc}\n`;
        if (json.distribusi || data.distribusi || data.retDistrict) caption += `📍 *Area Distribusi:* ${json.distribusi || data.distribusi || data.retDistrict}\n`;
        caption += `\n✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Cek Tri Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['cekkartutri <nomor>', 'cektri <nomor>'];
handler.tags = ['tools'];
handler.command = /^(cekkartutri|cektri|tricek|cekkartu3)$/i;

handler.limit = 1;
export default handler;
