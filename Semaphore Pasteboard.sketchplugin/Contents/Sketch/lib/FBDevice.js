// FBDevice
// Methods for working with devices we design for

const FBDevice = {
  defaultDevice: {
    "platform": "WWW",
    "name": "Desktop",
    "deviceDensity": 1,
    "workingDensity": 1,
  },

  devices: [
    {
      "platform": "iOS",
      "name": "iPhone5",
      "width": 320,
      "height": 568,
      "deviceDensity": 2,
    },
    {
      "platform": "iOS",
      "name": "iPhone6",
      "width": 375,
      "height": 667,
      "deviceDensity": 2,
    },
    {
      "platform": "iOS",
      "name": "iPhone6Plus",
      "width": 414,
      "height": 736,
      "deviceDensity": 3,
    },
    {
      "platform": "Material",
      "name": "HDPI",
      "width": 320,
      "height": 533,
      "deviceDensity": 1.5,
    },
    {
      "platform": "Material",
      "name": "XHDPI",
      "width": 360,
      "height": 640,
      "deviceDensity": 2,
    },
    {
      "platform": "Material",
      "name": "XXHDPI",
      "width": 360,
      "height": 640,
      "deviceDensity": 3,
    },
  ],

  detectDevice: function(artboardGroup) {
    if ([artboardGroup isKindOfClass:MSArtboardGroup]) {
      const frame = [artboardGroup frame];

      var bestMatch;
      for (var i = 0; i < this.devices.length; i++) {
        var device = this.devices[i];

        var heightRatio = [frame height] / device.height;
        var heightMatchesPoints = (heightRatio == 1);
        var heightMatchesPixels = (heightRatio == device.deviceDensity);

        var widthRatio = [frame width] / device.width;
        var widthMatchesPoints = (widthRatio == 1);
        var widthMatchesPixels = (widthRatio == device.deviceDensity);

        var workingDensity = [frame width] / device.width;

        var artboardPointHeight = [frame height] / workingDensity;

        var thisMatch = JSON.parse(JSON.stringify(device));
        thisMatch.workingDensity = workingDensity;

        // Perfect width and height match at 1x or pixel size
        if ((widthMatchesPoints && heightMatchesPoints) || 
            (widthMatchesPixels && heightMatchesPixels)) {
          return thisMatch;
        // Fallback for tall mobile artboards
        } else if ((widthMatchesPixels || widthMatchesPoints) && 
                   artboardPointHeight > device.height && !bestMatch) {
          // Don't exit out of the loop, there may be a perfect match
          bestMatch = thisMatch;
        }
      }

      if (bestMatch) {
        return bestMatch;
      } else {
        return this.defaultDevice;
      }
    }
  },

  detectDevices: function(artboards) {
    const matches = [];
    for(var i = 0; i < [artboards count]; i++) {
      var detectedDevice = this.detectDevice([artboards objectAtIndex:i]);
      if (detectedDevice) {
        matches.push(detectedDevice);
      }
    }
    return matches;
  },

  // Detects device density + working density from artboards returns densities 
  // only if all artboards match
  strictDetectDensities: function(artboards) {
    const detectedDevices = this.detectDevices(artboards);

    if (detectedDevices.length) {
      const lastMatchedDeviceDensity = detectedDevices[0].deviceDensity;
      const lastMatchedWorkingDensity = detectedDevices[0].workingDensity;

      for (var i = 1; i < detectedDevices.length; i++) {
        var device = detectedDevices[i];
        var isDefaultDevice = (device.platform == this.defaultDevice.platform &&
                               device.name == this.defaultDevice.name);
        var deviceDensityMatches = (lastMatchedDeviceDensity == device.deviceDensity);
        var workingDensityMatches = (lastMatchedWorkingDensity == device.workingDensity);
        if (isDefaultDevice || !deviceDensityMatches || !workingDensityMatches) {
          return;
        }
      }

      return {
        deviceDensity: lastMatchedDeviceDensity,
        workingDensity: lastMatchedWorkingDensity,
      };
    }
  },
}