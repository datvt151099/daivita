import * as _ from "lodash";
import moment from "moment";
import Index from "../../data/models/Index";
import Health from "../../data/models/Health";

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
      measureAt
    }
  })

  // 1621179321
  return true;
}

export default updateHealth;
