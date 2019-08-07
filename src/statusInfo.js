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
  return getBriefText(JSON.stringify(errMsg), ERROR_BRIEF_LEN);
};

const getBriefText = (text, maxLen) => {
  if (text.length > maxLen) {
    return text.slice(0, maxLen - 3) + '...';
  }
  return text.slice(0, maxLen);
};

module.exports = {
  commandStatus
};
