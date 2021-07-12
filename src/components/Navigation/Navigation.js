
import useStyles from 'isomorphic-style-loader/useStyles';
import React from 'react';
// import cx from 'classnames';
// eslint-disable-next-line css-modules/no-unused-class
import s from './Navigation.css';
// import Link from '../Link';

export default function Navigation() {
  useStyles(s);
  return (
    <div className={s.root} role="navigation"/>
  );
}
