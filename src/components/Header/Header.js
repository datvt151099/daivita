/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import useStyles from 'isomorphic-style-loader/useStyles';
import React from 'react';
// eslint-disable-next-line css-modules/no-unused-class
import s from './Header.css';
import Link from '../Link';
import Navigation from '../Navigation';
import logo from './logo.svg';

export default function Header() {
  useStyles(s);
  return (
    <div className={s.root}>
      <div className={s.container}>
        <Navigation />
        <Link className={s.brand} to="/">
          <img
            src={logo}
            srcSet={`${logo} 2x`}
            width="38"
            height="38"
            alt="React"
          />
          <span className={s.brandTxt} style={{color: "#23D0D5", fontWeight: 700}}>aivita</span>
        </Link>
      </div>
    </div>
  );
}
