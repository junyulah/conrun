# conrun

concurrent run commands help tool

## Install

```sh
npm i conrun -g
```

## Example

- help message

```sh
> conrun --help

Usage: conrun
  --command: "{\"command\": [\"ls\"], \"options\": {}}"
  --only: only run command
  --sequence
  --config: config file path
  --i: interactive mode
  --ws: log window size
  --logFile: log file


Options:
  --help     Show help                  [boolean]
  --version  Show version number        [boolean]
```

- simple example

Create a config file:

```json
{
  "commands": [{
    "command": ["ping", "google.com"]
  }, {
    "command": ["ls"]
  }],
  "options": {
    "windowSize": 10,
    "interactive": true
  }
}
```

Run command:

```sh
> conrun --config path_to_config
```

Run help after you get prompt to see all commands.
