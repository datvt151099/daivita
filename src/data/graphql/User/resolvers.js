import User from "../../models/User";

export const getUsers = () => User.find({});

export const getUser = (root, {id}) => User.findOne({ _id: id});
