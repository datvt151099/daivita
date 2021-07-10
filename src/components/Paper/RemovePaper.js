import React, {useState} from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Tooltip
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {RiDeleteBack2Fill} from "react-icons/ri";
import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {Alert} from "@material-ui/lab";

const MUTATION_REMOVE_PAPER = gql(`
  mutation RemovePaper($id: String) {
    removePaper(id: $id)
  }
`);

// eslint-disable-next-line react/prop-types
const RemovePaper = ({_id, title, callback}) => {
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [severity, setSeverity] = React.useState('success');
  const handleClose = () => {
    setOpen(false);
  }

  const [removePaper] = useMutation(MUTATION_REMOVE_PAPER, {
    variables: {
      id: _id,
    },
    onCompleted: (data) => {
      setOpen(false);
      setOpenAlert(true);
      if (data) {
        if (callback) {
          callback();
        }
      } else {

        setSeverity('error')
      }
    },
    onError: () => {
      setOpen(false);
      setOpenAlert(true);
      setSeverity('error')
    },
  });
  return <div>
    <Tooltip
      title="Xóa bỏ"
      aria-label="delete"
    >
      <div><RiDeleteBack2Fill size={24} color="#DB4F3F" onClick={() => setOpen(true)}/></div>
    </Tooltip>
    <Snackbar open={openAlert} autoHideDuration={1000} onClose={() => setOpenAlert(false)}>
      <Alert onClose={() => setOpenAlert(false)} severity={severity}>
        {severity === 'success' ? 'Thành công!' : 'Thất bại!'}
      </Alert>
    </Snackbar>
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogContent>
        <DialogTitle id="alert-dialog-slide-title" style={{paddingInline: 0}}>
           Xóa bài viết
        </DialogTitle>
        <DialogContentText id="alert-dialog-slide-description">
          Bạn có muốn xóa bài <strong>{title}</strong> ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button className='btnClose' onClick={handleClose} color="primary">
          Quay lại
        </Button>
        <Button className='btnAction' onClick={removePaper} color="primary">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  </div>
}

export default RemovePaper;
