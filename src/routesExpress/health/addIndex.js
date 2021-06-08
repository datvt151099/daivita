import moment from "moment";
import * as _ from "lodash";
import Index from "../../data/models/Index";

const addIndex = async ({patientId, createdBy, updatedBy, tag, time, value, note}) => {
  const now = +moment().format('X');
  try {
    await Index.create({
      updatedAt: now,
      createdAt: now,
      measureAt: time,
      measureDate: moment(time, 'X').format('YYYY-MM-DD'),
      updatedBy,
      createdBy,
      tag,
      patientId,
      index: Math.round(_.toNumber(value) * 10) / 10,
      note
    })
    return true;
  } catch (e) {
    return false;
  }
};

export const editIndex = async ({updatedBy, id , time, value, note, tag}) => {
  const now = +moment().format('X');
  try {
    await Index.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        ...(time && {
          measureAt: time,
          measureDate: moment(time, 'X').format('YYYY-MM-DD'),
        }),
        ...(value && { index: Math.round(_.toNumber(value) * 10) / 10 }),
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

export default addIndex;
