const spawnp = require('spawnp');
const chalk = require('chalk');
const {
  retry,
  runSequence
} = require('./util');
const Window = require('./window');

const DefaultIO = () => {
  return {
    logStdText: (text) => process.stdout.write(text),
    logErrText: (text) => process.stderr.write(text)
  };
};

// eg: command = ['echo', '123', '456']
const spawnCmd = ({
  name = '',
  command,
  options
}, color, {
  logStdText,
  logErrText
}) => {
  return spawnp(command[0], command.slice(1), options, {
    stderr: true,
    onChild: (child) => {
      // stdout
      child.stdout && child.stdout.on('data', (chunk) => {
        const prefix = `[${chalk[color](name)}] `;
        logStdText(chunkToLines(chunk, prefix).join(''));
      });

      // std err
      child.stderr && child.stderr.on('data', (chunk) => {
        const prefix = `[${chalk[color](name)}] `;
        logErrText(chunkToLines(chunk, prefix, 'red').join(''));
      });
    }
  });
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
const runCommands = (sourceCommands, {
  onlys = [],
  sequence = false,
  interactive = false,
  windowSize
} = {}) => {
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
      options: cmd.options,
      retry: cmd.retry,
      status: 'wait'
    };
  });

  const {
    logStdText,
    logErrText
  } = (interactive ? Window : DefaultIO)({
    windowSize,
    executeCmd: (cmd) => {
      if (commandMap[cmd]) {
        return commandMap[cmd]();
      } else {
        return `error: command ${cmd} is not supported.`;
      }
    }
  });

  const log = (text) => {
    logStdText(text + '\n');
  };

  const commandMap = {
    'help': () => `conrun commands:
  clear:  clear comand log
  list:   show current command status
`,
    'clear': () => '',
    'list': () => getCommandsStatusInfo().join('\n')
  };

  const commandHandler = (command, index) => {
    command.status = 'running';

    return retry(spawnCmd, command.retry || 0)(command, pickColor(index), {
      logStdText,
      logErrText
    }).then(() => {
      command.status = 'success';
    }).catch((err) => {
      command.status = 'fail';
      command.errMsg = err.stderrs.join('') || err.message;
    });
  };

  const getCommandsStatusInfo = () => {
    return commands.map(({
      name,
      command,
      status,
      errMsg
    }, index) => {
      const cwsymbol = status === 'success' ? chalk.green('✔') : (
        status === 'fail' ? chalk.red('✘') : (
          status === 'running' ? chalk.white('➤') : chalk.white('⟳'))
      );

      const title = chalk[pickColor(index)](`${cwsymbol} ${index}.[${name}]`);
      const cmdStr = `${command.join(' ')}`;
      const content = status === 'success' ? chalk.green(`${cmdStr}`) : (
        status === 'fail' ? chalk.red(`${cmdStr}, ${errMsg}`) : chalk.white(cmdStr)
      );
      return `${title} ${content}`;
    });
  };

  const runCommandsHelp = (sequence) => {
    const t1 = new Date().getTime();

    return (sequence ?
      runSequence(commands.map((command, index) => () => commandHandler(command, index))) :
      Promise.all(commands.map(commandHandler))
    ).then(() => {
      const t2 = new Date().getTime();
      log('-------------------------------------------------');
      log(chalk.blue(`[stats of command results] total time: ${t2 - t1}ms`));
      log(getCommandsStatusInfo().join('\n'));
    });
  };

  return runCommandsHelp(sequence);
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
  runCommands
};
