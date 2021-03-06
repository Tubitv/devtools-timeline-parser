# Devtools Timeline Parser

[![npm version](https://badge.fury.io/js/devtools-timeline-parser.svg)](https://badge.fury.io/js/devtools-timeline-parser)

Used to extract meaning metrics from raw timeline data generated in Chrome Devtools.


## Install

```bash
npm install devtools-timeline-parser
```

## Usage

```js
const Parser = require('devtools-timeline-parser');
const data = require('/path/to/raw/timeline/json/file');

const parser = new Parser(data);

// get CPU metrics
parser.cpu();
// outputs:
// {
//   "idle": [
//     {
//       "timeOffset": 0, // in millisecond
//       "load": 0
//     }
//   ],
//   "loading": [...],
//   "painting": [...],
//   "rendering": [...],
//   "scripting": [...],
//   "other": [
//     {
//       "timeOffset": 0,
//       "load": 0
//     },
//     {
//       "timeOffset": 12.713740000009537,
//       "load": 0.014905127416952567
//     },
//     ...
//   ]
// }


// get memory metrics
parser.memory();
// outputs:
// [
//   {
//     "startTime": 749744928.729,
//     "startTimeOffest": 560.636999964714,
//     "documents": 19,
//     "jsEventListeners": 505,
//     "jsHeapSizeUsed": 23592960,
//     "nodes": 6453
//   },
//   ...
// ]

// get FPS metrics
parser.frames();
// outputs:
// [
//   {
//     "startTime": 749744391.189,
//     "startTimeOffset": 23.05400002002716,
//     "endTime": 749744791.936,
//     "duration": 400.74699997901917,
//     "timeByCategory": {
//       "other": 2.9880001544952393,
//       "rendering": 0.4479999542236328,
//       "painting": 0.36000001430511475
//     },
//     "cpuTime": 3.796000123023987,
//     "idle": false,
//     "layerTree": null,
//     "_paints": [],
//     "_mainFrameId": 304
//   },
//   ...
// ]

// get top down profile tree and find out time-consuming profiles
const topDownRootNode = parser.topDown();
Parser.traverseTopDownTree(topDownRootNode, (node, depth) => {
  if (node.selfTime >= 16 && node.selfTime !== Infinity) {
    console.log({
      id: node.id,
      selfTime: node.selfTime,
      totalTime: node.totalTime,
      eventArgs: node.event.args,
    });
  }
});
// outputs:
// { id: 'CompositeLayers',
//   selfTime: 20.591999650001526,
//   totalTime: 20.941999673843384,
//   eventArgs: { layerTreeId: 1 } }
// { id: 'EvaluateScript',
//   selfTime: 42.007999897003174,
//   totalTime: 97.35699999332428,
//   eventArgs:
//    { data:
//       { columnNumber: 0,
//         frame: '16DBFDE9A1489A570B1EEE14792DB5A9',
//         lineNumber: 0,
//         url:
//          'https://www.apple.com/metrics/ac-analytics/2.12.0/scripts/ac-analytics.js' } } }
```

## Demo

```
# Run demo script
$ node examples/demo.js

# Then check generated CPU.json, Memory.json and Frames.json files
```

## Thanks

This project heavily borrows ideas from a depreacted project [devtools-timeline-model](https://github.com/paulirish/devtools-timeline-model).

## Potential blockers

But due to the uncompiled TypeScript files in latest [chrome-devtools-frontend](https://github.com/ChromeDevTools/devtools-frontend) package, this repo still uses a legacy version 1.0.698043 of it.

## License

MIT
