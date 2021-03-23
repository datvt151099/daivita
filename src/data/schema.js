import { makeExecutableSchema } from 'graphql-tools';
import { merge } from 'lodash';
import * as user from './graphql/User/schema';

const Query = [
  `
  type Query {
    ${user.queries}
  }
  `
]

const Mutation = [
  `
  type Mutation {
    ${user.mutations}
  }
  `
]

const resolvers = merge(
  user.resolvers,
);

const typeDefs = [
  ...user.schema,
  ...Query,
  ...Mutation,
]

export default makeExecutableSchema({
  typeDefs,
  resolvers,
  // schemaDirectives: directives,
  ...(__DEV__ ? { log: e => console.error(e.stack) } : {}),
});
