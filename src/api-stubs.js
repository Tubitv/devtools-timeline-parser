/* global Protocol UI SDK DataGrid */

const noop = function() {};

// other neccessary stubs
Protocol.TargetBase = noop;
Protocol.Agents = {};

UI.VBox = class {
  constructor() {
    this.element = { classList: { add: _ => {} } };
  }
};
UI.TreeElement = noop;

DataGrid.ViewportDataGrid = noop;
DataGrid.ViewportDataGridNode = noop;

SDK.targetManager = {};
SDK.targetManager.mainTarget = noop;
