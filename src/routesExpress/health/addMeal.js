import moment from "moment";
import Meal from "../../data/models/Meal";

// TODO: chua kiem tra input

const addMeal = async ({patientId, createdBy, updatedBy, tag, time, value, note}) => {
  const now = +moment().format('X');
  try {
    await Meal.create({
      updatedAt: now,
      createdAt: now,
      updatedBy,
      createdBy,
      eatAt: time,
      eatDate: moment(time, 'X').format('YYYY-MM-DD'),
      food: value,
      patientId,
      tag,
      note
    })
    return true;
  } catch (e) {
    return false;
  }
};

export const editMeal = async ({updatedBy, id, tag, time, value, note}) => {
  const now = +moment().format('X');
  try {
    await Meal.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        ...(time && {
          eatAt: time,
          eatDate: moment(time, 'X').format('YYYY-MM-DD'),
        }),
        ...(value && { food: value }),
        ...(note && { note }),
        ...(tag && { tag }),
        updatedAt: now,
        updatedBy
      }
    })
    return true;
  } catch (e) {
    return false;
  }
}

export default addMeal;
