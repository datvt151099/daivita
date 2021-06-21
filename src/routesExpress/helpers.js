import * as _ from "lodash";

export function startTransaction(session) {
  if (session) {
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });
  }
}

export const rounding = (value, decimal = 1) => {
  // eslint-disable-next-line no-restricted-properties
  const x = Math.pow(10, decimal);
  return Math.round(_.toNumber(value) * x) / x;
}

export const formatUserData = (user, o) => {
  const result = JSON.parse(JSON.stringify(user));
  if (result) {
    return _.omit({
      ...result,
      ...o
    }, ['password', 'firebaseId', 'registrationToken']);
  };
  return null;
};


export default true;
