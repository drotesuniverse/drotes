const fetch = require('node-fetch');

const endpoint = "https://bck.drotes.com/graphql";

const query = `
  query GetCheckoutInputSchema {
    __type(name: "CheckoutInput") {
      inputFields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
`;

async function run() {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error fetching schema:", error);
  }
}

run();
