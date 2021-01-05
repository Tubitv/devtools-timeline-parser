'use strict';

/* eslint-disable no-invalid-this */

const fs = require('fs');
const resolve = require('resolve');
const Blob = require('cross-blob');

// In order to maintain consistent global scope across the files,
// and share natives like Array, etc, We will eval things within our sandbox
function requireval(path) {
  const res = resolve.sync(path, { basedir: __dirname });
  const filesrc = fs.readFileSync(res, 'utf8');
  // eslint-disable-next-line no-eval
  eval(filesrc + '\n\n//# sourceURL=' + path);
}

// establish our sandboxed globals
this.window = this.self = this.global = this;
this.console = console;
this.Blob = Blob;

// establish our sandboxed globals
this.Runtime = class {};
this.Protocol = class {};
this.TreeElement = class {};

// from generated externs.
this.Accessibility = {};
this.Animation = {};
this.Audits = {};
this.Audits2 = {};
this.Audits2Worker = {};
this.Bindings = {};
this.CmModes = {};
this.Common = {};
this.Components = {};
this.Console = {};
this.DataGrid = {};
this.Devices = {};
this.Diff = {};
this.Elements = {};
this.Emulation = {};
this.Extensions = {};
this.FormatterWorker = {};
this.Gonzales = {};
this.HeapSnapshotWorker = {};
this.Host = {};
this.LayerViewer = {};
this.Layers = {};
this.Main = {};
this.Network = {};
this.Persistence = {};
this.Platform = {};
this.Profiler = {};
this.Resources = {};
this.Sass = {};
this.Screencast = {};
this.SDK = {};
this.Security = {};
this.Services = {};
this.Settings = {};
this.Snippets = {};
this.SourceFrame = {};
this.Sources = {};
this.Terminal = {};
this.TextEditor = {};
this.Timeline = {};
this.TimelineModel = {};
this.ToolboxBootstrap = {};
this.UI = {};
this.UtilitySharedWorker = {};
this.WorkerService = {};
this.Workspace = {};

requireval('./src/api-stubs.js');

// chrome devtools frontend
requireval('chrome-devtools-frontend/front_end/common/Object.js');
requireval('chrome-devtools-frontend/front_end/common/Console.js');
requireval('chrome-devtools-frontend/front_end/platform/utilities.js');
requireval('chrome-devtools-frontend/front_end/common/ParsedURL.js');
requireval('chrome-devtools-frontend/front_end/common/UIString.js');
requireval('chrome-devtools-frontend/front_end/sdk/Target.js');
requireval('chrome-devtools-frontend/front_end/sdk/LayerTreeBase.js');
requireval('chrome-devtools-frontend/front_end/common/SegmentedRange.js');
requireval('chrome-devtools-frontend/front_end/bindings/TempFile.js');
requireval('chrome-devtools-frontend/front_end/sdk/TracingModel.js');
requireval('chrome-devtools-frontend/front_end/sdk/ProfileTreeModel.js');
requireval('chrome-devtools-frontend/front_end/timeline/TimelineUIUtils.js');
requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineJSProfile.js');
requireval('chrome-devtools-frontend/front_end/sdk/CPUProfileDataModel.js');
requireval('chrome-devtools-frontend/front_end/layers/LayerTreeModel.js');
requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineModel.js');
requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineModelFilter.js');
requireval('chrome-devtools-frontend/front_end/data_grid/SortableDataGrid.js');

requireval('chrome-devtools-frontend/front_end/timeline/TimelineTreeView.js');
requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineProfileTree.js');
requireval('chrome-devtools-frontend/front_end/sdk/FilmStripModel.js');
requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineIRModel.js');
requireval('chrome-devtools-frontend/front_end/timeline_model/TimelineFrameModel.js');
requireval('chrome-devtools-frontend/front_end/timeline/PerformanceModel.js');

// minor configurations
requireval('./src/devtools-monkeypatches.js');

// copy from TimelineEeventOverview, used by `cpu` method in Sandbox
class Quantizer {
  constructor(startTime, quantDuration, callback) {
    this._lastTime = startTime;
    this._quantDuration = quantDuration;
    this._callback = callback;
    this._counters = [];
    this._remainder = quantDuration;
  }

  appendInterval(time, group) {
    let interval = time - this._lastTime;
    if (interval <= this._remainder) {
      this._counters[group] = (this._counters[group] || 0) + interval;
      this._remainder -= interval;
      this._lastTime = time;
      return;
    }
    this._counters[group] = (this._counters[group] || 0) + this._remainder;
    this._callback(this._counters);
    interval -= this._remainder;
    while (interval >= this._quantDuration) {
      const counters = [];
      counters[group] = this._quantDuration;
      this._callback(counters);
      interval -= this._quantDuration;
    }
    this._counters = [];
    this._counters[group] = interval;
    this._lastTime = time;
    this._remainder = this._quantDuration - interval;
  }
}

class Sandbox {
  constructor(events) {
    this._tracingModel = new SDK.TracingModel(new Bindings.TempFileBackingStorage('tracing'));

    if (typeof events === 'string') events = JSON.parse(events);
    // WebPagetest trace files put events in object under key `traceEvents`
    if (events.hasOwnProperty('traceEvents')) events = events.traceEvents;
    // WebPageTest trace files often have an empty object at index 0
    if (Object.keys(events[0]).length === 0) events.shift();

    this._tracingModel.addEvents(events);
    this._tracingModel.tracingComplete();
    this._performanceModel = new Timeline.PerformanceModel();
    this._performanceModel.setTracingModel(this._tracingModel);

    return this;
  }

  tracingModel() {
    return this._tracingModel;
  }

  performanceModel() {
    return this._performanceModel;
  }

  timelineModel() {
    return this.performanceModel().timelineModel();
  }

  frameModel() {
    return this.performanceModel().frameModel();
  }

  cpu() {
    // Based on Timeline.TimelineEventOverviewCPUActivity
    const timelineModel = this.timelineModel();
    const quantSizePx = 4;
    const width = 1000;
    const height = 1;
    const timeOffset = timelineModel.minimumRecordTime();
    const timeSpan = timelineModel.maximumRecordTime() - timeOffset;
    const scale = width / timeSpan;
    const quantTime = quantSizePx / scale;
    const categories = Timeline.TimelineUIUtils.categories();
    const categoryOrder = ['idle', 'loading', 'painting', 'rendering', 'scripting', 'other'];
    const otherIndex = categoryOrder.indexOf('other');
    const idleIndex = 0;
    const paths = {};

    for (let i = idleIndex + 1; i < categoryOrder.length; ++i) {
      categories[categoryOrder[i]]._overviewIndex = i;
    }
    for (let i = 0; i < categoryOrder.length; ++i) {
      paths[categoryOrder[i]] = [{
        timeOffset: 0,
        load: 0,
      }];
    }
    for (const track of timelineModel.tracks()) {
      if (track.type === TimelineModel.TimelineModel.TrackType.MainThread && track.forMainFrame) {
        drawThreadEvents(track.events);
      }
    }

    function drawThreadEvents(events) {
      const quantizer = new Quantizer(timeOffset, quantTime, drawSample);
      let x = 0;
      const categoryIndexStack = [];

      function drawSample(counters) {
        let y = 0;
        for (let i = idleIndex + 1; i < categoryOrder.length; ++i) {
          const h = (counters[i] || 0) / quantTime * height;
          y += h;
          paths[categoryOrder[i]].push({
            timeOffset: (x + quantSizePx / 2) / scale,
            load: y,
          });
        }
        x += quantSizePx;
      }

      function onEventStart(e) {
        const index = categoryIndexStack.length ? categoryIndexStack.peekLast() : idleIndex;
        quantizer.appendInterval(e.startTime, index);
        categoryIndexStack.push(Timeline.TimelineUIUtils.eventStyle(e).category._overviewIndex || otherIndex);
      }

      /**
       * @param {!SDK.TracingModel.Event} e
       */
      function onEventEnd(e) {
        quantizer.appendInterval(e.endTime, categoryIndexStack.pop());
      }

      TimelineModel.TimelineModel.forEachEvent(events, onEventStart, onEventEnd);
      quantizer.appendInterval(timeOffset + timeSpan + quantTime, idleIndex); // Kick drawing the last bucket.
      for (let i = categoryOrder.length - 1; i > 0; --i) {
        paths[categoryOrder[i]].push({
          timeOffset: timeSpan,
          load: 0,
        });
      }
    }

    return paths;
  }

  memory() {
    // Based on Timeline.TimelineEventOverviewMemory
    const timeOffset = this.timelineModel().minimumRecordTime();
    const tracks = this.timelineModel().tracks().filter(
        track => track.type === TimelineModel.TimelineModel.TrackType.MainThread && track.forMainFrame);
    const events = tracks.reduce((acc, track) => acc.concat(track.events), []);

    function isUpdateCountersEvent(event) {
      return event.name === TimelineModel.TimelineModel.RecordType.UpdateCounters;
    }
    return events.filter(isUpdateCountersEvent)
        .sort(SDK.TracingModel.Event.compareStartTime)
        .map(event => ({
          startTime: event.startTime,
          startTimeOffest: event.startTime - timeOffset,
          ...event.args.data, // including documents, jsEventListeners, jsHeapSizeUsed and nodes
        }));
  }

  frames() {
    return this.frameModel().frames();
  }
}

this.Sandbox = Sandbox;
