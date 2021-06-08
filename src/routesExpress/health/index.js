/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import * as _ from "lodash";
import moment from "moment";
import Promise from 'bluebird';
import Index from "../../data/models/Index";
import addIndex, {editIndex} from "./addIndex";
import updateHealth from "./updateHealth";
import User from "../../data/models/User";
import {dataTypes, indexThreshold, reportTypes, roles} from "../../constants";
import addMeal, {editMeal} from "./addMeal";
import Prescription from "../../data/models/Prescription";
import Meal from "../../data/models/Meal";
import Relationship from "../../data/models/Relationship";
import {genNotification} from "../notification";

const router = new Router();

router.post('/add-log', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const createdBy = req.user._id;
  const { time = +moment().format('X'), value, patientId = createdBy, note, tag, type } = req.body;
  if ( type === dataTypes.index ) {
    await addIndex({
      time,
      value,
      patientId,
      createdBy,
      updatedBy: createdBy,
      tag,
      note
    });

    await updateHealth(patientId);
    await genNotification({userId: patientId, measureAt: time, index: _.toNumber(value)});
  } else {
    await addMeal({
      time,
      value,
      patientId,
      createdBy,
      updatedBy: createdBy,
      tag,
      note
    })
  }
  result.status = true;
  result.message = 'Thêm thành công!'
  res.send(result);
});

router.post('/edit-log', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const updatedBy = req.user._id;
  const { logId, tag, type, note, value, time } = req.body;
  if ( type === dataTypes.index ) {
    await editIndex({
      time,
      value,
      tag,
      note,
      updatedBy,
      id: logId,
    });
    const { patientId } = await Index.findOne({_id: logId}) || {};
    if (patientId) await updateHealth(patientId);
  } else {
    await editMeal({
      time,
      value,
      updatedBy,
      id: logId,
      tag,
      note
    })
  }
  result.status = true;
  result.message = 'Cập nhập thành công!'
  res.send(result);
});

router.post('/get-health-info', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const { patientId } = req.body;
  const { lowIndex = indexThreshold.low, highIndex = indexThreshold.high } = req.user;

  const [
    relationship,
    user
  ] = await Promise.all([
    Relationship.findOne( {
      $or: [
        { userOneId: req.user._id, userTwoId: patientId },
        { userOneId: patientId, userTwoId: req.user._id }
      ]
    }),
    User.findOne({_id: patientId, role: roles.patient})
  ])
  if (!user || !relationship) {
    result.message = 'Không tồn tại!';
  } else {
    const note = relationship.userOneId === req.user._id ? relationship.noteUserOne : relationship.noteUserTwo;
    const [prescription = [], indexData, mealData ] = await Promise.all([
      Prescription
        .find({patientId})
        .sort({createdAt: -1})
        .limit(1),

      Index
        .find({
          patientId,
          measureAt: {
            $gte: +moment().subtract(7, 'days').startOf('day').format('X'),
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
            $gte: +moment().subtract(7, 'days').startOf('day').format('X'),
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
    result.data = {
      user: _.omit({
        note,
        ...JSON.parse(JSON.stringify(user)),
      }, ['password', 'firebaseId']),
      health: {
        currentIndex: currentIndex ? currentIndex.index : null,
        avgIndex: Math.round(avgIndex * 10) / 10,
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
    }
    result.status = true;
  }
  res.send(result);
});

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
        type,
      }
    }
  ]
}
router.post('/get-health-logs', async (req, res) => {
  const { patientId, days, type = dataTypes.all } = req.body;
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
    const title = date.isSame(moment(), 'day') ? 'Hôm nay' : `${date.date()} th${date.month()}, ${date.year()}`;
    return {
      title,
      key,
      items: value
    }
  })

  res.send({
    status: true,
    data: _.orderBy(data, ['key'], ['desc'])
  });
});

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
  console.log(data, result);
  return result;
}

router.post('/get-health-report', async (req, res) => {
  const { patientId, startDate, endDate, reportType = reportTypes.lineChart } = req.body;

  const { lowIndex = indexThreshold.low, highIndex = indexThreshold.high } = req.user;

  let data;
  switch (reportType) {
    case reportTypes.lineChart:
      data = {};
      break;
    case reportTypes.pieChart:
      data = await getPiaChartData(patientId, startDate, endDate, lowIndex, highIndex);
      break;
    case reportTypes.comparisonChart:
      data = {}
      break;
    default:
      data = {}
      break;
  }

  res.send({
    status: true,
    data
  });
});

export default router;

