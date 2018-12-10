const {
  runCommands
} = require('..');

describe('index', () => {
  it('base', () => {
    return runCommands([{
      name: 'ls',
      command: ['ls', '.'],
    }, {
      name: 'echo',
      command: ['echo', '123']
    }, {
      name: 'ls-error',
      command: ['ls', 'abdeiufdjdoi']
    }]);
  });

  it('retry', () => {
    return runCommands([{
      name: 'ls',
      command: ['ls', '.'],
    }, {
      name: 'echo',
      command: ['echo', '123']
    }, {
      name: 'ls-error',
      command: ['ls', 'abdeiufdjdoi'],
      retry: 3
    }]);
  });
});
