const run = (idx, ctx) => {
  const command = ctx.getCommand(Number(idx));
  if (!command) {
    return 'no such command to run';
  }
  if (command.status === 'running') {
    return `command ${command.name} is running`;
  } else {
    ctx.runCommand(idx);
    return 'start to run command\n' + ctx.getCommandStatusInfo(idx);
  }
};

const stop = (ctx, idx) => {
  const command = ctx.getCommand(Number(idx));
  if (command) {
    if (command.status !== 'running') {
      return `command ${command.name} is not running`;
    } else {
      ctx.stopCommand(idx);
      return `trying to stop command ${command.name}`;
    }
  } else {
    return 'no such command to kill';
  }
};

module.exports = {
  'help': () => `conrun commands:
    clear:  clear comand log
    list:   show current command status
    run:    run a command (only when the command is not running). run all to run all commands.
    stop:   stop a running command. stop all to stop all commands.
`,

  'clear': () => '',

  'list': (ctx) => ctx.getCommandsStatusInfo().join('\n'),

  'run': (ctx, idx) => {
    if (idx === 'all') {
      return ctx.getCommands().map((_, idx) => {
        return run(idx, ctx);
      }).join('\n');
    } else {
      return run(idx, ctx);
    }
  },

  'stop': (ctx, idx) => {
    if (idx === 'all') {
      return ctx.getCommands().filter((command) => {
        return command.status === 'running';
      }).map((_, idx) => {
        return stop(ctx, idx);
      }).join('\n');
    } else {
      return stop(ctx, idx);
    }
  }
};
