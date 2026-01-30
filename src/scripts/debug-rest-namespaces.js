/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');

const rootUrl = 'https://bck.drotes.com/wp-json/';

console.log(`Probing: ${rootUrl}...`);

https.get(rootUrl, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.namespaces) {
                console.log("\nRegistered Namespaces:");
                result.namespaces.forEach(ns => console.log(`- ${ns}`));

                const jwtNs = result.namespaces.find(ns => ns.includes('jwt'));
                if (jwtNs) {
                    console.log(`\n✅ FOUND JWT NAMESPACE: ${jwtNs}`);
                } else {
                    console.log(`\n❌ JWT NAMESPACE NOT FOUND. Plugin inactive or blocked?`);
                }
            } else {
                console.log("No namespaces returned. Raw:", data.substring(0, 200));
            }
        } catch (e) {
            console.error("Parse Error:", e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Request Error: ${e.message}`);
});
