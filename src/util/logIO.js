const fs = require('fs');
const util = require('util');
const appendFile = util.promisify(fs.appendFile);

const DefaultIO = () => {
  return {
    logStdText: (text) => process.stdout.write(text),
    logErrText: (text) => process.stderr.write(text)
  };
};

module.exports = (w, logFile) => {
  return (...args) => {
    const logIO = (w || DefaultIO)(...args);

    const logStdText = (text) => {
      logIO.logStdText(text);
      if (logFile) {
        appendFile(logFile, text);
      }
    };

    const logErrText = (text) => {
      logIO.logErrText(text);
      if (logFile) {
        appendFile(logFile, text);
      }
    };

    const log = (text) => {
      logStdText(text + '\n');
    };

    return {
      logStdText,
      logErrText,
      log
    };
  };
};
