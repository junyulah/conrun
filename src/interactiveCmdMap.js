module.exports = {
  'help': () => `conrun commands:
    clear:  clear comand log
    list:   show current command status
    run:    run a command (only when the command is not running)
    stop:   stop a running command
`,

  'clear': () => '',

  'list': ({
    getCommandsStatusInfo
  }) => getCommandsStatusInfo().join('\n'),

  'run': ({
    getCommand,
    runCommand,
    getCommandStatusInfo
  }, idx) => {
    const command = getCommand(Number(idx));
    if (!command) {
      return 'no such command to run';
    }
    if (command.status === 'running') {
      return 'command is running';
    } else {
      runCommand(idx);
      return 'start to run command\n' + getCommandStatusInfo(idx);
    }
  },

  'stop': ({
    getCommand,
    stopCommand
  }, idx) => {
    const command = getCommand(Number(idx));
    if (command) {
      if (command.status !== 'running') {
        return 'command is not running';
      } else {
        stopCommand(idx);
        return 'trying to stop command';
      }
    } else {
      return 'no such command to kill';
    }
  }
};
