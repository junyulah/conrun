const spawnp = require('spawnp');
const log = console.log.bind(console); // eslint-disable-line
const chalk = require('chalk');

/**
 * 1. run commands concurrently
 * 2. stat the results
 *
 * command = {
 *  name: '',
 *  command: [], // used to spawn
 *  options: {}
 * }
 *
 * command result = {
 *   type: 'success' | 'fail',
 *   errMsg: String
 * }
 */
const runCommands = (commands) => {
  return Promise.all(
    commands.map((command, index) => {
      return spawnCmd(command, pickColor(index)).then(() => {
        return {
          type: 'success'
        };
      }).catch((err) => {
        return {
          type: 'fail',
          errMsg: err.stderrs.join('') || err.message
        };
      });
    })
  ).then((stats) => {
    log(chalk.blue('[stats of command results]'));
    stats.forEach(({
      type,
      errMsg
    }, index) => {
      const {
        name = '', command
      } = commands[index];
      const title = chalk[pickColor(index)](`${index}.[${name}]`);
      const content = type === 'success' ? chalk.green(command.join(' ')) : chalk.red(`${command.join(' ')}, ${errMsg}`);
      log(`${title} ${content}`);
    });
  });
};

// eg: command = ['echo', '123', '456']
const spawnCmd = ({
  name = '',
  command,
  options
}, color) => {
  return spawnp(command[0], command.slice(1), options, {
    stderr: true,
    onChild: (child) => {
      // stdout
      child.stdout && child.stdout.on('data', (chunk) => {
        log(`[${chalk[color](name)}] ${chunk.toString()}`);
      });

      // std err
      child.stderr && child.stderr.on('data', (chunk) => {
        log(`[${chalk[color](name)}] ${chalk.red(chunk.toString())}`);
      });
    }
  });
};

const colors = ['blue', 'yellow', 'green', 'cyan', 'white'];
const pickColor = (index) => {
  return colors[index % colors.length];
};

module.exports = {
  runCommands
};
