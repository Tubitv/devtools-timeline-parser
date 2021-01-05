Runtime.experiments = {};
Runtime.experiments.isEnabled = exp => exp === 'timelineLatencyInfo';

Common.console = console;
Common.moduleSetting = function (module) {
  return { get: _ => module === 'showNativeFunctionsInJSProfile' };
};
Common.settings = {
  createSetting() {
    return {
      get() {
        return false;
      },
      addChangeListener() {},
    };
  },
};
