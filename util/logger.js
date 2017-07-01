module.exports = function(identifier, ...args) {
  console.log(new Date().toISOString(), `[${identifier}]`, ...args);
};
