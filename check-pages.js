
const { ApolloClient, InMemoryCache, gql, HttpLink } = require('@apollo/client');
const fetch = require('cross-fetch');

const client = new ApolloClient({
    link: new HttpLink({ uri: 'https://drotes.com/graphql', fetch }),
    cache: new InMemoryCache(),
});

const GET_PAGES = gql`
  query GetPages {
    pages(first: 50) {
      nodes {
        title
        slug
        id
      }
    }
  }
`;

client.query({ query: GET_PAGES })
    .then(result => console.log(JSON.stringify(result.data.pages.nodes, null, 2)))
    .catch(error => console.error(error));
