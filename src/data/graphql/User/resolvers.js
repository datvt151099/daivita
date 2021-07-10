import * as _ from "lodash";
import Promise from "bluebird";
import User from "../../models/User";
import Paper from "../../models/Paper";

export const getUsers = () => User.find({});

export const getUser = (root, {id}) => User.findOne({ _id: id});

export const getPapers = async (root, args) => {
  const { page = 1,  rowsPerPage = 20, sortBy } = args || {};
  const offset = (page - 1) * rowsPerPage;
  let sortQuery = {
    type: -1,
  };

  if (sortBy) {
    let sort = JSON.parse(decodeURI(sortBy));
    sort = _.mapValues(sort, (val) => (val === false ? -1 : 1));

    sortQuery = {
        ...sort,
    };
  }
  const [total, items] = await Promise.all([
    Paper.count({}),
    Paper.find({})
      .sort(sortQuery)
      .skip(offset)
      .limit(rowsPerPage)
  ])

  return {
    total,
    items,
  }
}
