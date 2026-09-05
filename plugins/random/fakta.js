const factsList = [
    "Otak manusia menghasilkan daya listrik sekitar 12 hingga 25 watt, cukup untuk menyalakan lampu LED kecil.",
    "Madu alami adalah satu-satunya makanan yang tidak akan pernah basi atau membusuk bahkan setelah ribuan tahun.",
    "Jantung paus biru berukuran sebesar mobil kecil dan beratnya mencapai sekitar 180 kg.",
    "Lumba-lumba tidur dengan satu mata terbuka dan hanya separuh otaknya yang tertidur untuk tetap waspada.",
    "Air panas dapat membeku lebih cepat daripada air dingin dalam kondisi tertentu, fenomena ini disebut Efek Mpemba.",
    "Sidik jari koala sangat mirip dengan sidik jari manusia, hingga terkadang membingungkan tim forensik di tempat kejadian perkara.",
    "Gurita memiliki tiga buah jantung dan darah mereka berwarna biru karena kaya akan tembaga (hemosianin).",
    "Pohon tertua di dunia yang diketahui bernama Methuselah, berusia lebih dari 4.800 tahun dan terletak di California.",
    "Satu hari di planet Venus lebih lama daripada satu tahun di Venus karena rotasinya yang sangat lambat.",
    "Kucing menghabiskan sekitar 70% dari hidup mereka untuk tidur.",
    "Gunung Everest terus bertumbuh sekitar 4 milimeter setiap tahunnya karena pergeseran lempeng tektonik.",
    "Bahasa Indonesia memiliki lebih dari 700 bahasa daerah, menjadikannya salah satu negara dengan bahasa daerah terbanyak di dunia.",
    "Kupu-kupu mengecap rasa makanannya menggunakan sensor yang ada di kaki mereka.",
    "Semut tidak memiliki paru-paru, mereka bernapas melalui lubang-lubang kecil di seluruh tubuh yang disebut spirakel.",
    "Petir menghasilkan panas sekitar 30.000 Kelvin (29.700°C), lima kali lebih panas dari permukaan matahari."
];

let handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        let fact = '';
        try {
            const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
            if (res.ok) {
                const json = await res.json();
                if (json && json.text) {
                    fact = json.text;
                }
            }
        } catch {}

        if (!fact) {
            fact = factsList[Math.floor(Math.random() * factsList.length)];
        }

        const text = `💡 *FAKTA UNIK DUNIA* 💡\n\n` +
                     `_" ${fact} "_\n\n` +
                     `> 🌐 *Tahukah kamu?* Pengetahuan baru setiap hari bersama *${global.botname || 'WhatsApp Bot'}*!`;

        await conn.reply(m.chat, text, m);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + (e.message || e));
    }
};

handler.help = ["fakta", "facts"];
handler.command = ["fakta", "facts", "faktaunik", "randomfact"];
handler.tags = ["random"];

handler.limit = 1;
export default handler;
