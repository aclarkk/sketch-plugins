function loadFramework(frameworkName, frameworkClass, directory) {
  if (NSClassFromString(frameworkClass) == null) {
    var mocha = [Mocha sharedRuntime];
    return [mocha loadFrameworkWithName:frameworkName inDirectory:directory];
  } else {
    return true;
  }
}

function loadFrameworks(scriptPath) {
  var pluginRoot = [scriptPath stringByDeletingLastPathComponent];
  loadFramework('Panels', 'ICPanelsManager', pluginRoot);
}
