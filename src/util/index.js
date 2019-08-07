const util = require('util');
const LogIO = require('./logIO');
const {
  spawnCmd
} = require('./spawnCmd');
const {
  moveCursorUp,
  moveCursorDown,
  eraseLine,
  eraseLines
} = require('./paint');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);

const readJson = async (jsonFilePath) => {
  const text = await readFile(jsonFilePath, 'utf-8');
  return JSON.parse(text);
};

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
  runSequence,
  readJson,
  LogIO,
  spawnCmd
};
