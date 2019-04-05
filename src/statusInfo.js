const chalk = require('chalk');

const commandStatus = ({
  name,
  command,
  status,
  errMsg

}, color, index) => {
  const cwsymbol = status === 'success' ? chalk.green('✔') : (
    status === 'fail' ? chalk.red('✘') : (
      status === 'running' ? chalk.white('➤') : chalk.white('⟳'))
  );

  const title = chalk[color](`${cwsymbol} ${index}.[${name}]`);
  const cmdStr = `${command.join(' ')}`;
  const content = status === 'success' ? chalk.green(`${cmdStr}`) : (
    status === 'fail' ? chalk.red(`${cmdStr}, ${errMsg}`) : chalk.white(cmdStr)
  );
  return `${title} ${content}`;
};

module.exports = {
  commandStatus
};
