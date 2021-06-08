import * as _ from "lodash";

export const rounding = (value, decimal = 1) => {
  // eslint-disable-next-line no-restricted-properties
  const x = Math.pow(10, decimal);
  return Math.round(_.toNumber(value) * x) / x;
}


export default true;
