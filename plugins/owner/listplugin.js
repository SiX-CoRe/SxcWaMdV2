import fs from 'fs';
import path from 'path';

let lp = async (m) => {
    try {
        const getAllPlugins = (dir) => {
            let results = [];
            if (!fs.existsSync(dir)) return results;
            const list = fs.readdirSync(dir);
            for (const file of list) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    results = results.concat(getAllPlugins(filePath));
                } else if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs')) {
                    results.push(filePath);
                }
            }
            return results;
        };

        const files = getAllPlugins('./plugins');
        if (files.length === 0) return m.reply('⚠️ Folder plugin kosong!');

        let cap = '*->* List Plugin *<-*\n';
        cap += files
            .map((a, i) => {
                const cleanPath = a.replace(/^(plugins\/|\.\/plugins\/)/, '').replace(/\\/g, '/');
                return ` *-(${i + 1})-*: ${cleanPath}`;
            })
            .join('\n');

        await m.reply(cap.trim());
    } catch (e) {
        console.error('Error List Plugin:', e);
        m.reply('❌ Maaf Error Mungkin Gada File Plugins: ' + e.message);
    }
};

lp.command = /^(lp|listplugin|listplugins|plugins)$/i;
lp.help = ["lp", "listplugin"];
lp.tags = ["owner"];
lp.owner = true;

export default lp;