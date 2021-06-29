import Promise from "bluebird";
import moment from "moment";
import * as _ from "lodash";
import {getNote} from "../relationship/setRelationship";
import User from "../../data/models/User";
import Prescription from "../../data/models/Prescription";
import Index from "../../data/models/Index";
import Meal from "../../data/models/Meal";
// eslint-disable-next-line import/named
import {formatUserData, rounding} from "../helpers";
import {dataTypes, indexThreshold, reportTypes, roles} from "../../constants";
import Health from "../../data/models/Health";

export const getHealthInfo = async ({userId, patientId, lowIndex, highIndex}) => {
  const [
    note,
    user,
    prescription = [],
    indexData,
    mealData
  ] = await Promise.all([
      getNote({actionUserId: userId, userTwoId: patientId}),
      User.findOne({_id: patientId}),
      Prescription
        .find({patientId})
        .sort({createdAt: -1})
        .limit(1),
      Index
        .find({
          patientId,
          measureAt: {
            $gte: +moment().subtract(6, 'days').startOf('day').format('X'),
            $lte: +moment().endOf('day').format('X')
          }
        }, {
          measureAt: true,
          measureDate: true,
          index: true,
          note: true,
          tag: true
        })
        .sort({measureAt: -1}),
      Meal
        .find({
          patientId,
          eatAt: {
            $gte: +moment().subtract(6, 'days').startOf('day').format('X'),
            $lte: +moment().endOf('day').format('X')
          }
        }, {
          eatAt: true,
          eatDate: true,
          food: true,
          note: true,
          tag: true
        })
        .sort({eatAt: -1})
  ])
  const currentIndex = indexData ? indexData[0] : {};
  const avgIndex = _.meanBy(indexData, 'index');
  const data = {
    user: formatUserData({
      note,
      ...JSON.parse(JSON.stringify(user)),
    }),
    health: {
      currentIndex: currentIndex ? currentIndex.index : null,
      avgIndex: rounding(avgIndex),
      lowIndex,
      highIndex,
      mealData: {
        total: _.uniqBy(mealData, 'eatDate').length,
        items: mealData
      },
      indexData: {
        total: _.uniqBy(indexData, 'measureDate').length,
        items: indexData
      },
    },
    prescription: prescription[0]
  };
  return data;
};

const getPipeline = (patientId, days, type) => {
  const dateFilter = {
    $gte: +moment().subtract(days, 'day').startOf('day').format('X'),
    $lte: +moment().endOf('day').format('X')
  }
  return [
    {
      $match: {
        patientId,
        ...(type === dataTypes.index ? {
          measureAt: dateFilter
        } : {
          eatAt: dateFilter
        })
      }
    }, {
      $project: {
        day: type === dataTypes.index ? '$measureDate' : '$eatDate',
        time: type === dataTypes.index ? '$measureAt' : '$eatAt',
        value: type === dataTypes.index ? '$index' : '$food',
        note: true,
        tag: true,
        image: true,
        type,
      }
    }
  ]
}

export const getHealthLogs = async ({patientId, days, type}) => {
  const [indexData, mealData] = await Promise.all([
    Index.aggregate(getPipeline(patientId, days, dataTypes.index)),
    Meal.aggregate(getPipeline(patientId, days, dataTypes.meal))
  ]);

  const items = _.concat((type === dataTypes.all || type === dataTypes.index) ? indexData : [],
    (type === dataTypes.all || type === dataTypes.meal) ? mealData : [],
  )

  const groups = _.groupBy(items, 'day');
  const data = Object.entries(groups).map(([key, value]) => {
    const date = moment(key);
    const title = date.isSame(moment(), 'day') ? 'Hôm nay' : `${date.date()} th${date.month() + 1}, ${date.year()}`;
    return {
      title,
      key,
      items: value
    }
  });

  return _.orderBy(data, ['key'], ['desc']);
};

const getPiaChartData = async (patientId, startDate, endDate, lowIndex, highIndex) => {
  const data = await Index.aggregate([{
    $match: {
      patientId,
      measureAt: {
        $gte: +moment(startDate).startOf('day').format('X'),
        $lte: +moment(endDate).endOf('day').format('X')
      }
    },
  }, {
    $group: {
      _id: null,
      totalHigh: {
        $sum: {
          $cond: [
            {
              $gte: ['$index', highIndex]
            }, 1, 0],
        },
      },
      totalLow: {
        $sum: {
          $cond: [
            {
              $lte: ['$index', lowIndex]
            }, 1, 0],
        },
      },
      totalNormal: {
        $sum: {
          $cond: [
            {
              $and: [{
                $lt: ['$index', highIndex]
              }, {
                $gt: ['$index', lowIndex]
              }],
            }, 1, 0],
        },
      },
    }
  }, {
    $project: {
      _id: false,
      totalNormal: true,
      totalHigh: true,
      totalLow: true,
      highIndex,
      lowIndex
    }
  }]).allowDiskUse(true);
  const result = data[0];
  if (result) {
    result.lowIndex = lowIndex;
    result.highIndex = highIndex;
  }
  return result;
}

const getIndexData = (patientId, startDate, endDate) => {
  return Index
    .find({
      patientId,
      measureAt: {
        $gte: +moment(startDate).startOf('day').format('X'),
        $lte: +moment(endDate).endOf('day').format('X')
      }
    }, {
      measureAt: true,
      measureDate: true,
      index: true,
      note: true,
      tag: true
    })
    .sort({measureAt: -1})
};

const getMealData = async (patientId, startDate, endDate) => {
  return Meal
    .find({
      patientId,
      eatAt: {
        $gte: +moment(startDate).startOf('day').format('X'),
        $lte: +moment(endDate).endOf('day').format('X')
      }
    }, {
      eatAt: true,
      eatDate: true,
      food: true,
      note: true,
      tag: true
    })
    .sort({eatAt: -1})
}
const getLineChartData = async (patientId, startDate, endDate, lowIndex, highIndex) => {
  const [indexData, mealData] = await Promise.all([
    getIndexData(patientId, startDate, endDate),
    getMealData(patientId, startDate, endDate),
  ]);

  if (!mealData && !indexData) return null;
  return {
    mealData,
    indexData,
    lowIndex,
    highIndex,
  };
}

const getComparisonChartData = async (patientId, startDate1, endDate1, startDate2, endDate2, lowIndex, highIndex) => {
  const [indexData1, indexData2] = await Promise.all([
    getIndexData(patientId, startDate1, endDate1),
    getIndexData(patientId, startDate2, endDate2),
  ])
  if (!indexData1 && !indexData2) return null;
  return {
    lowIndex,
    highIndex,
    indexData1,
    indexData2,
  };
}

export const getHealthReport = async ({ patientId, startDate, endDate, startDate1, endDate1, reportType, lowIndex, highIndex}) => {
  switch (reportType) {
    case reportTypes.lineChart:
      return  getLineChartData(patientId, startDate, endDate, lowIndex, highIndex);
    case reportTypes.pieChart:
      return getPiaChartData(patientId, startDate, endDate, lowIndex, highIndex);
    case reportTypes.comparisonChart:
      return getComparisonChartData(patientId, startDate, endDate, startDate1, endDate1, lowIndex, highIndex);
    default:
      return null;
  }
}

export const getHealthOverview = async (patientId, lowIndex, highIndex) => {
  const health = await Health.findOne({patientId}, {
    _id: 0,
    currentIndex: 1,
    steps: 1,
    heartRate: 1,
    weight: 1,
    symptoms: 1,
    measureAt: 1,
    patientId: 1,
    avgIndex: 1
  });
  return health ? {
    ...JSON.parse(JSON.stringify(health)),
    lowIndex,
    highIndex,
  } : null;
}

export const getIndexThreshold = async (user, patientId) => {
  if (user.role === roles.doctor) {
    const { highIndex = indexThreshold.high, lowIndex =indexThreshold.low, _id } = user || {};
    return {
      highIndex,
      lowIndex,
      doctorId: _id
    }
  }
  const patient = await User.findOne({_id: patientId});
  const doctor = await User.findOne({_id: patient.myDoctorId})
  const { highIndex = indexThreshold.high, lowIndex = indexThreshold.low } = doctor || {};
  return {
    highIndex,
    lowIndex,
    doctorId: patient.myDoctorId,
  }
}


export default getHealthInfo;
