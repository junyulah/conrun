const ESC = '\u001B[';

const moveCursorUp = (write, n) => {
  if (n > 0) {
    write(ESC + n + 'A');
  }
};

const moveCursorDown = (write, n) => {
  if (n > 0) {
    write(ESC + n + 'B');
  }
};

const eraseLine = (write) => write(ESC + '2K');

const eraseLines = (write, count) => {
  let clear = '';
  for (let i = 0; i < count; i++) {
    clear += (ESC + '2K') + (i === count - 1 ? '' : ESC + 1 + 'A' + '\r');
  }
  write(clear);
};

module.exports = {
  moveCursorUp,
  moveCursorDown,
  eraseLine,
  eraseLines
};
