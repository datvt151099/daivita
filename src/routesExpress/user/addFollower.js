import moment from "moment";
import Promise from "bluebird";
import User from "../../data/models/User";
import {followTypes, notifyTypes, relationalStatus, roles} from "../../constants";
import Health from "../../data/models/Health";
import editUserInfo from "./editUser";
import setRelationship, {setNote} from "../relationship/setRelationship";
import mongoose from "../../data/mongoose";
import {startTransaction} from "../helpers";
import Notification from "../../data/models/Notification";


const addPatient = async ({
                            actionUserName,
                            actionUserId,
                            phone,
                            note,
                            fullName,
                            diseaseType,
                            birth,
                            avatar,
                            sex
}) => {
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
    } else {
      const title = "Yêu cầu theo dõi";
      const body = `Bác sĩ ${actionUserName} muốn được thêm bạn vào danh sách theo dõi`;
      const payload = JSON.stringify({
        userId: actionUserId
      });
      const now = +moment().format('X');
      await Notification.create({
        createdAt: now,
        fromUserId: actionUserId,
        toUserId: user._id,
        status: false,
        notification: {
          title,
          body
        },
        type: notifyTypes.follow,
        payload
      })
    }
    // TODO: sửa lại sau khi có app bệnh nhân
    await setNote({
      actionUserId,
      userTwoId: user._id,
      note,
      inAccount: user.inAccount,
    });
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
        inAccount: false
      })
    ])
  }
};

const addFollower = async ({
                             actionUserId,
                             actionUserName,
                             userId,
                             type,
}) => {

  const title = "Yêu cầu theo dõi";
  const body = `${actionUserName} muốn được thêm vào danh sách theo dõi của bạn`;
  const payload = JSON.stringify({
    userId: actionUserId
  });
  const now = +moment().format('X');
  await Promise.all([
    setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.pending
    }),
    User.findOneAndUpdate({
      _id: actionUserId,
    }, {
      $set: {
        ...(type === followTypes.doctor && {
          myDoctorId: userId
        })
      }
    }),
    Notification.create({
      createdAt: now,
      fromUserId: actionUserId,
      toUserId: userId,
      status: false,
      notification: {
        title,
        body
      },
      type: notifyTypes.follow,
      payload
    })
    ]);
}

export default async ({
                                    actionUserId,
                                    actionUserName,
                                    userId,
                                    phone,
                                    note,
                                    fullName,
                                    diseaseType,
                                    birth,
                                    avatar,
                                    sex,
                                    type
                                  }) => {
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    if (type === followTypes.patient) {
      await addPatient({
        actionUserId,
        actionUserName,
        phone,
        note,
        fullName,
        diseaseType,
        birth,
        avatar,
        sex,
      })
    } else {
      await addFollower({
        actionUserId,
        actionUserName,
        userId,
        type
      })
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
