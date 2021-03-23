import types from './type.graphql';

export const schema = [types];

export const queries = [
  'getUsers: [User]',
  'user(id: String!): User',
];

export const mutations = [
  'addUser(input: UserInfo): Boolean',
];

export const resolvers = {
  Query: {
    getUsers: () => ([{}]),
    user: () => {},
  },
  Mutation: {
    addUser: () => true,
  },
};
