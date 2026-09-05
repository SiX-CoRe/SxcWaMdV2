⚡ SxcWaMdV2

<p align="center">
  <img src="https://img.shields.io/github/stars/SiX-CoRe/SxcWaMdV2?style=for-the-badge&logo=github&label=STARS" alt="Stars">
  <img src="https://img.shields.io/github/forks/SiX-CoRe/SxcWaMdV2?style=for-the-badge&logo=github&label=FORKS" alt="Forks">
  <img src="https://img.shields.io/github/license/SiX-CoRe/SxcWaMdV2?style=for-the-badge&label=LICENSE" alt="License">
  <img src="https://img.shields.io/github/last-commit/SiX-CoRe/SxcWaMdV2?style=for-the-badge&logo=github&label=UPDATE" alt="Update">
</p><p align="center">
  <b>WhatsApp Multi Device Bot</b>
  <br>
  A powerful, modular and customizable WhatsApp bot framework
</p><p align="center">
  <a href="https://github.com/SiX-CoRe/SxcWaMdV2">Repository</a> •
  <a href="https://github.com/SiX-CoRe/SxcWaMdV2/issues">Issues</a> •
  <a href="https://github.com/SiX-CoRe/SxcWaMdV2/forks">Fork</a>
</p>---

🖤 About

SxcWaMdV2 adalah project WhatsApp Multi Device Bot berbasis Node.js yang dibuat dengan konsep modular dan plugin-based.

Struktur project dirancang agar developer dapat menambahkan, menghapus, maupun memodifikasi fitur tanpa perlu mengubah keseluruhan sistem utama.

«Built for developers who want a clean, customizable and extensible WhatsApp bot.»

---

✨ Features

Feature| Status
📱 WhatsApp Multi Device| ✅
🔌 Plugin System| ✅
🧩 Modular Structure| ✅
⚡ Node.js Based| ✅
🗃️ Database Support| ✅
🖼️ Media Support| ✅
🛠️ Easy Customization| ✅
📦 NPM Dependencies| ✅
📱 Termux Support| ✅
🖥️ VPS Support| ✅

---

🧰 Tech Stack

<p align="center">"Node.js" (https://img.shields.io/badge/Node.js-24%2B-339933?style=flat-square&logo=node.js&logoColor=white)
"JavaScript" (https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
"WhatsApp" (https://img.shields.io/badge/WhatsApp-Multi--Device-25D366?style=flat-square&logo=whatsapp&logoColor=white)
"NPM" (https://img.shields.io/badge/NPM-Package-red?style=flat-square&logo=npm)

</p>---

📂 Structure

SxcWaMdV2/
│
├── 📁 lib/
│   └── Library & helper
│
├── 📁 media/
│   └── Image, audio & media
│
├── 📁 plugins/
│   └── Bot commands & features
│
├── 📁 src/
│   └── Core source
│
├── 📄 config.js
├── 📄 database.json
├── 📄 handler.js
├── 📄 index.js
├── 📄 main.js
├── 📄 package.json
└── 📄 README.md

---

🚀 Installation

1. Clone Repository

git clone https://github.com/SiX-CoRe/SxcWaMdV2.git

2. Masuk ke Directory

cd SxcWaMdV2

3. Install Dependencies

npm install

4. Configure

Edit file:

config.js

Sesuaikan konfigurasi bot sesuai kebutuhan.

5. Start Bot

npm start

Jika "npm start" tidak tersedia:

node index.js

---

📱 Running on Termux

Install package yang diperlukan:

pkg update
pkg upgrade
pkg install nodejs git

Clone repository:

git clone https://github.com/SiX-CoRe/SxcWaMdV2.git
cd SxcWaMdV2

Install dependency:

npm install

Jalankan:

node index.js

---

🔌 Plugin System

SxcWaMdV2 menggunakan konsep plugin-based system sehingga fitur bot dapat dipisahkan berdasarkan fungsi.

Contoh:

plugins/
│
├── menu.js
├── owner.js
├── tools.js
├── downloader.js
└── games.js

Keuntungan:

- ✅ Source lebih terorganisir
- ✅ Mudah menambahkan fitur
- ✅ Mudah menghapus fitur
- ✅ Tidak perlu mengubah core
- ✅ Cocok untuk project berskala besar

---

🛠️ Customization

Kamu bebas melakukan customization pada project, seperti:

Prefix
├── .
├── !
├── /
└── #

Bot Name
Owner
Menu
Plugins
Database
Media
Messages
Handler
Configuration

Pastikan perubahan pada bagian core dilakukan dengan hati-hati agar tidak menyebabkan error pada sistem bot.

---

💻 Requirements

Sebelum menjalankan project, pastikan sudah memiliki:

- Node.js 24 atau lebih baru
- NPM
- Git
- Koneksi internet
- WhatsApp account

Cek versi Node.js:

node -v

Cek versi NPM:

npm -v

---

🔄 Update Repository

Untuk mengambil versi terbaru:

git pull origin main

Kemudian install kembali dependency jika diperlukan:

npm install

---

🐛 Troubleshooting

Dependency Error

Coba:

rm -rf node_modules
npm install

Bot Tidak Bisa Start

Pastikan Node.js sesuai requirement:

node -v

Kemudian jalankan:

node index.js

Error pada Plugin

Periksa file plugin yang terakhir diubah dan lihat error yang muncul pada terminal.

---

🤝 Contributing

Contribution sangat terbuka.

Jika ingin membantu pengembangan:

1. Fork repository
2. Buat branch baru
3. Lakukan perubahan
4. Test perubahan
5. Commit
6. Push branch
7. Buat Pull Request

Contoh:

git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

---

⭐ Support Project

Jika project ini bermanfaat, jangan lupa:

<p align="center">⭐ <b>Star</b> repository
🍴 <b>Fork</b> repository
🐛 <b>Report</b> bugs
💡 <b>Suggest</b> features
🤝 <b>Contribute</b>

</p>---

⚠️ Disclaimer

Project ini dibuat untuk pembelajaran, pengembangan, dan eksperimen.

Pengguna bertanggung jawab penuh atas penggunaan software ini.

Jangan gunakan project untuk aktivitas yang melanggar hukum, merugikan orang lain, melakukan spam, atau melanggar ketentuan layanan platform terkait.

Developer tidak bertanggung jawab atas penyalahgunaan project ini.

---

📜 License

SxcWaMdV2 menggunakan MIT License.

Lihat file ""LICENSE"" (./LICENSE) untuk informasi lengkap.

---

👨‍💻 Developer

<p align="center">SiX-CoRe

WhatsApp Bot Developer & Open Source Project

"GitHub" (https://github.com/SiX-CoRe)

</p>---

<p align="center">
  <sub>© 2026 sixcorecomunity</sub>
</p><p align="center">
  <b>Made with ❤️ by lumnztyz6x</b>
</p>
