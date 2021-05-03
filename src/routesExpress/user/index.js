/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import setRelationship from "./setRelationship";
import {ERROR_MESSAGE_SERVER, relationalStatus} from "../../constants";
import getUser from "./getUser";

const router = new Router();

router.post('/get-user', async (req, res) => {
  const { phone } = req.body;
  const user = await getUser(phone);
  res.send(user);
});

router.post('/follow', async (req, res) => {
  const { userId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    const status = await setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.pending
    });
    if (status) {
      result.status = true;
      result.message = 'Đã gửi lời theo dõi';
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  };

  res.send(result);
});

router.post('/accept-following', async (req, res) => {
  const { userId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    const status = await setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.accepted
    })
    if (status) {
      result.status = true;
      result.message = 'Đã chấp nhận lời theo dõi';
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  };

  res.send(result);
});

router.post('/decline-following', async (req, res) => {
  const { userId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    const status = await setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.declined
    })
    if (status) {
      result.status = true;
      result.message = 'Từ chối lời theo dõi'
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  };

  res.send(result);
});

router.post('/unfollow', async (req, res) => {
  const { userId } = req.body;
  const actionUserId = req.user._id;
  const result = {
    status: false,
    message: 'Không hợp lệ!'
  };
  try{
    const status = await setRelationship({
      actionUserId,
      userTwoId: userId,
      status: relationalStatus.blocked
    })
    if (status) {
      result.status = true;
      result.message = 'Đã hủy theo dõi';
    }
  } catch (e) {
    result.message = ERROR_MESSAGE_SERVER;
  };

  res.send(result);
});
export default router;
