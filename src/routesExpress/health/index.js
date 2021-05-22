/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import * as _ from "lodash";
import moment from "moment";
import Promise from 'bluebird';
import checkPermission from "../user/checkPermission";
import Index from "../../data/models/Index";
import addIndex, {updateIndex} from "./addIndex";
import updateHealth from "./updateHealth";
import User from "../../data/models/User";
import {dataTypes, roles} from "../../constants";
import addMeal from "./addMeal";
import Prescription from "../../data/models/Prescription";
import Meal from "../../data/models/Meal";
import Relationship from "../../data/models/Relationship";

const router = new Router();

router.post('/add-index', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const createdBy = req.user._id;
  const { measureAt, index, patientId = createdBy, note, tags } = req.body;
  const isMatch = await checkPermission(createdBy, patientId);
  if (isMatch) {
    await addIndex({
      measureAt,
      index,
      patientId,
      createdBy,
      updatedBy: createdBy,
      tags,
      note
    });
    await updateHealth(patientId);
    result.status = true;
    result.message = 'Thêm thành công!'
  }
  res.send(result);
});

router.post('/update-index', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const updatedBy = req.user._id;
  const { measureAt, indexId, note, index } = req.body;
  const { userId } = await Index.findOne({ _id: indexId }) || {};
  const isMatch = await checkPermission(updatedBy, userId);
  if (isMatch) {
    await updateIndex({
      updatedBy,
      indexId,
      measureAt,
      index,
      note
    });
    await updateHealth(userId);
    result.status = true;
    result.message = 'Cập nhật thành công!'
  }
  res.send(result);
});

router.post('/add-meal', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const createdBy = req.user._id;
  const { eatAt, food, patientId = createdBy, note, tags } = req.body;
  const isMatch = await checkPermission(createdBy, patientId);
  if (isMatch) {
    await addMeal({
      eatAt,
      food,
      patientId,
      createdBy,
      updatedBy: createdBy,
      note,
      tags
    });
    result.status = true;
    result.message = 'Thêm thành công!'
  }
  res.send(result);
});

router.post('/get-health-info', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const { patientId } = req.body;

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
          index: true,
          note: true,
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
          food: true,
          note: true,
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
        avgIndex,
        mealData,
        indexData,
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
        tags: true,
        type,
      }
    }
  ]
}
router.post('/get-health-diary', async (req, res) => {
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

export default router;

