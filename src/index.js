const {
  spawn
} = require('child_process');
const {
  commandStatus
} = require('./statusInfo');
const chalk = require('chalk');
const {
  retry,
  runSequence
} = require('./util');
const interactiveCmdMap = require('./interactiveCmdMap');
const Window = require('./window');

const DefaultIO = () => {
  return {
    logStdText: (text) => process.stdout.write(text),
    logErrText: (text) => process.stderr.write(text)
  };
};

const emptyPrefix = '  ';

/**
 * 1. run commands concurrently
 * 2. stat the results
 *
 * command = {
 *  name: '',
 *  command: [], // used to spawn
 *  options: {},
 *  retry: 0
 * }
 *
 * command result = {
 *   type: 'success' | 'fail',
 *   errMsg: String
 * }
 */
const mergeCmdOptions = (options = {}) => {
  const opts = Object.assign({}, options);
  opts.env = Object.assign({}, process.env, options.env);
  return opts;
};

const commandsManager = (sourceCommands, {
  onlys = [],
  sequence = false,
  interactive = false,
  windowSize
} = {}, commandMap) => {
  const _onlys = onlys.map((item) => item.trim()).filter((item) => item !== '');

  const commands = sourceCommands.filter((command) => {
    if (_onlys && _onlys.length) {
      return _onlys.find((only) => new RegExp(only).test(command.name));
    } else {
      return true;
    }
  }).map((cmd, index) => {
    return {
      name: cmd.name || `conrun-${index}`,
      command: cmd.command,
      options: mergeCmdOptions(cmd.options),
      retry: cmd.retry,
      status: 'wait',
      errMsg: '',
      pid: null
    };
  });

  const {
    logStdText,
    logErrText
  } = (interactive ? Window : DefaultIO)({
    windowSize,
    executeCmd: (cmd) => {
      const args = cmd.split(' ').map(item => item.trim()).filter(item => !!item);
      if (commandMap[args[0]]) {
        return commandMap[args[0]]({
          getCommand,
          getCommandStatusInfo,
          getCommandsStatusInfo,
          runCommand,
          stopCommand
        }, ...args.slice(1));
      } else {
        return `error: command ${cmd} is not supported.`;
      }
    }
  });

  const log = (text) => {
    logStdText(text + '\n');
  };

  // eg: command = ['echo', '123', '456']
  const spawnCmd = (command, color, {
    logStdText,
    logErrText
  }) => {
    const prefix = `[${chalk[color](command.name)}] `;

    command.errMsg = '';
    command.pid = '';

    return new Promise((resolve, reject) => {
      const child = spawn(command.command[0], command.command.slice(1), command.options);
      command.pid = child.pid;

      child.on('error', (err) => {
        logErrText(chunkToLines(err.toString(), prefix, 'red').join(''));
        command.errMsg += err.toString();
        reject(err);
      });

      child.on('close', (code) => {
        if (code !== 0) {
          const errText = `child process exited with code ${code}`;
          logErrText(chunkToLines(errText, prefix, 'red').join(''));

          reject(new Error(errText));
        } else {
          resolve();
        }
      });

      child.stdout.on('data', (chunk) => {
        logStdText(chunkToLines(chunk.toString(), prefix).join(''));
      });

      child.stderr.on('data', (chunk) => {
        const errText = chunk.toString();
        command.errMsg += errText;
        logErrText(chunkToLines(errText, prefix, 'red').join(''));
      });
    });
  };

  const getCommand = (index) => commands[index];

  const runCommand = (index) => {
    const command = getCommand(index);
    command.status = 'running';

    return retry(spawnCmd, command.retry || 0)(command, pickColor(index), {
      logStdText,
      logErrText
    }).then(() => {
      command.status = 'success';
    }).catch(() => {
      command.status = 'fail';
    });
  };

  const getCommandStatusInfo = (index) => {
    return commandStatus(getCommand(index), pickColor(index), index);
  };

  const getCommandsStatusInfo = () => {
    return commands.map((_, index) => getCommandStatusInfo(index));
  };

  const stopCommand = (idx) => {
    const command = getCommand(idx);
    if (command.status === 'running') {
      process.kill(command.pid, command.killSignal || 'SIGTERM');
    }
  };

  const start = () => {
    const t1 = new Date().getTime();

    process.on('exit', () => {
      commands.forEach((_, idx) => {
        stopCommand(idx);
      });
    });

    return (sequence ?
      runSequence(commands.map((command, index) => () => runCommand(index))) :
      Promise.all(commands.map((_, index) => runCommand(index)))
    ).then(() => {
      if (!interactive) {
        const t2 = new Date().getTime();
        log('-------------------------------------------------');
        log(chalk.blue(`[stats of command results] total time: ${t2 - t1}ms`));
        log(getCommandsStatusInfo().join('\n'));
      }
    });
  };

  return {
    start
  };
};

const chunkToLines = (chunk, prefix, color) => {
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

const colors = ['blue', 'yellow', 'cyan', 'white', 'magenta', 'gray'];

const pickColor = (index) => {
  return colors[index % colors.length];
};

module.exports = {
  runCommands: (commands, options) => {
    const cm = commandsManager(commands, options, interactiveCmdMap);
    return cm.start();
  }
};
