const chalk = require('chalk');

const commandStatus = ({
  name,
  command,
  status,
  pid,
  errMsg
}, color, index) => {
  const cwsymbol = status === 'success' ? chalk.green('✔') : (
    status === 'fail' ? chalk.red('✘') : (
      status === 'running' ? chalk.white('➤') : chalk.white('⟳'))
  );

  const title = chalk[color](`${cwsymbol} ${index}.[${name}]`);
  const cmdStr = `${command.join(' ')}`;
  const content = status === 'success' ? chalk.green(`${cmdStr}`) : (
    status === 'fail' ? chalk.red(`${cmdStr}, ${getErrorMsgBrief(errMsg)}`) : (
      status === 'running' ? `(${pid}) ${chalk.white(cmdStr)}` : chalk.white(cmdStr))
  );
  return `${title} ${content}`;
};

const ERROR_BRIEF_LEN = 60;

const getErrorMsgBrief = (errMsg) => {
  const text = JSON.stringify(errMsg);
  if (text.length > ERROR_BRIEF_LEN) {
    return text.slice(0, ERROR_BRIEF_LEN - 3) + '...';
  }
  return text.slice(0, ERROR_BRIEF_LEN);
};

module.exports = {
  commandStatus
};
