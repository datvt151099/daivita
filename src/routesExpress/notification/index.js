/* eslint-disable no-console, consistent-return */
import {Router} from 'express';
import moment from "moment";
import * as _ from 'lodash';
import Promise from 'bluebird';
import Notification from "../../data/models/Notification";

const router = new Router();

const ROWS_PER_PAGE = 15;

router.post('/get-notifications', async (req, res) => {
  const { page = 1,  rowsPerPage = ROWS_PER_PAGE } = req.body || {};
  const offset = (page - 1) * rowsPerPage;
  try {
    const [total, items] = await Promise.all([
      Notification.count({toUserId: req.user._id}),
      Notification.find({
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
        .limit(rowsPerPage)
    ])

    res.send({
      status: true,
      // data: _.map(items, i => {
      //   const item = JSON.parse(JSON.stringify(i));
      //   item.payload = JSON.parse(item.payload);
      //   return item;
      // }),
      data: {
        total,
        totalPage: Math.ceil(total / rowsPerPage),
        items: _.map(items, i => {
          const item = JSON.parse(JSON.stringify(i));
          item.payload = JSON.parse(item.payload);
          return item;
        })
      }
    });
  } catch (e) {
  res.send({
    status: false,
    message: JSON.stringify(e.message),
  });
}

});

router.post('/read-notification', async (req, res) => {
  const {
    _id,
  } = req.body;
  try {
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
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }
});


export default router;
