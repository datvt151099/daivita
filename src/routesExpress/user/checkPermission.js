import Relationship from "../../data/models/Relationship";
import User from "../../data/models/User";
import {relationalStatus, roles} from "../../constants";

const checkPermission = async (updatedBy, userId) => {
  const isDoctor = await User.findOne({
    _id: updatedBy,
    role: roles.doctor
  })
  if (isDoctor) {
    const relationship = await Relationship.findOne({
      $or: [
        { userOneId: updatedBy, userTwoId: userId},
        { userTwoId: updatedBy, userOneId: userId},
      ],
      status: relationalStatus.accepted,
    })
    if (relationship) return true;
    return false;
  };

  if (updatedBy === userId) return true;
  return false;
};

export default checkPermission;
