/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import moment from "moment";
import Prescription from "../../data/models/Prescription";

const router = new Router();

router.post('/create-prescription', async (req, res) => {
  const {
    patientId,
    medicines,
    note,
  } = req.body;
  const createdBy = req.user._id;

  const now = +moment().format('X');
  await Prescription.create({
    createdAt: now,
    updatedAt: now,
    createdBy,
    patientId,
    medicines,
    note,
  })

  res.send({
    status: true,
    message: 'Tạo đơn thuốc thành công!'
  });
});

router.post('/update-prescription', async (req, res) => {
  const {
    medicines,
    note,
    id,
  } = req.body;
  await Prescription.findOneAndUpdate({ _id: id},
    {
      $set: {
        ...(note && {note}),
        ...(medicines && medicines),
        updatedAt: +moment().format('X')
      }
    })

  res.send({
    status: true,
    message: 'Cập nhập đơn thuốc thành công!'
  });
});

router.post('/get-history-prescription', async (req, res) => {
  const {
    patientId
  } = req.body;
  const data = await Prescription.find({
    patientId
  }).sort({ createdAt: -1 })

  res.send({
    status: true,
    data,
  });
});

export default router;
