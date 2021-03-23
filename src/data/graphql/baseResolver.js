// eslint-disable-next-line import/prefer-default-export
export const formatError = error => {
  // eslint-disable-next-line no-console
  console.log(error);
  return {
    message: error.message,
    locations: error.locations,
    stack: error.stack ? error.stack.split('\n') : [],
    path: error.path,
    code: error.originalError && error.originalError.code,
  };
};
