import moment from "moment";
import Index from "../../data/models/Index";
import Meal from "../../data/models/Meal";
import {dataTypes} from "../../constants";
import {rounding, startTransaction} from "../helpers";
import updateHealth from "./updateHealth";
import mongoose from "../../data/mongoose";


const editLog = async ({updatedBy, logId, tag, type, note, image, value, time}) => {
  const now = +moment().format('X');
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    if ( type === dataTypes.index ) {
      await Index.findOneAndUpdate({
        _id: logId
      }, {
        $set: {
          ...(time && {
            measureAt: time,
            measureDate: moment(time, 'X').format('YYYY-MM-DD'),
          }),
          ...(value && { index: rounding(value) }),
          ...(note && { note }),
          ...(tag && { tag }),
          ...(image && { image }),
          updatedAt: now,
          updatedBy
        }
      })
      const { patientId } = await Index.findOne({_id: logId}) || {};
      if (patientId) await updateHealth(patientId);
    } else {
      await Meal.findOneAndUpdate({
        _id: logId
      }, {
        $set: {
          ...(time && {
            eatAt: time,
            eatDate: moment(time, 'X').format('YYYY-MM-DD'),
          }),
          ...(value && { food: value }),
          ...(note && { note }),
          ...(tag && { tag }),
          ...(image && { image }),
          updatedAt: now,
          updatedBy
        }
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

export default editLog;


