const interactiveCmdMap = require('./interactiveCmdMap');
const CommandsManager = require('./commandsManager');

module.exports = {
  runCommands: (commands, options) => {
    const cm = new CommandsManager(commands, options, interactiveCmdMap);
    return cm.start();
  }
};
