//   ____                                             
//  (|   \                                         |  
//   |    | _    _   ,_    _   __   __, _|_  _   __|  
//  _|    ||/  |/ \_/  |  |/  /    /  |  |  |/  /  |  
// (/\___/ |__/|__/    |_/|__/\___/\_/|_/|_/|__/\_/|_/
//            /|                                      
//            \|                                       

// FBArrayTools => FBHelpers
// Helpers for JS arrays and object

const FBArray = {
  // Converts an NSDictionary, NSArray or JS Object and its contents
  // into JS friendly Numbers, Strings, and Objects recursively
  convertToJS: function(object) {
    var convertedObject = object;

    if (object && object.isKindOfClass) {
      if ([object isKindOfClass:NSDictionary]) {
        convertedObject = {};
        for (var key in object) {
          convertedObject[key] = object[key];
        }
      } else if ([object isKindOfClass:NSArray]) {
        convertedObject = [];
        for (var i = 0; i < [object count]; i++) {
          convertedObject.push([object objectAtIndex:i]);
        }
      } else if (!isNaN(convertedObject)) {
        convertedObject = Number(convertedObject);
      } else {
        convertedObject = String(convertedObject);
      }
    }

    if (convertedObject instanceof Object) {
      for (var key in convertedObject) {
        convertedObject[key] = FBArray.convertToJS(convertedObject[key]);
      }
    }

    return convertedObject;
  },

  indexOfStringInArray: function(str, arr, strictMatch) {
    arr = FBArray.convertToJS(arr);
    const search = String(str).toLowerCase();
    if (search.length > 0) {
      if (strictMatch) {
        return arr.indexOf(search);
      } else {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].toLowerCase().match(FBArray._escStr(search.toLowerCase()))) {
            return i;
          }
        }
      }
    }
    return -1;
  },

  filterArray: function(arr, search) {
    arr = FBArray.convertToJS(arr);
    var filteredArr = [];
    const searchStr = String(search);
    if (searchStr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        var curStr = String(arr[i]);
        if (curStr.toLowerCase().match(FBArray._escStr(searchStr.toLowerCase()))) {
          filteredArr.push(arr[i]);
        }
      }
    }
    return filteredArr;
  },

  combineProps: function(obj1, obj2) {
    var obj3 = {};
    for (var key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        obj3[key] = obj1[key];
      }
    }
    for (var key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        obj3[key] = obj2[key];
      }
    }
    return obj3;
  },

  clone: function(object) {
    return JSON.parse(JSON.stringify(object));
  },

  filterArrayOfObjByKey: function(arr, key, search) {
    arr = FBArray.convertToJS(arr);
    var filteredArr = [];
    const searchStr = String(search);
    if (searchStr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        var curItem = String(arr[i][key]);
        if (curItem.toLowerCase().match(FBArray._escStr(searchStr.toLowerCase()))) {
          filteredArr.push(arr[i]);
        }
      }
    }
    return filteredArr;
  },

  // Returns closest number in a provided array
  closestNumInArray: function(num, arr) {
    arr = FBArray.convertToJS(arr);
    var curr = arr[0];
    var diff = Math.abs(num - curr);
    for (var val = 0; val < arr.length; val++) {
      var newDiff = Math.abs(num - arr[val]);
      if (newDiff < diff) {
        diff = newDiff;
        curr = arr[val];
      }
    }
    return curr;
  },

  // Private helpers
  _escStr: function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
}