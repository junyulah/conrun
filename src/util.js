const retry = (fn, max = 0) => {
  const help = (args, count, err) => {
    if (count > max) {
      return Promise.reject(err);
    } else {
      return fn(...args).catch(err => {
        return help(args, count + 1, err);
      });
    }
  };
  return (...args) => {
    return help(args, 0);
  };
};

module.exports = {
  retry
};
