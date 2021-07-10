// @flow
import React from 'react';

type Props = {
  error: string,
};

class Error extends React.Component<Props> {
  render() {
    return <div style={{ color: 'red' }}>{this.props.error.toString()}</div>;
  }
}
export default Error;
