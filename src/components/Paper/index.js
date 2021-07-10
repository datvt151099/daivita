/* eslint-disable react/prop-types */
import React from 'react';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {Box, Button, Dialog, Snackbar, Typography} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {Alert} from "@material-ui/lab";
import {roles} from "../../constants";

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
    },
  },
}));

const ROLES = [
  {
    value: roles.common,
    label: 'Tất cả',
  },
  {
    value: roles.doctor,
    label: 'Bác sĩ',
  },
  {
    value: roles.patient,
    label: 'Bệnh nhân',
  },

];

const TYPES = [
  {
    value: 'DIET',
    label: 'Chế độ ăn uống',
  },
  {
    value: 'DIABETES',
    label: 'Bệnh tiểu đường',
  },
  {
    value: 'OTHER',
    label: 'Khác',
  },
]

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

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const MUTATION_ADD_PAPER = gql(`
  mutation AddPaper($title: String, $body: String, $background: String, $role: Int, $type: String) {
    addPaper(title: $title, body: $body, background: $background, role: $role, type: $type)
  }
`);

const MUTATION_EDIT_PAPER = gql(`
  mutation EditPaper($id: String, $title: String, $body: String, $background: String, $role: Int, $type: String) {
    editPaper(id: $id, title: $title, body: $body, background: $background, role: $role, type: $type)
  }
`);

function Paper(props) {
  const classes = useStyles();
  const {open, handleClose, setOpen, id, edit = false} = props;
  const [openAlert, setOpenAlert] = React.useState(false);
  const [severity, setSeverity] = React.useState('success');
  const [title, setTitle] = React.useState(props.title || '');
  const [role, setRole] = React.useState(props.role || roles.common);
  const [type, setType] = React.useState(props.type || 'DIET');
  const [body, setBody] = React.useState(props.body || '');
  const [background, setBackground] = React.useState(props.background || '')

  const [addPaper] = useMutation(edit ? MUTATION_EDIT_PAPER : MUTATION_ADD_PAPER, {
    variables: {
      id,
      title,
      role,
      type,
      background,
      body,
    },
    onCompleted: (data) => {
      setOpen(false);
      setOpenAlert(true);
      if (data) {
        if (props.callback) {
          props.callback();
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
  return (
    <div>
      <Snackbar open={openAlert} autoHideDuration={1000} onClose={() => setOpenAlert(false)}>
        <Alert onClose={() => setOpenAlert(false)} severity={severity}>
          {severity === 'success' ? 'Thành công!' : 'Thất bại!'}
        </Alert>
      </Snackbar>
    <Dialog
      fullWidth
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="md"
    >
      <DialogTitle
        id="customized-dialog-title"
        onClose={handleClose}
      >
        Bài viết
      </DialogTitle>
      <DialogContent dividers>
        <Box
          display="flex"
          flexDirection="column"
          style={{background: 'white', padding: '0px 1px' }}
        >
          <form className={classes.root} noValidate autoComplete="off" style={{paddingRight: 17}}>
            <div>
              <TextField
                id="outlined-title-static"
                label="Tiêu đề bài viết"
                multiline
                rows={1}
                style={{width: '100%'}}
                defaultValue="Default Value"
                variant="outlined"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                }}
              />

              <TextField
                id="outlined-Background-static"
                label="Background URL"
                multiline
                rows={1}
                style={{width: '100%'}}
                defaultValue="Default Value"
                variant="outlined"
                value={background}
                onChange={(event) => {
                  setBackground(event.target.value);
                }}
              />


              <TextField
                id="outlined-select-currency-native"
                select
                label="Đối tượng"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                }}
                SelectProps={{
                  native: true,
                }}
                variant="outlined"
              >
                {ROLES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
              <TextField
                id="outlined-select-type-native"
                select
                label="Thể loại"
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                }}
                SelectProps={{
                  native: true,
                }}
                variant="outlined"
              >
                {TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
              <TextField
                id="outlined-multiline-static"
                label="Nội dung"
                multiline
                rows={10}
                style={{width: '100%'}}
                defaultValue="Default Value"
                variant="outlined"
                value={body}
                onChange={(event) => {
                  setBody(event.target.value);
                }}
              />
            </div>
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={addPaper}
        >
          {edit ? 'Chỉnh sửa' : 'Thêm'}
        </Button>
      </DialogActions>
    </Dialog>
    </div>
  );
}

export default Paper;
