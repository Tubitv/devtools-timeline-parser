'use strict';

const fs = require('fs');
const vm = require('vm');

class Parser {
  static traverseTopDownTree(node, callback, depth = 0) {
    callback(node, depth);
    if (!node.hasChildren() && depth > 0) return;
    const nextDepth = depth + 1;
    for (const child of node.children().values()) {
      Parser.traverseTopDownTree(child, callback, nextDepth);
    }
  }

  constructor(events) {
    // We read in our script to run, and create a vm.Script object
    /* eslint-disable no-path-concat */
    const script = new vm.Script(fs.readFileSync(__dirname + '/src/sandbox.js', 'utf8'));
    /* eslint-enable no-path-concat */
    // We create a new V8 context with our globals
    const context = vm.createContext({
      require,
      global,
      console,
      __dirname,
    });
    // We evaluate the `vm.Script` in the new context
    script.runInContext(context);
    this.sandbox = new context.Sandbox(events);

    return this;
  }

  cpu() {
    return this.sandbox.cpu();
  }

  topDown(startTime = 0, endTime = Infinity) {
    return this.sandbox.topDown(startTime, endTime);
  }

  memory() {
    return this.sandbox.memory();
  }

  frames() {
    return this.sandbox.frames();
  }
}

module.exports = Parser;
