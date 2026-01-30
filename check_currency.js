const https = require('https');

const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;

if (!consumerKey || !consumerSecret) {
    console.error("Missing credentials");
    process.exit(1);
}

const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

const options = {
    hostname: 'drotes.com',
    path: '/wp-json/wc/v3/orders?per_page=50',
    method: 'GET',
    headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const orders = JSON.parse(data);
            console.log("Found " + orders.length + " orders.");

            const foreign = orders.filter(o => o.currency !== 'AED');
            console.log("Found " + foreign.length + " non-AED orders.");

            if (foreign.length > 0) {
                const o = foreign[0];
                console.log("Order #" + o.id + " Currency: " + o.currency);
                console.log("Total: " + o.total);
                console.log("WMC Info:", JSON.stringify(o.meta_data.find(m => m.key === 'wmc_order_info'), null, 2));
                // Check if there are other total fields
                console.log("Meta Keys:", o.meta_data.map(m => m.key).filter(k => k.includes('total') || k.includes('currency')));
            } else {
                console.log("No non-AED orders found in the last 50.");
                // Check if any order has meta that implies foreign currency
                const hiddenForeign = orders.filter(o => {
                    const wmc = o.meta_data.find(m => m.key === 'wmc_order_info');
                    if (!wmc) return false;
                    // Check if is_main is NOT 1 for AED?
                    // Or check _order_currency meta?
                    return o.meta_data.find(m => m.key === '_order_currency' && m.value !== 'AED');
                });
                console.log("Found " + hiddenForeign.length + " potentially hidden foreign orders via meta.");
                if (hiddenForeign.length > 0) {
                    const o = hiddenForeign[0];
                    console.log("Hidden Foreign Order #" + o.id);
                    console.log("Main Currency Field: " + o.currency);
                    console.log("Meta _order_currency: " + o.meta_data.find(m => m.key === '_order_currency')?.value);
                    console.log("Total: " + o.total);
                }
            }

        } catch (e) {
            console.error("Error parsing", e);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
