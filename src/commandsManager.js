const {
  commandStatus
} = require('./statusInfo');
const chalk = require('chalk');
const {
  retry,
  runSequence,
  LogIO,
  spawnCmd
} = require('./util');
const Window = require('./window');

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

const CommandsManager = function(sourceCommands, {
  onlys = [],
  sequence = false,
  interactive = false,
  windowSize,
  emptyPrefix = '  ',
  logFile
} = {}, commandMap) {
  this.commands = sourceCommands.map((cmd, index) => {
    return {
      name: cmd.name || `conrun-${index}`,
      command: cmd.command,
      killSignal: cmd.killSignal,
      options: mergeCmdOptions(cmd.options),
      retry: cmd.retry,
      status: 'wait',
      errMsg: '',
      pid: null
    };
  });

  const {
    logStdText,
    logErrText,
    log
  } = LogIO(interactive ? Window : null, logFile)({
    windowSize,
    executeCmd: (cmd) => {
      const args = cmd.split(' ').map(item => item.trim()).filter(item => !!item);
      if (commandMap[args[0]]) {
        return commandMap[args[0]](this, ...args.slice(1));
      } else {
        return `error: command ${cmd} is not supported.`;
      }
    }
  });

  this.onlys = onlys;
  this.emptyPrefix = emptyPrefix;
  this.sequence = sequence;
  this.log = log;
  this.logStdText = logStdText;
  this.logErrText = logErrText;
  this.interactive = interactive;

  process.on('exit', () => {
    this.commands.forEach((_, idx) => {
      this.stopCommand(idx);
    });
  });
};

CommandsManager.prototype.getCommand = function(index) {
  return this.commands[index];
};

CommandsManager.prototype.getCommands = function() {
  return this.commands;
};

// eg: command = ['echo', '123', '456']
CommandsManager.prototype.runCommand = function(index) {
  const command = this.getCommand(index);
  command.status = 'running';

  return retry(spawnCmd, command.retry || 0)(command, pickColor(index), {
    logStdText: this.logStdText,
    logErrText: this.logErrText,
    emptyPrefix: this.emptyPrefix
  }).then(() => {
    command.status = 'success';
  }).catch(() => {
    command.status = 'fail';
  });
};

CommandsManager.prototype.getCommandStatusInfo = function(index) {
  return commandStatus(this.getCommand(index), pickColor(index), index);
};

CommandsManager.prototype.getCommandsStatusInfo = function() {
  return this.commands.map((_, index) => this.getCommandStatusInfo(index));
};

CommandsManager.prototype.stopCommand = function(idx) {
  const command = this.getCommand(idx);
  if (command.status === 'running') {
    try {
      command.process.stdout.destroy();
      command.process.stderr.destroy();
      process.kill(command.pid, command.killSignal || 'SIGTERM');
    } catch (err) {
      //
    }
  }
};

CommandsManager.prototype.start = function() {
  const _onlys = this.onlys.map((item) => item.trim()).filter((item) => item !== '');
  const startCommandIdxs = this.commands.map((_, idx) => {
    return idx;
  }).filter((idx) => {
    const command = this.getCommand(idx);
    if (_onlys && _onlys.length) {
      return _onlys.find((only) => new RegExp(only).test(command.name));
    } else {
      return true;
    }
  });

  const t1 = new Date().getTime();

  return (this.sequence ?
    runSequence(startCommandIdxs.map((index) => () => this.runCommand(index))) :
    Promise.all(startCommandIdxs.map((index) => this.runCommand(index)))
  ).then(() => {
    if (!this.interactive) {
      const t2 = new Date().getTime();
      this.log('-------------------------------------------------');
      this.log(chalk.blue(`[stats of command results] total time: ${t2 - t1}ms`));
      this.log(this.getCommandsStatusInfo().join('\n'));
    }
  });
};

const colors = ['blue', 'yellow', 'cyan', 'white', 'magenta', 'cyanBright', 'greenBright'];

const pickColor = (index) => {
  return colors[index % colors.length];
};

module.exports = CommandsManager;
