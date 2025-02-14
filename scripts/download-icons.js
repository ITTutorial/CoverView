const https = require('https');
const fs = require('fs');
const path = require('path');

const icons = [
    {
        url: 'https://cdn.xueshu.fun/202502141654660.png',
        filename: 'facefusion.png'
    },
    {
        url: 'https://cdn.xueshu.fun/202502141654279.jpg',
        filename: 'xueshu.jpg'
    },
    {
        url: 'https://cdn.xueshu.fun/202502141654783.png',
        filename: 'aifun.png'
    }
];

const downloadIcon = (url, filename) => {
    return new Promise((resolve, reject) => {
        const targetPath = path.join(__dirname, '../src/assets/icons/authors', filename);
        const file = fs.createWriteStream(targetPath);

        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(targetPath, () => {});
            reject(err);
        });
    });
};

async function downloadAll() {
    try {
        await Promise.all(icons.map(icon => downloadIcon(icon.url, icon.filename)));
        console.log('All icons downloaded successfully');
    } catch (error) {
        console.error('Error downloading icons:', error);
    }
}

downloadAll();
