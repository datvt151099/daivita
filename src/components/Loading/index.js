// @flow
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2),
  },
}));

// @flow
type Props = {
  size: string,
  thickness: string,
  inline: boolean,
};

const Loading = (props: Props) => {
  const classes = useStyles();
  const { inline } = props;

  return (
    <div
      className={!inline && 'progressContainer'}
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <CircularProgress
        className={classes.progress}
        size={props.size || 50}
        thickness={props.thickness || 3}
        color="secondary"
      />
    </div>
  );
};
export default Loading;
