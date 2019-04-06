const util = require('util');
const chalk = require('chalk');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const appendFile = util.promisify(fs.appendFile);

const readJson = async (jsonFilePath) => {
  const text = await readFile(jsonFilePath, 'utf-8');
  return JSON.parse(text);
};

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

const chunkToLines = (chunk, emptyPrefix, prefix, color) => {
  const text = chunk.toString();
  let lines = text.split('\n');
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }
  const firstLine = color === undefined ? `${prefix}${lines[0]}\n` : `${prefix}${chalk[color](lines[0])}\n`;

  return [firstLine].concat(
    lines.slice(1).map((line) => {
      if (color !== undefined) {
        return `${emptyPrefix}${chalk[color](line)}\n`;
      } else {
        return `${emptyPrefix}${line}\n`;
      }
    })
  );
};

module.exports = {
  retry,
  moveCursorUp,
  moveCursorDown,
  eraseLine,
  eraseLines,
  runSequence,
  readJson,
  appendFile,
  chunkToLines
};
