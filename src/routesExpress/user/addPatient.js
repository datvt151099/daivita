import moment from "moment";
import Promise from "bluebird";
import User from "../../data/models/User";
import {roles} from "../../constants";
import Health from "../../data/models/Health";
import editUserInfo from "./editUser";
import {setNote} from "../relationship";
import mongoose from "../../data/mongoose";
import {startTransaction} from "../helpers";

const addPatient = async ({ actionUserId,
                            phone,
                            note,
                            fullName,
                            diseaseType,
                            birth,
                            avatar,
                            sex}) => {
  let result = false;
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    const user = await User.findOne({phone});
    if (user && user.role === roles.patient) {
      if (!user.inAccount) {
        await editUserInfo({
          userId: user._id,
          fullName,
          diseaseType,
          birth,
          sex,
          role: roles.patient,
          avatar
        })
      }
      await setNote({
        actionUserId,
        userTwoId: user._id,
        note,
      });
      result = true;
    } else if (!user) {
      const patient = new User({
        fullName,
        createdBy: actionUserId,
        diseaseType,
        inAccount: false,
        role: roles.patient,
        birth,
        age: moment().diff(birth, 'years'),
        avatar,
        sex,
        phone,
        password: 'password',
      });
      await Promise.all([
        patient.save(),
        Health.create({
          createdAt: +moment().format('X'),
          patientId: patient._id,
          age: moment().diff(birth, 'years'),
          diseaseType,
          fullName,
          avatar,
        }),
        setNote({
          actionUserId,
          userTwoId: patient._id,
          note,
        })
      ])
      result = true;
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
  return result;
};

export default addPatient;
