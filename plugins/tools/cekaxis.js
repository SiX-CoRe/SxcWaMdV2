import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`📱 *AXIS & XL CHECKER*\n\nPeriksa masa aktif, kuota, VoLTE, dan info paket kartu Axis/XL!\nContoh:\n${usedPrefix + command} 083812345678\n${usedPrefix + command} 6283812345678`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let nomor = text.replace(/\D/g, '');
        if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1);

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/cekaxis?apikey=${apiKey}&nomor=${encodeURIComponent(nomor)}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status && json.status !== 'success') {
            throw new Error(json.message || json.error || "Nomor tidak valid atau gagal mendapatkan data.");
        }

        let data = json.data || json.result || {};
        let caption = `📱 *INFO KARTU AXIS / XL*\n\n`;
        caption += `📞 *Nomor:* ${data.msisdn || nomor}\n`;
        caption += `📅 *Masa Aktif:* ${data.active_period || '-'}\n`;
        caption += `📦 *Sisa Kuota:* ${data.quota_remaining || '-'}\n`;
        caption += `📊 *Total Kuota:* ${data.quota_total || '-'}\n`;
        caption += `📶 *VoLTE:* ${data.volte_status === 'active' ? '✅ Aktif' : '❌ Tidak Aktif'}\n`;
        if (data.package_name) caption += `🎁 *Paket:* ${data.package_name}\n`;
        caption += `\n✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Cek Axis Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['cekaxis <nomor>', 'axiscek <nomor>', 'xlcek <nomor>'];
handler.tags = ['tools'];
handler.command = /^(cekaxis|axiscek|xlcek|axischeck|xlcheck)$/i;

handler.limit = 1;
export default handler;
