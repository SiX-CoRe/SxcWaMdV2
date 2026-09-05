import fetch from 'node-fetch';
import FormData from 'form-data';
import * as fileTypeModule from 'file-type';
import axios from 'axios';
import fs from 'fs';
import chalk from 'chalk';

const getFileType = async (buffer) => {
  try {
    if (fileTypeModule.fileTypeFromBuffer) return await fileTypeModule.fileTypeFromBuffer(buffer);
    if (fileTypeModule.fromBuffer) return await fileTypeModule.fromBuffer(buffer);
    if (fileTypeModule.default?.fromBuffer) return await fileTypeModule.default.fromBuffer(buffer);
    if (typeof fileTypeModule.default === 'function') return await fileTypeModule.default(buffer);
  } catch (_) {}
  return null;
};

const file = async (buffer) => {
    const { ext } = (await getFileType(buffer)) || { ext: 'bin' };
    const filename = 'jere-' + Date.now() + '.' + ext;
    return { filename, ext };
};

export const uploader = async function(buffer) {
    try {
        const uploadPomf = (await import('./uploadImage.js')).default;
        return await uploadPomf(buffer);
    } catch(e) {
        return await defaultUploaderObj.top4top(buffer).then(r => r.downloadUrl).catch(() => defaultUploaderObj.uguu(buffer).then(r => r.files[0].url));
    }
};

const defaultUploaderObj = {
    uploader: async function(buffer) {
        return await uploader(buffer);
    },
    top4top: async function top4top(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!buffer) return console.warn('Mana Buffer Nya !');
                const origin = 'https://top4top.io';
                const data = new FormData();
                const { filename, ext }= await file(buffer);
                data.append('file_1_', buffer, {
                    filename
                });
                data.append('submitr', '[ رفع الملفات ]');

                const options = {
                    method: 'POST',
                    body: data
                };

                console.log('uploading file.. ' + filename)
                const r = await fetch(origin + '/index.php', options)
                if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`)
                const html = await r.text()
                const matches = html.matchAll(/<input readonly="readonly" class="all_boxes" onclick="this.select\(\);" type="text" value="(.+?)" \/>/g)
                const arr = Array.from(matches)
                if (!arr.length) throw Error(`gagal mengupload file`)
                const downloadUrl = arr.map(v => v[1]).find(v => v.endsWith(ext))
                const deleteUrl = arr.map(v => v[1]).find(v => v.endsWith('html'))
                const qrcodeUrl = origin + '/' + html.match(/<div class="qr_img"><img src="(.+?)"/)?.[1]
                const result = {
                    downloadUrl,
                    deleteUrl,
                    qrcodeUrl
                }
                resolve(result);
            } catch (e) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', e);
            };
        });
    },

    ryzumi: async function ryzumi(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!buffer) return console.warn('Mana Buffer Nya !');

                const { filename } = await file(buffer);
                const data = new FormData();
                data.append('file', buffer, { filename });

                const { data: ryzumi } = await axios.post('https://api.ryzumi.vip/api/uploader/ryzencdn', data, { headers: { ...data.getHeaders(), referrer: "https://api.ryzumi.vip/" } })
                resolve(ryzumi);
            } catch (e) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', e);
            };
        });
    },

    qu: async function qu(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!buffer) return console.warn('Mana Buffer Nya !');
                const form = new FormData();
                const { filename } = await file(buffer);

                form.append('files[]', buffer, {
                    filename
                });
                form.append('expiry', '-1');

                const {
                    files
                } = await axios.post("https://qu.ax/upload.php", form, {
                    "headers": {
                        ...form.getHeaders(),
                        "referrer": "https://qu.ax/"
                    }
                }).then(a => a.data);

                resolve(files[0]);
            } catch (e) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', e);
            };
        });
    },

    cloudku: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const { filename } = await file(buffer);
                const data = new FormData();
                data.append('file', buffer, {
                    filename
                });

                const response = await axios.post('https://www.cloudkuimages.guru/upload', data, {
                    headers: {
                        ...data.getHeaders(),
                        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
                        "Referer": "https://www.cloudkuimages.guru/"
                    }
                });
            } catch (err) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', err);
            };
        });
    },

    catbox: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const { filename } = await file(buffer);
                const data = new FormData();
                data.append('reqtype', 'fileupload');
                data.append('userhash', '');
                data.append('fileToUpload', buffer, {
                    filename
                });

                const api = await axios.post('https://catbox.moe/user/api.php', data, {
                    headers: {
                        ...data.getHeaders(),
                        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0'
                    }
                });

                resolve(api.data);
            } catch (err) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', err);
            }
        });
    },

    uguu: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const { filename } = await file(buffer);
                const data = new FormData();
                data.append('files[]', buffer, {
                    filename
                });

                const api = await axios.post('https://uguu.se/upload.php', data, {
                    headers: {
                        ...data.getHeaders(),
                        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
                        "Referer": "https://uguu.se/"
                    }
                });

                resolve(api.data);
            } catch (err) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', err);
            }
        });
    },

    tempfiles: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const { filename } = await file(buffer);
                const data = new FormData();
                data.append('file', buffer, {
                    filename
                });

                const {
                    data: api
                } = await axios.post('https://tmpfiles.org/api/v1/upload', data, {
                    headers: {
                        ...data.getHeaders(),
                        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
                        "Referer": "https://tmpfiles.org/"
                    }
                });

                const match = /tmpfiles\.org\/([^"]+)/.exec(api.data.url);
                resolve('https://tmpfiles.org/dl/' + match[1]);
            } catch (err) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', err);
            }
        });
    }
};

export default defaultUploaderObj;


const filee = new URL(import.meta.url);
fs.watchFile(filee, () => {
    fs.unwatchFile(filee);
    console.log(chalk.redBright(`Update 'uploader.js'`));
});