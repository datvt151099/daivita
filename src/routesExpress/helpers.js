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

export const formatUserData = (user) => {
  return _.omit(user, ['password', 'firebaseId', 'registrationToken']);
};


export default true;
