import User from "../../models/User";

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

export default addUser;
