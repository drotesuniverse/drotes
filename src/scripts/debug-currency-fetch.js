const https = require('https');
const http = require('http');

// Load environment variables manually since we aren't in Next.js context
// These are from .env.local
const CONFIG = {
    CK: 'ck_ebc8d7cf3387f920b2757accaece0fd0385c083b',
    CS: 'cs_16e1d7677f1b1478d082efb0365f9d6762981a24',
    BASE_URL: 'https://drotes.com'
};

const endpoints = [
    `${CONFIG.BASE_URL}/wp-json/wmc/v1/params`, // Curcy Params
    `${CONFIG.BASE_URL}/wp-json/wmc/v1/rates`,  // Curcy Rates
    `${CONFIG.BASE_URL}/wp-json/wc/v3/data/currencies`, // Standard WC
    `${CONFIG.BASE_URL}/wp-json/woocs/v3/currency` // WOOCS (FOX)
];

const auth = 'Basic ' + Buffer.from(`${CONFIG.CK}:${CONFIG.CS}`).toString('base64');

console.log("🔍 Debugging Currency Endpoints...");
console.log(`📡 Base URL: ${CONFIG.BASE_URL}`);

endpoints.forEach(url => {
    console.log(`\n👉 Testing: ${url}`);

    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, {
        method: 'GET',
        headers: {
            'Authorization': auth,
            'User-Agent': 'DebugScript/1.0',
            'Content-Type': 'application/json'
        },
        timeout: 10000
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`   [${res.statusCode}] Status`);
            if (res.statusCode === 200) {
                try {
                    const json = JSON.parse(data);
                    const keys = Object.keys(json).slice(0, 5).join(', ');
                    console.log(`   ✅ Success! Keys: ${keys}...`);
                    // Check for specific currency data
                    if (json.rates || json.current_currency || json.AED) {
                        console.log("   🎯 FOUND CURRENCY DATA!");
                    }
                } catch (e) {
                    console.log(`   ⚠️ Invalid JSON: ${data.substring(0, 50)}...`);
                }
            } else {
                console.log(`   ❌ Failed. Response: ${data.substring(0, 100)}`);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`   🔥 Network Error: ${e.message}`);
    });

    req.end();
});
