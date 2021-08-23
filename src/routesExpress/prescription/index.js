/* eslint-disable no-console, consistent-return */
import { Router } from 'express';
import moment from "moment";
import Prescription from "../../data/models/Prescription";
import User from "../../data/models/User";

const router = new Router();

router.post('/create-prescription', async (req, res) => {
  const {
    patientId,
    diagnose,
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
      diagnose,
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
    diagnose,
    note,
    prescriptionId,
  } = req.body;
  try {
    await Prescription.findOneAndUpdate({ _id: prescriptionId},
      {
        $set: {
          ...(note && {note}),
          ...(medicines && { medicines }),
          ...(diagnose && { diagnose }),
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
    patientId = req.user._id
  } = req.body;
  try {
    const data = await Prescription.aggregate([
      {
        $match: {
          patientId
        }
      },
      {
        $lookup: {
          let: {
            userId: {
              "$toObjectId": '$createdBy'
            }
          },
          from: "user",
          pipeline: [{
            "$match": {
              "$expr": {
                "$eq": ["$_id", "$$userId"]
              }
            }
          }],
          as: "user"
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: {
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          creatorName: '$user.fullName',
          patientId: true,
          diagnose: true,
          medicines: true,
          note: true,
        }
      }
    ])

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

router.post('/get-prescription', async (req, res) => {
  const {
    patientId = req.user._id
  } = req.body;
  try {
    const data = await Prescription
      .find({patientId})
      .sort({createdAt: -1})
      .limit(1);

    const prescription = data ? data[0] : null;
    if (prescription) {
      const doctor = await User.findOne({_id: prescription.createdBy});
      prescription.creatorName = doctor.fullName;
    }

    res.send({
      status: true,
      data: data ? data[0] : null
    });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }
});

export default router;
