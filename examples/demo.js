const fs = require('fs');
const path = require('path');
const data = require('./Profile-Apple-Homepage-20210105T120102.json');
const Parser = require('../');

const parser = new Parser(data);

console.log('# Generate frame information and put it in Frames.json');
fs.writeFileSync(path.resolve(__dirname, 'Frames.json'), JSON.stringify(parser.frames(), null, 2));

console.log('# Generate memory information and put it in Memory.json');
fs.writeFileSync(path.resolve(__dirname, 'Memory.json'), JSON.stringify(parser.memory(), null, 2));

console.log('# Generate CPU information and put it in CPU.json');
fs.writeFileSync(path.resolve(__dirname, 'CPU.json'), JSON.stringify(parser.cpu(), null, 2));

console.log('# Find out time-consuming operations');
console.group();
const topDownRootNode = parser.topDown(0, Infinity, true);
Parser.traverseTopDownTree(topDownRootNode, (node, depth) => {
  if (depth > 1) return;
  if (node.totalTime >= 100 && node.selfTime !== Infinity) {
    console.log({
      id: node.id,
      name: node.event.name,
      startTime: node.event.startTime,
      selfTime: node.selfTime,
      totalTime: node.totalTime,
      eventArgs: node.event.args,
    });
  }
});
console.groupEnd();
