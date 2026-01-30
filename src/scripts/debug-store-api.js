/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');

const rootUrl = 'https://drotes.com/wp-json/wc/store/v1';

console.log(`Probing: ${rootUrl}...`);

https.get(rootUrl, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.routes) {
                console.log("\nStore API Routes:");
                const routeKeys = Object.keys(result.routes);
                routeKeys.forEach(r => console.log(`- ${r}`));

                const hasLogin = routeKeys.find(r => r.includes('login') || r.includes('token'));
                console.log(`\nHas Login Route? ${hasLogin ? "YES: " + hasLogin : "NO"}`);
            } else {
                console.log("No routes returned.");
            }
        } catch (e) {
            console.error("Parse Error:", e.message);
            console.log("Raw:", data.substring(0, 500));
        }
    });
}).on('error', (e) => {
    console.error(`Request Error: ${e.message}`);
});
