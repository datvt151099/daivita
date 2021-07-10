import React, {useState} from 'react';
import {
  Box, Dialog,
  Tooltip, Typography
} from "@material-ui/core";
import { AiFillEye } from 'react-icons/ai';
import {withStyles} from "@material-ui/core/styles";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogContent from "@material-ui/core/DialogContent";
import CardView from "./CardView";

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose } = props;
  return (
    // eslint-disable-next-line react/jsx-no-undef
    <MuiDialogTitle disableTypography className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

// eslint-disable-next-line react/prop-types
const EditPaper = ({title, body, background}) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  }

  return <div>
    <Tooltip
      title="Xem bài viết"
      aria-label="view"
    >
      <div><AiFillEye size={25} onClick={() => setOpen(true)}/></div>
    </Tooltip>
    <Dialog
      fullWidth
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="sm"
    >
      <DialogTitle
        id="customized-dialog-title"
        onClose={handleClose}
      >
        {title}
      </DialogTitle>
      <DialogContent dividers>
        <Box
          display="flex"

          style={{background: 'white', padding: '0px 1px' }}
        >
          <CardView background={background} body={body} />
        </Box>
      </DialogContent>
    </Dialog>

  </div>
}

export default EditPaper;
