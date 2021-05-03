import User from "../../data/models/User";

const getUser = (phone) => User.findOne({phone});

export default getUser;
