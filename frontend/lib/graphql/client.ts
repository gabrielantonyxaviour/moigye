import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { getSubgraphEndpoint } from '@/constants/subgraphs'

const CHAIN_ID = 4613 // VeryChain mainnet

export const subgraphClient = new ApolloClient({
  link: new HttpLink({
    uri: getSubgraphEndpoint(CHAIN_ID, 'moigye'),
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    query: { fetchPolicy: 'network-only' },
  },
})
