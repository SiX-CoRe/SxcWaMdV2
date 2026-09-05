import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args, text }) => {
    try {
        const cleanText = (text || '').trim();

        if (!cleanText) {
            let menu = `╭─「 🔮 *MENU PRIMBON & RAMALAN* 」\n`;
            menu += `├ 📜 *Daftar Fitur Primbon & Ramalan:* \n`;
            menu += `╰────────────────────\n\n`;
            menu += `• \`${usedPrefix}artinama <nama>\`\n  _Arti dan makna kepribadian nama_\n\n`;
            menu += `• \`${usedPrefix}nomorhoki <nomor_hp>\`\n  _Cek energi & angka Bagua Shuzi nomor_\n\n`;
            menu += `• \`${usedPrefix}tafsirmimpi <mimpi>\`\n  _Cari tafsir & pertanda mimpi_\n\n`;
            menu += `• \`${usedPrefix}zodiak <nama_zodiak>\`\n  _Ramalan horoskop & elemen keberuntungan_\n\n`;
            menu += `• \`${usedPrefix}kecocokannama <nama1> | <nama2>\`\n  _Kecocokan hubungan nama pasangan_\n\n`;
            menu += `• \`${usedPrefix}cekpotensipenyakit <tgl|bln|thn>\`\n  _Cek potensi penyakit & organ rentan_\n\n`;
            menu += `• \`${usedPrefix}rejekiweton <tgl|bln|thn>\`\n  _Ramalan rejeki & peruntungan weton_\n\n`;
            menu += `• \`${usedPrefix}sifatusahabisnis <tgl|bln|thn>\`\n  _Karakter usaha & bisnis cocok_\n\n`;
            menu += `• \`${usedPrefix}ramalanjodoh <nama1|tgl1|bln1|thn1|nama2|tgl2|bln2|thn2>\`\n  _Petung ramalan jodoh Jawa lengkap_\n\n`;
            menu += `• \`${usedPrefix}ramalanjodohbali <nama1|tgl1|bln1|thn1|nama2|tgl2|bln2|thn2>\`\n  _Petemon perjodohan kalender Bali_\n\n`;
            menu += `_Ketik salah satu perintah di atas sesuai format yang dicontohkan._`;

            return m.reply(menu.trim());
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let subCmd = args[0] ? args[0].toLowerCase() : '';
        let restText = args.slice(1).join(' ').trim();
        let apiKey = global.apikey?.jereapi || global.apiKey;

        // Map subcommands to endpoints
        let endpoint = '';
        let queryParam = '';

        if (['artinama', 'nama'].includes(subCmd)) {
            endpoint = 'artinama';
            queryParam = `nama=${encodeURIComponent(restText)}`;
        } else if (['nomorhoki', 'hoki', 'nomor'].includes(subCmd)) {
            endpoint = 'nomorhoki';
            queryParam = `nomor=${encodeURIComponent(restText)}`;
        } else if (['tafsirmimpi', 'mimpi', 'artimimpi'].includes(subCmd)) {
            endpoint = 'tafsirmimpi';
            queryParam = `mimpi=${encodeURIComponent(restText)}`;
        } else if (['zodiak', 'bintang', 'horoskop'].includes(subCmd)) {
            endpoint = 'zodiak';
            queryParam = `zodiak=${encodeURIComponent(restText)}`;
        } else {
            // Default to artinama or general query
            endpoint = 'artinama';
            queryParam = `nama=${encodeURIComponent(cleanText)}`;
        }

        let url = `${global.web}/api/primbon/${endpoint}?apikey=${apiKey}&${queryParam}`;
        let res = await fetch(url);
        let json = await res.json();

        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;
            let card = `╭─「 🔮 *PRIMBON & RAMALAN* 」\n`;
            card += `├ 📌 *Fitur:* ${endpoint.toUpperCase()}\n`;
            card += `╰────────────────────\n\n`;

            if (typeof resData === 'object' && resData !== null) {
                for (let [k, v] of Object.entries(resData)) {
                    if (typeof v === 'string' || typeof v === 'number') {
                        card += `• *${k.replace(/_/g, ' ')}:* ${v}\n`;
                    }
                }
            } else {
                card += `${resData}\n`;
            }

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || "Gagal memproses data primbon.");
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ["primbon", "primbon <fitur> <query>"];
handler.tags = ["primbon"];
handler.command = /^(primbon|ramalan)$/i;
handler.limit = 1;
export default handler;
