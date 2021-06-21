import * as _ from "lodash";
import moment from "moment";
import Index from "../../data/models/Index";
import Health from "../../data/models/Health";
import {indexThreshold} from "../../constants";

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

  const itemOne = indexes[0] || {};
  const {measureAt, index} = itemOne;
  const avgIndex = _.meanBy(indexes, 'index') || null;

  await Health.findOneAndUpdate({
    patientId
  }, {
    $set: {
      currentIndex: index,
      avgIndex: Math.round(avgIndex * 10) / 10,
      measureAt,
      priority: getPriority(index),
    }
  })

  return true;
}

export default updateHealth;
