module.exports = (identifier, ...args) => {
  // eslint-disable-next-line no-console
  console.log(new Date().toISOString(), `[${identifier}]`, ...args);
};
