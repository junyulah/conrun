const chalk = require('chalk');
const {
  spawn
} = require('child_process');
const {
  chunkToLines
} = require('./util');

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

    child.on('close', (code) => {
      if (code !== 0) {
        const errText = `child process exited with code ${code}`;
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
