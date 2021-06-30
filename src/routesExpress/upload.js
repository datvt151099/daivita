/* eslint-disable no-console, consistent-return */
import {Router} from 'express';
import stream from 'stream';
import { uuid } from 'uuidv4';
import admin from "../firebaseAdmin";

const router = new Router();

router.post('/image', async (req, res) => {
  const { base64Image } = req.body || {};
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(Buffer.from(base64Image, 'base64'));
    const id = uuid();
    const fileName = `${id}.jpg`

    const bucket = admin.storage().bucket();

    // Upload the image to the bucket
    const file = bucket.file(`images/${  fileName}`);
    bufferStream.pipe(file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          custom: 'metadata',
          firebaseStorageDownloadTokens: id
        }
      },
      public: true,
      validation: "md5"
    }))
      .on('error', function(err) {
        res.send({
          status: false,
          message: JSON.stringify(err.message),
        });
      })
      .on('finish', function() {
        file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491'
        }, function(err, url) {
          if (err) {
            res.send({
              status: false,
              message: JSON.stringify(err.message),
            });
          } else {
            res.send({
              status: true,
              message: '',
              data: url
            });
          }
        });
      });
  } catch (e) {
    res.send({
      status: false,
      message: JSON.stringify(e.message),
    });
  }

});

export default router;
