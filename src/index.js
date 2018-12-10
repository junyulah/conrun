const spawnp = require('spawnp');
const log = console.log.bind(console); // eslint-disable-line
const chalk = require('chalk');
const {
  retry
} = require('./util');

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
const runCommands = (commands) => {
  const t1 = new Date().getTime();

  return Promise.all(
    commands.map((command, index) => {
      return retry(spawnCmd, command.retry || 0)(command, pickColor(index)).then(() => {
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
    const t2 = new Date().getTime();
    log('-------------------------------------------------');
    log(chalk.blue(`[stats of command results] total time: ${t2 - t1}ms`));
    stats.forEach(({
      type,
      errMsg
    }, index) => {
      const {
        name = '', command
      } = commands[index];
      const cwsymbol = type === 'success' ? chalk.green('✔') : chalk.red('✘');
      const title = chalk[pickColor(index)](`${cwsymbol} ${index}.[${name}]`);
      const cmdStr = `${command.join(' ')}`;
      const content = type === 'success' ? chalk.green(`${cmdStr}`) : chalk.red(`${cmdStr}, ${errMsg}`);
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

const colors = ['blue', 'yellow', 'cyan', 'white', 'magenta', 'gray'];
const pickColor = (index) => {
  return colors[index % colors.length];
};

module.exports = {
  runCommands
};
