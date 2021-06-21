import moment from "moment";
import * as _ from "lodash";
import Promise from 'bluebird';
import Index from "../../data/models/Index";
import Meal from "../../data/models/Meal";
import {dataTypes} from "../../constants";
import {rounding, startTransaction} from "../helpers";
import mongoose from "../../data/mongoose";
import updateHealth from "./updateHealth";
import genIndexNotification from "../notification/genNotification";

const addLog = async ({patientId, createdBy, updatedBy, tag, time, value, note, type, lowIndex, highIndex}) => {
  const now = +moment().format('X');
  const session = await mongoose.startSession();
  try {
    startTransaction(session);
    if ( type === dataTypes.index ) {
      await Index.create({
        updatedAt: now,
        createdAt: now,
        measureAt: time,
        measureDate: moment(time, 'X').format('YYYY-MM-DD'),
        updatedBy,
        createdBy,
        tag,
        patientId,
        index: rounding(value),
        note
      })

      await Promise.all([
        updateHealth(patientId),
        genIndexNotification({userId: patientId, measureAt: time, index: _.toNumber(value), lowIndex, highIndex})
      ])
    } else {
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
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}


export default addLog;


