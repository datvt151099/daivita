/* eslint-disable no-console, consistent-return */
import {Router} from 'express';
import moment from "moment";
import * as _ from 'lodash';
import Notification from "../../data/models/Notification";

const router = new Router();

const ROWS_PER_PAGE = 10;

router.post('/get-notifications', async (req, res) => {
  const { page = 1,  rowsPerPage = ROWS_PER_PAGE } = req.body || {};
  const offset = (page - 1) * rowsPerPage;
  const data = await Notification.find({
    toUserId: req.user._id,
  }, {
    _id: 1,
    createdAt: 1,
    status: 1,
    notification: 1,
    type: 1,
    payload: 1,
    isValid: 1
  }).sort({
    createdAt: -1
  })
    .skip(offset)
    .limit(rowsPerPage);


  res.send({
    status: true,
    data: _.map(data, i => {
      const item = JSON.parse(JSON.stringify(i));
      item.payload = JSON.parse(item.payload);
      return item;
    })
  });
});

router.post('/read-notification', async (req, res) => {
  const {
    _id,
  } = req.body;
  await Notification.findOneAndUpdate({ _id },
    {
      $set: {
        status: true,
        updatedAt: +moment().format('X')
      }
    })

  res.send({
    status: true,
    message: 'Thành công!'
  });
});


export default router;
