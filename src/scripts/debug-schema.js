/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');

const endpoint = 'https://bck.drotes.com/graphql';

const query = JSON.stringify({
    query: `
    query IntrospectionQuery {
      __type(name: "RootMutation") {
        name
        fields {
          name
        }
      }
    }
  `
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': query.length
    }
};

console.log(`Checking Endpoint: ${endpoint}...`);

const req = https.request(endpoint, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`Error: HTTP ${res.statusCode}`);
            console.error(data);
            return;
        }

        try {
            const result = JSON.parse(data);
            if (result.errors) {
                console.error("GraphQL Errors:", JSON.stringify(result.errors, null, 2));
            } else {
                const fields = result.data?.__type?.fields;
                if (fields) {
                    console.log("\nAvailable Mutation Fields:");
                    const fieldNames = fields.map(f => f.name).sort();
                    console.log(fieldNames.join(", "));

                    const hasLogin = fieldNames.includes("login");
                    console.log(`\nHas 'login' mutation? ${hasLogin ? "YES" : "NO"}`);

                    // Check similar
                    const loginLike = fieldNames.filter(n => n.toLowerCase().includes("login") || n.toLowerCase().includes("auth"));
                    if (loginLike.length > 0) console.log("Similar fields found:", loginLike);
                } else {
                    console.log("Could not find type 'RootMutation'. Trying 'Mutation'...");
                    // Fallback check if RootMutation isn't the name (standard is Mutation usually, but WP often maps RootMutation)
                }
            }
        } catch (e) {
            console.error("Parse Error:", e.message);
            console.log("Raw Data:", data.substring(0, 500));
        }
    });
});

req.on('error', (e) => {
    console.error(`Request Error: ${e.message}`);
});

req.write(query);
req.end();
