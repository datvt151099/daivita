import * as _ from "lodash";
import User from "../models/User";
import Paper from "../models/Paper";

export const addUser = async (root, {input}) => {
  const { phone, name, email} = input;
  const user = await User.findOne({phone});

  if (!user) return {
    status: false,
    message: 'Tài khoản đã tồn tại'
  };

  await User.create({
    phone,
    name,
    email,
  })

  return {
    status: true,
    message: 'Thêm tài khoản thành công'
  };
}

export const addPaper = async (root, args) => {
  const { title, body, background, type, role} = args;
  try {
    await Paper.create({
      title,
      body,
      background,
      type,
      role: _.toNumber(role)
    })
    return true;
  } catch (e) {
   return false;
  }
}

export const removePaper = async (root, args) => {
  const { id } = args;
  try {
    await Paper.deleteOne({
      _id: id
    })
    return true;
  } catch (e) {
    return false;
  }
}

export const editPaper = async (root, args) => {
  const { title, body, background, type, role, id} = args;
  try {
    await Paper.findOneAndUpdate({_id: id},
      {
        $set: {
          title,
          body,
          background,
          type,
          role: _.toNumber(role)
        }
    })
    return true;
  } catch (e) {
    return false;
  }
}

export default addUser;
