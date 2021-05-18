import moment from "moment";
import Index from "../../data/models/Index";

// TODO: chua kiem tra input

const addIndex = async ({measureAt, index, patientId, createdBy, updatedBy, tags, note}) => {
  const now = +moment().format('X');
  try {
    await Index.create({
      updatedAt: now,
      createdAt: now,
      measureAt,
      updatedBy,
      createdBy,
      tags,
      patientId,
      index,
      note
    })
    return true;
  } catch (e) {
    return false;
  }
};

export const updateIndex = async ({updatedBy, indexId ,measureAt, index, note}) => {
  const now = +moment().format('X');
  try {
    await Index.findOneAndUpdate({
      _id: indexId
    }, {
      $set: {
        ...(measureAt && { measureAt }),
        ...(index && { index }),
        ...(note && { note }),
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
