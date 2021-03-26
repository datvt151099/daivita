import type from './type.graphql';
import {getUsers, getUser} from "./resolvers";
import {addUser} from "./mutations";

export const schema = [type];

export const queries = [
  'getUsers: [User]',
  'getUser(id: String!): User',
];

export const mutations = [
  'addUser(input: UserInfo): Status',
];

export const resolvers = {
  RootQuery: {
    getUsers,
    getUser,
  },
  Mutation: {
    addUser,
  },
};
