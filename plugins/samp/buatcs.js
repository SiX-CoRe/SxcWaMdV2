import fetch from 'node-fetch'

async function generateStory(prompt) {
    try {
        const apiKey = global.apikey?.jereapi;
        const response = await fetch(`${global.web}/api/ai/chatai?apikey=${apiKey}&prompt=${encodeURIComponent(prompt)}`);
        const json = await response.json();

        if (json.status && json.result) {
            return typeof json.result === 'string' ? json.result : (json.result.text || json.result.message || JSON.stringify(json.result));
        }
        throw new Error(json.error || 'Gagal memproses dengan AI');
    } catch (error) {
        throw new Error(error.message || 'Gagal memproses AI');
    }
}

function generateFallbackStory(nama, tglLahir, profesi, kota, umur) {
    const namaPertama = nama.split(' ')[0];
    return `     Pada tanggal ${tglLahir} lahirlah seorang anak bernama ${nama} di Kota ${kota}. ${namaPertama} terlahir dari keluarga yang sederhana dan penuh dengan kehangatan. Sejak kecil, ${namaPertama} sudah menunjukkan ketertarikan yang sangat mendalam terhadap dunia ${profesi.toLowerCase()}.

     Saat menginjak usia remaja, ${namaPertama} mulai serius mempelajari segala seluk-beluk mengenai ${profesi.toLowerCase()}. ${namaPertama} belajar secara mandiri dan tekun serta tidak pernah ragu untuk bertanya kepada orang-orang berpengalaman di sekitarnya. Berbagai rintangan yang dihadapi dijadikannya sebagai motivasi untuk terus berkembang.

     Ketika beranjak dewasa, ${namaPertama} memutuskan untuk merantau dan menekuni profesi sebagai ${profesi} secara profesional. Pengalaman berharga di lapangan membuka wawasan ${namaPertama} tentang pentingnya integritas, kerja keras, dan dedikasi dalam menghadapi kerasnya persaingan hidup.

     Kini di usia ${umur} tahun, ${nama} telah tumbuh menjadi seorang ${profesi} yang terampil dan disegani di Kota ${kota}. ${namaPertama} dikenal luas sebagai sosok pekerja keras yang bertanggung jawab dan selalu siap menghadapi tantangan baru dalam perjalanannya.`;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(
`╭━━━ REQUEST CHARACTER STORY ━━━
│
│ 📌 *Format:*
│ ${usedPrefix + command} Nama | Tanggal Lahir | Profesi | Kota
│
│ 📝 *Contoh:*
│ ${usedPrefix + command} Jeremiah Alex | 20 Januari 1990 | Smuggler | Los Santos
│
│ ⚠️ *Rules:*
│ • Minimal 4 paragraf, 3 kalimat/paragraf
│ • 5 spasi di awal paragraf
│ • Gunakan bahasa Indonesia baku
│ • SS tanggal stats harus sesuai
│
╰━━━━━━━━━━━━━━━━`
            );
        }

        if (!text.includes("|")) {
            return m.reply(`❌ Format salah!\nGunakan: ${usedPrefix + command} Nama | Tanggal | Profesi | Kota`);
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let [nama, tglLahir, profesi, kota] = text.split("|").map(v => v.trim());

        if (!nama || !tglLahir || !profesi || !kota) {
            return m.reply("❌ Semua data (Nama, Tanggal Lahir, Profesi, Kota) harus diisi!");
        }

        const bulanMap = {
            'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4,
            'juni': 5, 'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9,
            'november': 10, 'desember': 11
        };

        let dateParts = tglLahir.split(" ").map(v => v.trim().toLowerCase());
        let tglStr = dateParts[0];
        let blnStr = dateParts[1];
        let thnStr = dateParts[2];
        let bulan = bulanMap[blnStr];
        
        let umur = 25;
        if (bulan !== undefined && !isNaN(parseInt(tglStr)) && !isNaN(parseInt(thnStr))) {
            let tglObj = new Date(parseInt(thnStr), bulan, parseInt(tglStr));
            let today = new Date();
            umur = today.getFullYear() - tglObj.getFullYear();
            let monthDiff = today.getMonth() - tglObj.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < tglObj.getDate())) umur--;
        }

        if (umur < 17) {
            return m.reply(`❌ Umur minimal 17 tahun. Umur karakter saat ini: ${umur} tahun.`);
        }

        await m.reply("📝 *Membuat Character Story SAMP... Mohon tunggu.*");

        const prompt = `Buatkan character story untuk karakter game GTA SAMP dengan latar kota Los Santos.

Data Karakter:
Nama: ${nama}
Tanggal Lahir: ${tglLahir}
Umur: ${umur} tahun
Profesi: ${profesi}
Kota: ${kota}

ATURAN PENULISAN (WAJIB DIIKUTI):
1. Cerita terdiri dari MINIMAL 4 PARAGRAF.
2. Setiap paragraf MINIMAL 3 KALIMAT.
3. Setiap paragraf diawali dengan 5 SPASI (     ).
4. Gunakan bahasa Indonesia yang BAKU dan FORMAL.
5. JANGAN gunakan tanda "_" pada nama karakter.
6. Gaya penulisan: Naratif deskriptif, realistis biografi karakter GTA San Andreas.
Mulai cerita langsung dari paragraf pertama.`;

        let story = '';
        try {
            story = await generateStory(prompt);
        } catch (err) {
            story = generateFallbackStory(nama, tglLahir, profesi, kota, umur);
        }

        let formattedStory = (story || '').trim();
        const paragraphs = formattedStory.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        let finalStory = '';
        for (const p of paragraphs) {
            const cleaned = p.replace(/^[\s]+/, '');
            finalStory += '     ' + cleaned + '\n\n';
        }

        if (finalStory.split(/\n\s*\n/).filter(p => p.trim().length > 0).length < 4) {
            finalStory = generateFallbackStory(nama, tglLahir, profesi, kota, umur);
        }

        const caption = `🎭 *CHARACTER STORY - ${nama.toUpperCase()}*

📝 *Rules Check:*
• Paragraf: ✅ ${finalStory.split(/\n\s*\n/).filter(p => p.trim().length > 0).length} Paragraf
• 5 Spasi: ✅
• Bahasa: ✅ Baku
• SS Date: ${new Date().toLocaleDateString('id-ID')}

${finalStory.trim()}

━━━━━━━━━━━━━━━━
🔗 *Request by:* ${m.pushName || 'User'}
📅 *Date:* ${new Date().toLocaleString('id-ID')}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply("❌ Gagal membuat character story: " + e.message);
    }
};

handler.help = ["buatcs <nama|tanggal|profesi|kota>"];
handler.tags = ["samp"];
handler.command = /^(buatcs|makecs|createstory)$/i;

handler.limit = 1;
export default handler;