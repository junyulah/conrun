const {
  eraseLine,
  moveCursorUp
} = require('./util');

const readline = require('readline');

const noop = () => Promise.resolve('');

module.exports = ({
  windowSize = 10,
  executeCmd = noop
} = {}) => {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  const stdoutWrite = process.stdout.write.bind(process.stdout);
  const stderrWrite = process.stderr.write.bind(process.stderr);

  let liveLog = []; // log background process logs
  let prevLiveLog = [];
  const terminalPrefix = '> ';
  let terminalLine = terminalPrefix;
  let cmdLog = []; // log management logs
  let prevCmdLog = [];

  const printCmdLog = () => {
    // errase previous cmd log area
    prevCmdLog.forEach((line) => {
      stdoutWrite('\n\r');
      eraseLine(stdoutWrite, line);
    });

    moveCursorUp(stdoutWrite, prevCmdLog.length);

    cmdLog.forEach((line) => {
      stdoutWrite('\n\r' + line);
    });
    moveCursorUp(stdoutWrite, cmdLog.length); // move to the terminal line
  };

  const printTerminalLine = () => {
    eraseLine(stdoutWrite);
    stdoutWrite('\r' + terminalLine);
  };

  const printLiveLog = (isErr) => {
    const write = isErr ? stderrWrite : stdoutWrite;

    // erase previous log
    prevLiveLog.forEach(() => {
      moveCursorUp(write, 1);
      eraseLine(write);
    });

    liveLog.forEach((item) => {
      write('\r' + item);
      write('\n');
    });
  };

  const updateLiveLog = (text) => {
    prevLiveLog = liveLog.slice(0);

    const lines = text.trim().split('\n');
    lines.forEach((line) => {
      liveLog.push(line);
      if (liveLog.length > windowSize) {
        liveLog.shift();
      }
    });
  };

  const updateCmdLog = (text) => {
    // update cmd log
    const lines = text.trim().split('\n');
    prevCmdLog = cmdLog;
    cmdLog = lines;
  };

  const logStdText = (text) => {
    updateLiveLog(text);

    printLiveLog(false);
    if (liveLog.length < windowSize) {
      printCmdLog();
    }
    printTerminalLine();
  };

  const logErrText = (text) => {
    updateLiveLog(text);

    printLiveLog(true);
    if (liveLog.length < windowSize) {
      printCmdLog();
    }
    printTerminalLine();
  };

  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else if (key.name === 'return') {
      const cmd = terminalLine.slice(terminalPrefix.length, terminalLine.length).trim();

      terminalLine = terminalPrefix;
      printTerminalLine();
      // execute command
      if (cmd) {
        Promise.resolve(executeCmd(cmd)).then(text => {
          logCmdResult(text);
        });
      }
    } else if (key.name === 'backspace') {
      if (terminalLine.length > terminalPrefix.length) {
        terminalLine = terminalLine.slice(0, terminalLine.length - 1);
        printTerminalLine();
      }
    } else {
      terminalLine += str;
      printTerminalLine();
    }
  });

  const logCmdResult = (text = '') => {
    updateCmdLog(text);

    printCmdLog();
    printTerminalLine();
  };

  // init window
  stdoutWrite('[conrun interactive window]\n');
  printTerminalLine();

  return {
    logStdText,
    logErrText
  };
};
