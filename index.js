'use strict';

const fs = require('fs');
const vm = require('vm');

class Parser {
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

  memory() {
    return this.sandbox.memory();
  }

  frames() {
    return this.sandbox.frames();
  }
}

module.exports = Parser;
