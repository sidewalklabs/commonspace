const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let jsonAsString = ''

rl.on('line', function (line) {
  jsonAsString = jsonAsString.concat(line);
});

rl.on('close', function() {
  console.log(JSON.stringify(JSON.parse(jsonAsString)));
});
