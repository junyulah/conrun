const ESC = '\u001B[';

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

const moveCursorUp = (write, n) => {
  if (n > 0) {
    write(ESC + n + 'A');
  }
};

const moveCursorDown = (write, n) => {
  if (n > 0) {
    write(ESC + n + 'B');
  }
};

const eraseLine = (write) => write(ESC + '2K');

const eraseLines = (write, count) => {
  let clear = '';
  for (let i = 0; i < count; i++) {
    clear += (ESC + '2K') + (i === count - 1 ? '' : ESC + 1 + 'A' + '\r');
  }
  write(clear);
};

const runSequence = (fns) => {
  return fns.reduce((prev, fn) => {
    return prev.then((list) => {
      return fn().then((item) => {
        list.push(item);
        return list;
      });
    });
  }, Promise.resolve([]));
};

module.exports = {
  retry,
  moveCursorUp,
  moveCursorDown,
  eraseLine,
  eraseLines,
  runSequence
};
