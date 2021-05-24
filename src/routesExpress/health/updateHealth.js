import * as _ from "lodash";
import moment from "moment";
import Index from "../../data/models/Index";
import Health from "../../data/models/Health";
import {indexThreshold} from "../../constants";

const getStatus = (index) => {
  if (!index)
    return null
  if (index <= indexThreshold.low)
    return 1;
  if (index >= indexThreshold.high)
    return 3;
  return 2;
};

const getPriority = (index) => {
  return Math.abs(index - (indexThreshold.high + indexThreshold.low) / 2);
};

const updateHealth = async ( patientId ) => {
  const indexes = await Index.find({
    patientId,
    measureAt: {
      $gte: +moment().subtract(7, 'day').startOf('day').format('X'),
      $lte: +moment().endOf('day').format('X')
    }
  }).sort( { measureAt: -1 }) || [];

  // console.log(indexes);
  // if (indexes?.length === 0) return false;

  const itemOne = indexes[0] || {};
  const {measureAt, index} = itemOne;
  const avgIndex = _.meanBy(indexes, 'index') || null;

  await Health.findOneAndUpdate({
    patientId
  }, {
    $set: {
      currentIndex: index,
      avgIndex,
      measureAt,
      status: getStatus(index),
      priority: getPriority(index),
    }
  })

  // 1621179321
  return true;
}

export default updateHealth;
