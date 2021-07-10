import type from './type.graphql';
import {getUsers, getUser, getPapers} from "./resolvers";
import {addPaper, addUser, editPaper, removePaper} from "./mutations";

export const schema = [type];

export const queries = [
  'getUsers: [User]',
  'getUser(id: String!): User',
  'getPapers(page: Int!, rowsPerPage: Int, sortBy: String): PaperResult',
];

export const mutations = [
  'addUser(input: UserInfo): Status',
  'addPaper(title: String, body: String, role: Int, type: String, background: String): Boolean',
  'editPaper(id: String, title: String, body: String, role: Int, type: String, background: String): Boolean',
  'removePaper(id: String): Boolean',
];

export const resolvers = {
  RootQuery: {
    getUsers,
    getUser,
    getPapers
  },
  Mutation: {
    addUser,
    addPaper,
    removePaper,
    editPaper
  },
};
