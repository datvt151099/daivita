
import useStyles from 'isomorphic-style-loader/useStyles';
import React from 'react';
import PropTypes from 'prop-types';
import s from './Admin.css';

export default function Admin({ title }) {
  useStyles(s);
  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>{title}</h1>
        <p>...</p>
      </div>
    </div>
  );
}

Admin.propTypes = {
  title: PropTypes.string.isRequired,
};
