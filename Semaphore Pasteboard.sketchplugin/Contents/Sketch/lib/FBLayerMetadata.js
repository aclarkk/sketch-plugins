// ------------------
// FBLayerMetadata.js
// ------------------

// Usage
// -----
// 1. Instantiate a new FBLayerMetadata object using a plugin key. Once you have 
//    created an instance of FBLayerMetadata, you can use any of the instance 
//    methods below.
//
//    layerMetadata = new FBLayerMetadata("pluginKey");
//    layerMetadata.setValue(layer, "key", "value");
//    layerMetadata.getValue(layer, "key"); 
//      -> "value"
//
// 2. Call a class method of FBLayerMetadata directly, with or without 
//    instantiating it.
//    
//    FBLayerMetadata.getMetadata(layer);
//      -> {
//           "pluginKey" : {
//             "key" : "value"
//           }
//         }
//
//    FBLayerMetadata.getPluginMetadata(layer, "pluginKey");
//      -> {
//           "key" : "value"
//         }
//
//    FBLayerMetadata.getPluginValue(layer, "pluginKey", "key");
//      -> "value"
const kSketchPluginIdentifier = "com.facebook.sketchplugins";

const FBLayerMetadata = function(pluginKey) {

  if (invalidPluginKey(pluginKey)) {
    log("[FBLayerMetadata] Tried to instantiate with an invalid plugin key.");
    return;
  }

  // Instance Method
  // ---------------
  // Returns the arbitrary metadata stored on a layer by this plugin for a 
  // specified key.
  this.getValue = function(layer, key) {
    return FBLayerMetadata.getPluginValue(layer, pluginKey, key);
  }

  // Instance Method
  // ---------------
  // Stores the given value on the specified layer under the given key for this 
  // plugin. Values passed to this method must be composed of arrays, 
  // dictionaries, numbers and strings.
  this.setValue = function(layer, key, value) {
    FBLayerMetadata.setPluginValue(layer, pluginKey, key, value);
  }

  // Instance Method
  // ---------------
  // Merges the given dictionary with the metadata stored on a layer by this 
  // plugin. The dictionary passed to this method must be composed of arrays, 
  // dictionaries, numbers and strings.
  this.setValues = function(layer, dictionary) {
    FBLayerMetadata.setPluginValues(layer, pluginKey, dictionary);
  }

  // Instance Method
  // ---------------
  // Returns all the arbitrary metadata stored on a layer by this plugin.
  this.getMetadata = function(layer) {
    return FBLayerMetadata.getPluginMetadata(layer, pluginKey);
  }

  // Instance Method
  // ---------------
  // Returns the plugin FBLayerMetadata was instantiated with.
  this.getPluginKey = function() {
    return pluginKey;
  }

};

// Create a new scope so we can share private stuff between the class methods.
(function() {

  const pluginCommand = MSPluginCommand.alloc().init();

  // Class Method
  // ------------
  // Returns the arbitrary metadata stored on a layer by a plugin for a 
  // specified key. This is similar to the instance method getValue, but can be 
  // used to share metadata between plugins.
  FBLayerMetadata.getPluginValue = function(layer, pluginKey, key) {
    if (invalidPluginKey(pluginKey)) {
      log("[FBLayerMetadata] Tried to set a value for an invalid plugin key.");
      return;
    }
    const pluginMetadata = FBLayerMetadata.getPluginMetadata(layer, pluginKey);
    return pluginMetadata[key];
  }

  // Class Method
  // ------------
  // Stores the given value on the specified layer under the given key for a 
  // plugin. Values passed to this method must be composed of arrays, 
  // dictionaries, numbers and strings. This is similar to the instance method 
  // setValue, but can be used to share metadata between plugins.
  FBLayerMetadata.setPluginValue = function(layer, pluginKey, key, value) {
    if (invalidPluginKey(pluginKey)) {
      log("[FBLayerMetadata] Tried to set a value for an invalid plugin key.");
      return;
    }
    const pluginMetadata = FBLayerMetadata.getPluginMetadata(layer, pluginKey);
    pluginMetadata[key] = value;
    setPluginMetadata(layer, pluginKey, pluginMetadata);
  }

  // Class Method
  // ------------
  // Merges the given dictionary with the metadata stored on a layer by a 
  // plugin. The dictionary passed to this method must be composed of arrays, 
  // dictionaries, numbers and strings. This is similar to the instance method 
  // setValues, but can be used to share metadata between plugins.
  FBLayerMetadata.setPluginValues = function(layer, pluginKey, dictionary) {
    if (invalidPluginKey(pluginKey)) {
      log("[FBLayerMetadata] Tried to set values for an invalid plugin key.");
      return;
    }
    var pluginMetadata = FBLayerMetadata.getPluginMetadata(layer, pluginKey);
    pluginMetadata.addEntriesFromDictionary(dictionary);
    setPluginMetadata(layer, pluginKey, pluginMetadata);
  }

  // Class Method
  // ------------
  // Returns all the arbitrary metadata stored on a layer by a plugin. This 
  // is similar to the instance method getMetadata, but can be used to share 
  // metadata between plugins.
  FBLayerMetadata.getPluginMetadata = function(layer, pluginKey) {
    const metadata = FBLayerMetadata.getMetadata(layer);
    if (metadata[pluginKey]) {
      return metadata[pluginKey].mutableCopy();
    } else {
      return NSMutableDictionary.alloc().init();
    }
  }

  // Class Method
  // ------------
  // Returns all the arbitrary metadata stored on a layer for all plugins.
  FBLayerMetadata.getMetadata = function(layer) {
    const metadata = pluginCommand.valueForKey_onLayer_forPluginIdentifier(
      metadataKey,
      layer,
      kSketchPluginIdentifier
    );
    if (metadata) {
      return metadata.mutableCopy();
    } else {
      return NSMutableDictionary.alloc().init();
    }
  }

  // -------
  // Private
  // -------

  const setPluginMetadata = function(layer, pluginKey, pluginMetadata) {
    const metadata = FBLayerMetadata.getMetadata(layer);
    metadata[pluginKey] = pluginMetadata;
    setMetadata(layer, metadata);
  }

  const setMetadata = function(layer, metadata) {
    pluginCommand.setValue_forKey_onLayer_forPluginIdentifier(
      metadata,
      metadataKey,
      layer,
      kSketchPluginIdentifier
    );
  }

  const metadataKey = "FBLayerMetadata";

})();