function connectMirror (context) {
  var doc = context.document;
  var sketch = context.api();

  var mirror;
  try {
    mirror = NSApp.delegate().mirrorController();
  } catch (e) {}
  if (!mirror) {
    sketch.message('Unexpected error happened (Error 101)');
    return;
  }
  var url;
  try {
    url = mirror.authorizedWebURL();
  } catch (e) {}
  if (!url) {
    sketch.message('Unexpected error happened (Error 102)');
    return;
  }

  var dict = [NSMutableDictionary dictionary];
  [dict setObject:[url absoluteString] forKey:@"url"];

  var tempDir = NSTemporaryDirectory();
  var tempFile = [tempDir stringByAppendingPathComponent:[[[NSUUID UUID] UUIDString] stringByAppendingPathExtension:@"studiomirror"]];
  var outputStream = [NSOutputStream outputStreamToFileAtPath:tempFile append:false];
  [outputStream open];
  [NSJSONSerialization writeJSONObject:dict toStream:outputStream options:0 error:null];
  [outputStream close];

  var workspace = [NSWorkspace sharedWorkspace];
  var applicationPath = [workspace absolutePathForAppBundleWithIdentifier:@"com.electron.mockuuups-studio"] || [workspace absolutePathForAppBundleWithIdentifier:@"com.mockuuups.studio-app"];
  if (!applicationPath) {
    [NSApp displayDialog:@"Please make sure that you installed and launched it: https://mockuuups.studio/" withTitle:"Could not find Mockuuups Studio"];
    return;
  }

  [workspace openFile:tempFile withApplication:applicationPath andDeactivate:true];

  sketch.message('Opening this document in Mockuuups Studio…');
}
