const chalk = require('chalk');
const {
  spawn
} = require('child_process');

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

// eg: command = ['echo', '123', '456']
const spawnCmd = (command, color, {
  logStdText,
  logErrText,
  emptyPrefix
}) => {
  const prefix = `[${chalk[color](command.name)}] `;

  command.errMsg = '';
  command.pid = '';

  return new Promise((resolve, reject) => {
    const child = spawn(command.command[0], command.command.slice(1), command.options);
    command.process = child;
    command.pid = child.pid;

    child.on('error', (err) => {
      logErrText(chunkToLines(err.toString(), emptyPrefix, prefix, 'red').join(''));
      command.errMsg += err.toString();
      reject(err);
    });

    child.on('exit', (code, signal) => {
      if (code !== 0) {
        const errText = `child process exited with code ${code}, signal ${signal}.`;
        logErrText(chunkToLines(errText, emptyPrefix, prefix, 'red').join(''));

        reject(new Error(errText));
      } else {
        resolve();
      }
    });

    child.stdout.on('data', (chunk) => {
      logStdText(chunkToLines(chunk.toString(), emptyPrefix, prefix).join(''));
    });

    child.stderr.on('data', (chunk) => {
      const errText = chunk.toString();
      command.errMsg += errText;
      logErrText(chunkToLines(errText, emptyPrefix, prefix, 'red').join(''));
    });
  });
};

module.exports = {
  spawnCmd
};
