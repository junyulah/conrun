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

```
[conrun interactive window]
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=9 ttl=37 time=7.03 ms
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=10 ttl=37 time=6.98 ms
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=11 ttl=37 time=6.97 ms
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=12 ttl=37 time=7.67 ms
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=13 ttl=37 time=6.78 ms
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=14 ttl=37 time=6.37 ms
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=15 ttl=37 time=7.03 ms
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=16 ttl=37 time=7.19 ms
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=17 ttl=37 time=9.16 ms
[conrun-0] 64 bytes from sb-in-f100.1e100.net (74.125.130.100): icmp_seq=18 ttl=37 time=6.82 ms
> help
conrun commands:
    clear:  clear comand log
    list:   show current command status
    run:    run a command (only when the command is not running). run all to run all commands.
    stop:   stop a running command. stop all to stop all commands.kj
```
