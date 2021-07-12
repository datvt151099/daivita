
import useStyles from 'isomorphic-style-loader/useStyles';
import React from 'react';
import PropTypes from 'prop-types';

// external-global styles must be imported in your JS.
import normalizeCss from 'normalize.css';
import s from './Layout.css';
import Header from '../Header';

export default function Layout({ children }) {
  useStyles(s, normalizeCss);
  return (
    <>
      <Header />
      {children}
      {/* <Feedback /> */}
      {/* <Footer /> */}
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
