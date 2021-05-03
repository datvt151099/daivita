/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import getPatients from "./getPatients";
import checkPermission from "../user/checkPermission";
import Index from "../../data/models/Index";
import addIndex, {updateIndex} from "./addIndex";
import updateHealth from "./updateHealth";
import Health from "../../data/models/Health";

const router = new Router();

router.post('/get-patients', async (req, res) => {
  const result = await getPatients(req.user._id);
  res.send(result);
});

router.post('/set-special-patient', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const { patientId, special } = req.body;
  const isMatch = await checkPermission(req.user._id, patientId);
  if (isMatch) {
    await Health.findOneAndUpdate({
      userId: patientId
    }, {
      $set: {
        special: Boolean(special)
      }
    })

    result.status = true;
    result.message = 'Đánh dấu thành công!';
  }

  res.send(result);
});

router.post('/add-index', async (req, res) => {
  const result = {
    status: false,
    message: ''
  };
  const updatedBy = req.user._id;
  const { measureAt, index, patientId = updatedBy, note } = req.body;
  const isMatch = await checkPermission(updatedBy, patientId);
  if (isMatch) {
    await addIndex({
      measureAt,
      index,
      userId: patientId,
      updatedBy,
      note
    });
    await updateHealth(patientId);
    result.status = true;
    result.message = 'Thêm chỉ số thành công!'
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
    result.message = 'Cập nhập thành công!'
  }
  res.send(result);
});

export default router;
