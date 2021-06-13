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
  const creatorName = req.user.fullName;
  const now = +moment().format('X');
  try {
    await Prescription.create({
      createdAt: now,
      updatedAt: now,
      createdBy,
      creatorName,
      patientId,
      medicines,
      note,
    })
    res.send({
      status: true,
      message: 'Tạo đơn thuốc thành công!'
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }
});

router.post('/edit-prescription', async (req, res) => {
  const {
    medicines,
    note,
    prescriptionId,
  } = req.body;
  try {
    await Prescription.findOneAndUpdate({ _id: prescriptionId},
      {
        $set: {
          ...(note && {note}),
          ...(medicines && { medicines }),
          updatedAt: +moment().format('X')
        }
      })

    res.send({
      status: true,
      message: 'Cập nhật đơn thuốc thành công!'
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }
});

router.post('/get-prescription-history', async (req, res) => {
  const {
    patientId
  } = req.body;
  try {
    const data = await Prescription.find({
      patientId
    }).sort({ createdAt: -1 })

    res.send({
      status: true,
      data,
    });
  } catch (e) {
      res.send({
        status: false,
        message: JSON.stringify(e.message),
      });
    }
});

export default router;
