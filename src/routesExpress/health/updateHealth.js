import * as _ from "lodash";
import moment from "moment";
import Index from "../../data/models/Index";
import Health from "../../data/models/Health";

const updateHealth = async ( userId ) => {
  const indexes = await Index.find({
    userId,
    measureAt: {
      $gte: +moment().subtract(7).startOf('day').format('X'),
      $lte: +moment().endOf('day').format('X')
    }
  }).sort( { measureAt: -1 }) || [];

  if (indexes.length === 0) return false;

  const currentIndex = indexes[0].index;
  const avgIndex = _.meanBy(indexes, 'index');

  await Health.findOneAndUpdate({
    userId
  }, {
    $set: {
      currentIndex,
      avgIndex
    }
  })

  return true;
}

export default updateHealth;
