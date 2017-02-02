// ============
// FBHelpers.js
// ============

// A collection of helper functions.

const FBHelpers = {
  Array: {
    // FBHelpers.Array.shuffle
    // -----------------------
    // Fisher-yates shuffle
    // array -> array
    shuffle: function(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    },

    // FBHelpers.Array.unique
    // -----------------------
    // Dedupes array values
    // array -> array
    unique: function(array) {
      return array.filter(function(item, index, inputArray) {
        return inputArray.indexOf(item) == index;
      });
    }
  },

  Object: {
    // FBHelpers.Object.clone
    // ----------------------
    // Returns a duplicate instance of an object. The object must be
    // serializable and only contain arrays, objects, numbers, and strings.
    // object -> object
    clone: function(object) {
      return JSON.parse(JSON.stringify(object));
    },

    // FBHelpers.Object.reverseTree
    // ----------------------------
    // Returns a new tree where the children array at each node has been
    // reversed. `key` should be the key for the children array at each node.
    // object, string -> object
    reverseTree: function(object, key) {
      object = FBHelpers.Object.clone(object);
      if (key in object) {
        object[key] = object[key].map(function(item) {
          return FBHelpers.Object.reverseTree(item, key);
        });
        object[key].reverse();
      }
      return object;
    },

    // FBHelpers.Object.assign
    // -----------------------
    // Polyfill. Use Object.assign if supporting OSX 10.11+
    // Copy the values of all enumerable own properties from one or more source
    // objects to a given object (the first argument).
    // object, object... -> object
    assign: function(target) {
      if (target !== undefined && target !== null) {
        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
          var source = arguments[index];
          if (source !== undefined && source !== null) {
            for (var nextKey in source) {
              if (source.hasOwnProperty(nextKey)) {
                output[nextKey] = source[nextKey];
              }
            }
          }
        }
        return output;
      }
    },

    // FBHelpers.Object.getValueAtKeyPath
    // ----------------------------------
    // Returns a value in an object at a given key path
    // keyPath: keys/indices concatenated with dot notation, e.g. "nodes.0.photo.uri"
    // object, string -> any
    getValueAtKeyPath: function(object, keyPath) {
      var cursor = object;

      if (keyPath.length > 0) {
        const query = keyPath.split('.');
        for (var i = 0; i < query.length; i++) {
          var curQuery = query[i];
          if (cursor == null || !cursor.hasOwnProperty(curQuery)) {
            return;
          }
          cursor = cursor[curQuery];
        }
      }

      return cursor;
    },

    // FBHelpers.Object.mergeTrees
    // ---------------------------
    // Returns a new tree by merging nodes. `callback` should take a pair
    // of nodes and return true if the nodes should be merged. `key` should be
    // the key for the children array at each node. The first two objects will
    // always be merged.
    // object, object, string, function -> object
    mergeTrees: function(objectA, objectB, key, callback) {
      const object = FBHelpers.Object.clone(objectA);
      objectB[key].forEach(function(itemB) {
        const indexA = objectA[key].findIndex(function(itemA) {
          return callback(itemA, itemB);
        });
        const itemA = objectA[key][indexA];
        if (itemA && key in itemA && key in itemB) {
          object[key][indexA] = FBHelpers.Object.mergeTrees(
            itemA, itemB, key, callback
          );
        } else {
          object[key].push(itemB);
        }
      });
      return object;
    },
  },

  NSObject: {
    // FBHelpers.NSObject.convertToObject
    // ----------------------------------
    // Converts an NSObject to a JavaScript object. The NSObject must be
    // serializable and only contain NSArrays, NSDictionaries, numbers, and
    // NSStrings.
    // NSObject -> object || NSError
    convertToObject: function(object) {
      const error = [[MOPointer alloc] init];
      const serialization = [NSJSONSerialization
                             dataWithJSONObject:object
                             options:NSJSONWritingPrettyPrinted
                             error:error];
      const string = [[NSString alloc] initWithData:serialization
                                           encoding:NSUTF8StringEncoding]);
      return [error value] || JSON.parse(String(string));
    },
  },

  NSArray: {
    // FBHelpers.NSArray.map
    // ---------------------
    // Returns a JS array containing every item of the given array passed
    // through the given callback function.
    // NSArray, function -> array
    map: function(array, callback) {
      const newArray = [];
      const count = [array count];
      for (var index = 0; index < count; index++) {
        newArray.push(callback(array.objectAtIndex(index), index));
      }
      return newArray;
    },

    // FBHelpers.NSArray.forEach
    // -------------------------
    // Calls the given callback function once for each item in the given array.
    // NSArray, function -> null
    forEach: function(array, callback) {
      const count = [array count];
      for (var index = 0; index < count; index++) {
        callback(array.objectAtIndex(index), index);
      }
    },

    // FBHelpers.NSArray.filter
    // ------------------------
    // Returns a new array containing every item that returns a truthy value
    // using the given callback function.
    // NSArray, function -> array
    filter: function(array, callback) {
      const matches = [];
      const arrayEnumerator = [array objectEnumerator];
      while (item = [arrayEnumerator nextObject]) {
        if (callback(item)) {
          matches.push(item);
        }
      }
      return matches;
    },

    // FBHelpers.NSArray.find
    // ----------------------
    // Returns the first item in the given array to return a truthy value using
    // the given callback function.
    // NSArray, function -> any
    find: function(array, callback) {
      const index = FBHelpers.NSArray.findIndex(array, callback);
      return array.objectAtIndex(index);
    },

    // FBHelpers.NSArray.findIndex
    // ---------------------------
    // Returns the index of the first item in the given array to return a truthy
    // value using the given callback function.
    // NSArray, function -> any
    findIndex: function(array, callback) {
      const count = [array count];
      for (var index = 0; index < count; index++) {
        if (callback(item)) {
          return index;
        }
      }
    },
  },

  MSArray: {
    // FBHelpers.MSArray.convertToNSArray
    // ----------------------------------
    // Converts an MSArray to an NSArray
    // MSArray -> NSArray | null
    convertToNSArray: function(array) {
      if ([array isKindOfClass:NSClassFromString('MSArray')]) {
        return [array array];
      } else if ([array isKindOfClass:NSArray]) {
        return array;
      }
    },
  },

  MSLayerGroup: {
    // FBHelpers.MSLayerGroup.filterChildren
    // -------------------------------------
    // Returns an array containing the direct child layers of the given group
    // that return a truthy value using the given callback function.
    // MSLayerGroup, function -> array
    filterChildren: function(group, callback) {
      const layers = FBHelpers.MSArray.convertToNSArray([group layers]);
      return FBHelpers.NSArray.filter(layers, callback);
    },

    // FBHelpers.MSLayerGroup.filterDescendants
    // ----------------------------------------
    // Returns an array containing the descendant layers of the given group that
    // return a truthy value using the given callback function.
    // MSLayerGroup, function -> array
    filterDescendants: function(group, callback) {
      return FBHelpers.NSArray.filter([group children], callback);
    },

    // FBHelpers.MSLayerGroup.forEachChild
    // -----------------------------------
    // Calls the given callback function once for each child
    // MSLayerGroup, function -> null
    forEachChild: function(group, callback) {
      FBHelpers.NSArray.forEach([group layers], callback)
    },

    // FBHelpers.MSLayerGroup.forEachDescendant
    // ----------------------------------------
    // Calls the given callback function once for each descendant
    // MSLayerGroup, function -> null
    forEachDescendant: function(group, callback) {
      FBHelpers.NSArray.forEach([group children], callback)
    },
  },

  MSShapeGroup: {
    // TODO:
    // Switch to FBSemaphore._convertToSketch._addFillOnLayer and add that to SemaphoreAPI
    // FBHelpers.MSShapeGroup.fillBase64Image
    // --------------------------------------
    // Sets the given shape group's fill as an image with given base64
    // Returns a boolean based on success
    // MSLayerGroup, function -> boolean
    fillBase64Image: function(layer, base64) {
      var image = [[MSImageData alloc] initWithData:base64 sha:nil];
      if (image) {
        const fills = [[layer style] fills];
        var fill;
        if ([fills count] == 0) {
          if (appVersionAtLeast(3.8)) {
            const kStylePartTypeFill = 0;
            fill = [[layer style] addStylePartOfType:kStylePartTypeFill];
          } else {
            fill = [[[layer style] fills] addNewStylePart];
          }
        } else {
          fill = [fills firstObject]; // Bottommost fill
        }
        const kFillTypePattern = 4; // Layer fill type - Pattern
        const kPatternTypeFill = 1; // layer fill pattern type - Fill (as opposed to tile)
        [fill setFillType:kFillTypePattern];
        [fill setPatternFillType:kPatternTypeFill];
        [fill setImage:image];
        return true;
      } else {
        return false;
      }
    },
  },
};
