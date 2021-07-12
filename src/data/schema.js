import { makeExecutableSchema } from 'graphql-tools';
import { merge } from 'lodash';
import type from './graphql/type.graphql';
import * as user from './graphql/schema';

const RootQuery = [
  `
  type RootQuery {
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

const SchemaDefinition = [
  `
  schema {
    query: RootQuery
    mutation: Mutation
  }
`,
];

const resolvers = merge(
  user.resolvers,
);

const typeDefs = [
  type,
  ...user.schema,
  ...SchemaDefinition,
  ...RootQuery,
  ...Mutation,
]

export default makeExecutableSchema({
  typeDefs,
  resolvers,
  // schemaDirectives: directives,
  ...(__DEV__ ? { log: e => console.error(e.stack) } : {}),
});
