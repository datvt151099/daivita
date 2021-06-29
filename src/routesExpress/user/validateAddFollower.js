import User from "../../data/models/User";
import {followTypes, relationalStatus, roles} from "../../constants";
import {formatUserData} from "../helpers";
import Relationship from "../../data/models/Relationship";

const validateAddPatient = async (phone, doctorId) => {
  const result = {
    status: false,
    message: ''
  };
  try {
    const patient = await User.findOne({phone});
    if (!patient) {
      result.status = true;
    } else if (patient.role === roles.doctor) {
      result.message = 'Số điện thoại đã đăng ký tài khoản bác sĩ!';
    } else if (patient.myDoctorId === doctorId) {
        result.status = false;
        result.message = 'Bệnh nhân đã theo dõi!';
    } else if (patient.myDoctorId && patient.myDoctorId !== doctorId) {
        result.status = false;
        result.message = 'Bệnh nhân đã được bác sĩ khác theo dõi!';
    } else {
        result.status = true;
        result.data = formatUserData(patient);
    }
  } catch (e) {
    result.message = JSON.stringify(e.message);
  }
  return result;
}

const validateAddDoctor = async (phone) => {
  const result = {
    status: false,
    message: '',
  };
  try {
    const doctor = await User.findOne({
      phone,
      role: roles.doctor
    });
    if (doctor) {
      result.status = true;
      result.data = formatUserData(doctor);
    } else {
      result.message = 'Tài khoản không tồn tại!'
    }
  } catch (e) {
    result.message = JSON.stringify(e.message);
  }
  return result;
}

const validateAddRelative = async (phone, userId) => {
  const result = {
    status: false,
    message: '',
  };
  try {
    const patient = await User.findOne({
      phone,
      role: roles.patient,
      inAccount: true
    });
    if (patient) {
      const relationship = await Relationship.findOne({
        $or: [
          {userOneId: userId, userTwoId: patient._id},
          {userOneId: patient._id, userTwoId: userId}
        ],
        status: relationalStatus.accepted
      })

      if (relationship) {
        result.message = 'Bệnh nhân đã kết nối!';
      } else {
        result.status = true;
        result.data = formatUserData(patient);
      }
    } else {
      result.message = 'Tài khoản không tồn tại!'
    }
  } catch (e) {
    result.message = JSON.stringify(e.message);
  }
  return result;
};

const validateAddFollower = async ({userId, phone, type}) => {
  switch (type) {
    case followTypes.patient:
      return validateAddPatient(phone, userId);
    case followTypes.doctor:
      return validateAddDoctor(phone, userId);
    case followTypes.relative:
      return validateAddRelative(phone, userId);
    default:
      return {
        status: false,
        message: ''
      };
  }
}

export default validateAddFollower;
