@import '../lib/FBSemaphore.js';
@import '../lib/vendor/MochaJSDelegate.js';

var onDocumentOpen = function(context) {
  const pasteboardManager = [MSPasteboardManager applicationPasteboardManager];
  const pasteboardType = "com.facebook.semaphore";
  const classPrefix = "Semaphore_DynamicClass_"

  const readerDelegate = new MochaJSDelegate({
    "pasteboardDataFromPasteboard:sender:": (function(pasteboard, sender) {
      const layers = FBSemaphore.convertToSketch(
        JSON.parse([pasteboard stringForType:pasteboardType])
      );
      return [MSPasteboardLayers pasteboardLayersWithLayers:layers];
    }),
    "supportedPasteboardTypes": (function(pasteboard, sender) {
      return [NSArray arrayWithArray:[pasteboardType]];
    }),
  }, classPrefix);

  const writerDelegate = new MochaJSDelegate({
    "writeData:toPasteboard:": (function(pasteboardLayers, pasteboard) {
      const ownerDelegate = new MochaJSDelegate({
        "pasteboard:provideDataForType:": (function(pasteboard, type) {
          const semaphore = FBSemaphore.convertToSemaphore(
            [[pasteboardLayers layers] layers],
            {
              "guessDensity": true,
            }
          );
          [pasteboard setString:JSON.stringify(semaphore)
                        forType:pasteboardType];
        }),
      });
      [pasteboard addTypes:[pasteboardType]
                     owner:ownerDelegate.getClassInstance()];
    }),
    "supportedPasteboardTypes": (function(pasteboard, sender) {
      return [NSArray arrayWithArray:[pasteboardType, NSPasteboardTypeString]];
    }),
    "canWriteDataToPasteboard": (function(pasteboard) {
      return true;
    }),
  }, classPrefix);

  // Check to see if we've registered already
  if (!isRegistered()) {
    [[COScript currentCOScript] setShouldKeepAround:true];
    [pasteboardManager registerReader:readerDelegate.getClassInstance()];
    [pasteboardManager registerWriter:writerDelegate.getClassInstance()];
  }

  // ----------------
  // Helper Functions
  // ----------------

  function isRegistered() {
    const readerClassName = String(
      [[[pasteboardManager readers] lastObject] class]
    );
    const writerClassName = String(
      [[[pasteboardManager writers] lastObject] class]
    );
    const internalPluginsInstalled = NSApplication
      .sharedApplication()
      .delegate()
      .pluginManager()
      .plugins()["com.facebook.sketchplugins"] !== null;
    return ((readerClassName.indexOf(classPrefix) === 0 &&
            writerClassName.indexOf(classPrefix) === 0) ||
            internalPluginsInstalled);
  }
}
