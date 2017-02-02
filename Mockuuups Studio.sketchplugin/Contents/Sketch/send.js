function onRun (context) {
  var doc = context.document;

  if ([doc isDocumentEdited] || ![doc fileURL] || [doc isDraft]) {
    [NSApp displayDialog:@"Please save the document before we can import it into Mockuuups Studio." withTitle:@"Mockuuups Studio"];
    return;
  }

  var workspace = [NSWorkspace sharedWorkspace];
  var applicationPath = [workspace absolutePathForAppBundleWithIdentifier:@"com.electron.mockuuups-studio"] || [workspace absolutePathForAppBundleWithIdentifier:@"com.mockuuups.studio-app"];
  if (!applicationPath) {
    [NSApp displayDialog:@"Please make sure that you installed and launched it: https://www.mockuuups.com/studio/" withTitle:"Could not find Mockuuups Studio"];
    return;
  }

  var file = [[doc fileURL] path];
  [workspace openFile:file withApplication:applicationPath andDeactivate:true];

  var sketch = context.api()
  sketch.message('Opening this document in Mockuuups Studio…');
}
