const fs = require('fs');
const path = require('path');
const data = require('./Profile-Apple-Homepage-20210105T120102.json');
const Parser = require('../');

const parser = new Parser(data);
fs.writeFileSync(path.resolve(__dirname, 'Frames.json'), JSON.stringify(parser.frames(), null, 2));
fs.writeFileSync(path.resolve(__dirname, 'Memory.json'), JSON.stringify(parser.memory(), null, 2));
fs.writeFileSync(path.resolve(__dirname, 'CPU.json'), JSON.stringify(parser.cpu(), null, 2));
