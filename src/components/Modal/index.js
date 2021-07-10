/* eslint-disable no-unused-expressions, react/no-unused-prop-types */
import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Mutation from 'react-apollo/Mutation';
import Loading from '../Loading';

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

// @flow
type Props = {
  onClose: func,
  onOpen: boolean,
  onSave: func,
  title: string,
  children: node,
  isOpen: boolean,
  graphQuery: string,
  variables: object,
  refetchQueries: array,
  validate: true,
  maxWidth: any,
  hideSaveButton: boolean,
};

const Modal = (props: Props) => {
  const {
    title,
    maxWidth,
    children,
    variables,
    graphQuery,
    hideSaveButton,
    isOpen = false,
  } = props;

  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(props.isOpen);
  }, [props.isOpen]);


  async function executeMutation(mutation) {
    return mutation({
      mutation: graphQuery,
      variables,
      refetchQueries: () => props.refetchQueries,
    });
  }

  function handleClose() {
    setOpen(false);
    props?.onClose?.();
  }

  async function handleSave(event, mutation = null) {
    const { validate, onSave } = props;

    let isValid = false;
    isValid = validate;
    if (isValid) {
      let result = null;

      if (graphQuery && variables && mutation) {
        result = await executeMutation(mutation);
      }

      if (onSave) {
        onSave(result);
      }
    }

    if (validate === undefined) {
      if (onSave) {
        onSave();
      }
    }
  }

  return (
    <>
      <Dialog
        fullWidth
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth={maxWidth}
      >
        {title ? (
          <DialogTitle
            id="customized-dialog-title"
            onClose={handleClose}
          >
            {title}
          </DialogTitle>
        ) : (
          <div />
        )}

        {(() => {
          if (children) {
            return <DialogContent dividers>{children}</DialogContent>;
          }

          return null;
        })()}

        <DialogActions>
          {(() => {
            if (graphQuery && variables) {
              return (
                <Mutation mutation={graphQuery}>
                  {(mutation, { loading }) => (
                    <div>
                      {loading && <Loading />}
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={event => handleSave(event, mutation)}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </Mutation>
              );
            }
            return (
              !hideSaveButton && <Button
                variant="contained"
                color="primary"
                onClick={event => handleSave(event)}
              >
                Save
              </Button>
            );
          })()}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Modal;
