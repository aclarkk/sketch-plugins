@import "../lib/FBDevice.js";
@import "../lib/FBArrayTools.js";
@import "../lib/FBHelpers.js";
@import "../lib/FBLayerMetadata.js";
@import "../lib/Semaphore/Semaphore.js";

// --------------
// FBSemaphore.js
// --------------

var FBSemaphore = {

  // Converts an array of MSLayers into a Semaphore document.
  // [MSLayer...], object -> Semaphore
  // props (optional):
  //   analytics: FBAnalytics
  //   excludeChildren: boolean
  //   guessDensity: boolean
  //   includeLayerId: boolean
  convertToSemaphore: function(layers, props) {
    var doc = NSApp.delegate().pluginContext().document;
    var currentPage = [doc currentPage];
    this._convertToSemaphore.temporaryPage = [doc addBlankPage];
    this._convertToSemaphore.images = [];
    this._convertToSemaphore.doc = doc;
    var semaphore = {};
    semaphore.version = this._version;
    semaphore.layers = this._convertToSemaphore.MSLayers(layers, props);
    semaphore.images = this._convertToSemaphore.images;
    if (props && props.guessDensity === true) {
      var array = [NSArray arrayWithArray:layers];
      var layer = [array objectAtIndex:0];
      var parentArtboard = [layer parentArtboard];
      if (parentArtboard) {
        var platformAndDensity = this._getArtboardPlatformAndDensity(
          parentArtboard
        );
        semaphore.density = platformAndDensity.density;
      }
    }
    [doc removePage:this._convertToSemaphore.temporaryPage];
    [doc setCurrentPage:currentPage];
    return semaphore;
  },

  // Converts a Semaphore document into an array of MSLayers.
  convertToSketch: function(semaphore) {
    this._convertToSketch.version = semaphore.version;
    this._convertToSketch.images = semaphore.images;
    return this._convertToSketch.Layers(semaphore.layers);
  },

  // ------------------------------
  // Private properties and methods
  // ------------------------------

  _version: 10,
  _enum: {
    "TextAlignment": ["left", "right", "center", "justified"],
    "GradientType": ["linear", "radial"],
    "FillType": ["color", "gradient", null, null, "image"],
    "BorderPosition": ["center", "inside", "outside"],
    "PathCommandType": {
      "M": "moveTo",
      "L": "lineTo",
      "C": "curveTo",
      "Z": "closePath",
    },
    "MSStylePart": {
      "Fill": 0,
      "Border": 1,
      "Shadow": 2,
      "InnerShadow": 3,
    },
    "MetadataType": {
      "glyph": "glyph",
      "component": "component",
      "id": "id",
    },
    "AnalyticsAction": {
      "component" : "Exported Component",
      "glyph" : "Exported Glyph",
    },
  },

  _getArtboardPlatformAndDensity: function(artboardGroup) {
    var platformAndDensity = {};

    var metadata = FBLayerMetadata.getMetadata(artboardGroup);
    if (metadata.SpecKit) {
      platformAndDensity.platform = String(metadata.SpecKit.platform);
      platformAndDensity.density = Number(metadata.SpecKit.density);
    } else {
      var device = FBDevice.detectDevice(artboardGroup);
      platformAndDensity.platform = device.platform;
      platformAndDensity.density = device.workingDensity;
    }

    return platformAndDensity;
  },

  _convertToSemaphore: {

    // MSArtboardGroup, object -> LayerTypeArtboard
    MSArtboardGroup: function(artboardGroup, props) {
      var semaphore = {};

      semaphore.type = "artboard";
      semaphore.layers = (props && props.excludeChildren === true)
        ? []
        : this.MSLayers([artboardGroup layers], props);
      var platformAndDensity = FBSemaphore._getArtboardPlatformAndDensity(
        artboardGroup
      );
      semaphore.platform = platformAndDensity.platform;
      semaphore.density = platformAndDensity.density;
      if ([artboardGroup hasBackgroundColor]) {
        semaphore.fill = {};
        semaphore.fill.type = "color";
        semaphore.fill.color = Semaphore.Color
          .fromMSColor([artboardGroup backgroundColorGeneric])
          .toSemaphore();
      }

      return semaphore;
    },

    // MSBitmapLayer -> LayerTypeRectangle
    MSBitmapLayer: function(bitmapLayer) {
      var semaphore = {};

      semaphore.type = "rectangle";
      semaphore.fill = {};
      semaphore.fill.type = "image";

      var hasEnabledFill = function(layer) {
        var fills = FBHelpers.MSArray.convertToNSArray([[layer style] fills]);
        var fillsEnumerator = [fills objectEnumerator];
        while (fill = [fillsEnumerator nextObject]) {
          if ([fill isEnabled]) {
            return true;
          }
        };
        return false;
      }

      if (hasEnabledFill(bitmapLayer)) {
        // This flattens all the style attributes of an MSBitmapLayer into a
        // bitmap, for bitmap layers with color fills.
        var temporaryBitmapLayer = [bitmapLayer copyWithZone:nil];
        var temporaryFrame = [temporaryBitmapLayer frame];
        [temporaryFrame setX:0];
        [temporaryFrame setY:0];

        var temporaryArtboard = [[MSArtboardGroup alloc] init];
        // Copy the layer frame to the artboard
        var temporaryRect = Semaphore.Rect
          .fromMSRect([temporaryBitmapLayer frame])
          .toMSRect();
        [temporaryArtboard setFrame:temporaryRect];
        [temporaryArtboard addLayers:[temporaryBitmapLayer]];

        [(this.temporaryPage) addLayers:[temporaryArtboard]];

        var temporaryDirectoryPath = NSTemporaryDirectory();
        var globallyUniqueString = [[NSProcessInfo processInfo]
                                    globallyUniqueString];
        var temporaryFilePath = temporaryDirectoryPath +
                                globallyUniqueString +
                                ".png";

        [(this.doc) saveArtboardOrSlice:temporaryArtboard toFile:temporaryFilePath];
        var image = [[NSImage alloc] initWithContentsOfFile:temporaryFilePath];

        [temporaryArtboard removeFromParent];
        var fileManager = [NSFileManager defaultManager];
        if ([fileManager isDeletableFileAtPath:temporaryFilePath]) {
          [fileManager removeItemAtPath:temporaryFilePath error:nil];
        }

        semaphore.fill.image = this.NSImage(image, [bitmapLayer frame]);
      } else {
        semaphore.fill.image = this.NSImage([bitmapLayer NSImage], [bitmapLayer frame]);
      }

      return semaphore;
    },

    // MSLayer, object -> Layer || null
    MSLayer: function(layer, props) {
      var semaphore;

      var className = NSStringFromClass([layer class]);
      if (className == "MSShapeGroup") {
        semaphore = this.MSShapeGroup(layer);
      } else if (className == "MSLayerGroup") {
        semaphore = this.MSLayerGroup(layer, props);
      } else if (className == "MSTextLayer") {
        semaphore = this.MSTextLayer(layer);
      } else if (className == "MSBitmapLayer") {
        semaphore = this.MSBitmapLayer(layer);
      } else if (className == "MSArtboardGroup") {
        semaphore = this.MSArtboardGroup(layer, props);
      } else if (className == "MSSymbolInstance") {
        var temporaryLayer = [layer copyWithZone:nil];
        [(this.temporaryPage) addLayers:[temporaryLayer]];
        var temporaryGroup = [temporaryLayer detachByReplacingWithGroup];
        // If there are no layers in the symbol, `detachByReplacingWithGroup`
        // will return null.
        if (temporaryGroup != null) {
          var semaphore = this.MSLayer(temporaryGroup, props);
          [temporaryGroup removeFromParent];
          return semaphore;
        }
      }

      if (!semaphore) {
        // Return null if none of the functions above are run or return semaphore.
        return;
      }

      semaphore.name = semaphore.name = String([layer name]).replace(
        /\u2028/g, "\n"
      );
      semaphore.frame = Semaphore.Rect.fromMSRect([layer frame]).toSemaphore();

      // -------------------
      // Optional properties
      // -------------------

      // If the optional properties match the Semaphore defaults, nothing is
      // written to the JSON

      var style = [layer style];

      // Semaphore default value is true
      if (![layer isVisible]) {
        semaphore.visible = Boolean([layer isVisible]);
      }

      // Semaphore default value is false
      if ([layer isLocked]) {
        semaphore.locked = Boolean([layer isLocked]);
      }

      // Semaphore default value is false
      if ([layer hasClippingMask]) {
        semaphore.mask = Boolean([layer hasClippingMask]);
      }

      // Semaphore default value is 0
      if ([layer rotation] != 0) {
        // Semaphore rotations are clockwise, Sketch is counterclockwise
        semaphore.rotation = -[layer rotation];
      }

      // Semaphore default value is 1
      if ([[style contextSettings] opacity] != 1) {
        semaphore.opacity = [[style contextSettings] opacity];
      }

      // Find the first enabled style in a MSStylePartCollection
      // MSStylePartCollection -> MSStylePart || false
      var topmostEnabledStyle = function(stylePartCollection) {
        stylePartCollection = FBHelpers.MSArray.convertToNSArray(stylePartCollection);
        var stylePartCollectionEnumerator = [stylePartCollection reverseObjectEnumerator];
        while (stylePart = [stylePartCollectionEnumerator nextObject]) {
          if ([stylePart isEnabled]) {
            return stylePart;
          }
        };
        return false;
      }

      var fill = topmostEnabledStyle([style fills]);
      if (fill && className != "MSBitmapLayer" && className != "MSArtboardGroup") {
        semaphore.fill = this.MSStyleFill(fill);
      }

      var border = topmostEnabledStyle([style borders]);
      if (border) {
        semaphore.border = this.MSStyleBorder(border);
      }

      var shadows = FBHelpers.MSArray.convertToNSArray([style shadows]);
      var shadowsEnumerator = [shadows objectEnumerator];
      while (shadow = [shadowsEnumerator nextObject]) {
        if ([shadow isEnabled]) {
          if (!semaphore.shadows) {
            semaphore.shadows = [];
          }
          semaphore.shadows.push(this.MSStyleShadow(shadow));
        }
      };

      var innerShadows = FBHelpers.MSArray.convertToNSArray([style innerShadows]);
      var innerShadowsEnumerator = [innerShadows objectEnumerator];
      while (innerShadow = [innerShadowsEnumerator nextObject]) {
        if ([innerShadow isEnabled]) {
          if (!semaphore.innerShadows) {
            semaphore.innerShadows = [];
          }
          semaphore.innerShadows.push(this.MSStyleShadow(innerShadow));
        }
      };

      if (!semaphore.metadata) {
        semaphore.metadata = {};
      }

      if (style.blurGeneric().isEnabled()) {
        if (!semaphore.metadata.Sketch) {
          semaphore.metadata.Sketch = {};
        }
        const blur = style.blurGeneric();
        semaphore.metadata.Sketch.blur = {};
        semaphore.metadata.Sketch.blur.center = Semaphore.Point
          .fromCGPoint(blur.center())
          .toSemaphore();
        semaphore.metadata.Sketch.blur.motionAngle = Number(blur.motionAngle());
        semaphore.metadata.Sketch.blur.radius = Number(blur.radius());
        semaphore.metadata.Sketch.blur.type = Number(blur.type());
      }

      var metadata = FBLayerMetadata.getMetadata(layer);
      var hasGlyphName = semaphore.name.substring(0, 6) == "glyph-";
      var isBitmapLayer = className == "MSBitmapLayer";
      if (!semaphore.metadata) {
        semaphore.metadata = {};
      }
      if (props && props.includeLayerId) {
        semaphore.metadata[FBSemaphore._enum.MetadataType.id] = layer.objectID();
      }
      if (metadata.GlyphKit || (hasGlyphName && isBitmapLayer)) {
        if (metadata.GlyphKit) {
          semaphore.metadata.glyph = FBArray.convertToJS(metadata.GlyphKit);
        } else {
          // Repair missing GlyphKit metadata on old glyph
          semaphore.metadata.glyph = {
            "name": semaphore.name.replace("glyph-", ""),
          };

          if ([layer parentArtboard]) {
            const artboardMetadata = FBLayerMetadata.getMetadata([layer parentArtboard]);
            if (artboardMetadata.SpecKit &&
                artboardMetadata.SpecKit.density) {
              const artboardDensity = Number(artboardMetadata.SpecKit.density);
              semaphore.metadata.glyph.size = semaphore.frame.width / artboardDensity;
            }
          }
        }

        if (fill) {
          semaphore.metadata.glyph.fill = this.MSStyleFill(fill);
        }

        semaphore.metadata.glyph.image = this.NSImage([layer NSImage], [layer frame]);

        if (props && props.hasOwnProperty("analytics")) {
          props.analytics.trackEvent({
            'action': FBSemaphore._enum.AnalyticsAction.glyph,
            'name': semaphore.metadata.glyph.name,
            'size': semaphore.metadata.glyph.size,
            'density': semaphore.metadata.glyph.density,
          });
        }
      }

      if (metadata.InterfaceKit && className != "MSArtboardGroup") {
        semaphore.metadata[FBSemaphore._enum.MetadataType.component] = FBArray.convertToJS(metadata.InterfaceKit);
        if (props && props.hasOwnProperty("analytics")) {
          props.analytics.trackEvent({
            'action': FBSemaphore._enum.AnalyticsAction.component,
            'platform': semaphore.metadata.component.platform,
            'element': semaphore.metadata.component.element,
            'variant': semaphore.metadata.component.variant,
            'size': semaphore.metadata.component.size,
            'option': semaphore.metadata.component.option,
            'state': semaphore.metadata.component.state,
            'version': semaphore.metadata.component.version,
          });
        }
      }

      return semaphore;
    },

    // MSLayerGroup, object -> LayerTypeGroup
    MSLayerGroup: function(layerGroup, props) {
      var semaphore = {};

      semaphore.type = "group";
      semaphore.layers = (props && props.excludeChildren === true)
        ? []
        : this.MSLayers([layerGroup layers], props);

      return semaphore;
    },

    // [MSLayer...], object -> [Layer...]
    MSLayers: function(layers, props) {
      var semaphore = [];

      if (layers.array) {
        var layersEnumerator = [[layers array] objectEnumerator];
      } else if (layers.objectEnumerator) {
        var layersEnumerator = [layers objectEnumerator];
      } else {
        layers = [NSArray arrayWithArray:layers];
        var layersEnumerator = [layers objectEnumerator];
      }
      while (layer = [layersEnumerator nextObject]) {
        var semaphoreLayer = this.MSLayer(layer, props);
        if (semaphoreLayer) {
          semaphore.push(semaphoreLayer);
        }
      };

      return semaphore;
    },

    // MSShapeGroup -> LayerTypeRectangle ||
    //                 LayerTypeEllipse ||
    //                 LayerTypeShape ||
    //                 null
    MSShapeGroup: function(shapeGroup) {
      var semaphore = {};

      var layers = [shapeGroup layers];
      var oneChildLayer = ([layers count] == 1);
      var firstChild = [layers objectAtIndex:0];
      var firstChildIsRectangle = [firstChild isKindOfClass:MSRectangleShape];
      var firstChildIsOval = [firstChild isKindOfClass:MSOvalShape];
      var numberOfPoints = [[firstChild path] numberOfPoints];

      if (oneChildLayer && firstChildIsRectangle && numberOfPoints == 4) {
        semaphore.type = "rectangle";
        if ([firstChild cornerRadiusFloat] != 0) {
          semaphore.cornerRadius = [firstChild cornerRadiusFloat];
        }
        if ([firstChild cornerRadiusString] != 0) {
          semaphore.metadata = {
            "Sketch": {
              "cornerRadiusString": String([firstChild cornerRadiusString]),
            },
          };
        }
      } else if (oneChildLayer && firstChildIsOval && numberOfPoints == 4) {
        semaphore.type = "ellipse";
      } else if ([shapeGroup bezierPath]) {
        semaphore.type = "shape";
        semaphore.path = this.NSBezierPath(
          [shapeGroup bezierPath], [shapeGroup frame]
        );
        if (!semaphore.path) {
          // Return null if the layer doesn't have any path commands.
          return;
        }
      } else {
        // Return null if the layer doesn't have a `bezierPath` property.
        return;
      }

      return semaphore;
    },

    // MSStyleBorder -> Border
    MSStyleBorder: function(styleBorder) {
      var semaphore = {};

      semaphore.thickness = [styleBorder thickness];
      semaphore.position = FBSemaphore._enum.BorderPosition[
        [styleBorder position]
      ];
      semaphore.type = FBSemaphore._enum.FillType[[styleBorder fillType]];

      if (semaphore.type == "color") {
        semaphore.color = Semaphore.Color
          .fromMSColor([styleBorder color])
          .toSemaphore();
      } else if (semaphore.type == "gradient") {
        semaphore.gradient = Semaphore.Gradient
          .fromMSGradient([styleBorder gradient])
          .toSemaphore();
      }

      return semaphore;
    },

    // MSStyleFill -> Fill
    MSStyleFill: function(styleFill) {
      var semaphore = {};

      var layer = [[styleFill parentStyle] parentLayer];

      semaphore.type = FBSemaphore._enum.FillType[[styleFill fillType]];

      if (semaphore.type == "color") {
        semaphore.color = Semaphore.Color
          .fromMSColor([styleFill color])
          .toSemaphore();
      } else if (semaphore.type == "gradient") {
        semaphore.gradient = Semaphore.Gradient
          .fromMSGradient([styleFill gradient])
          .toSemaphore();
        // Semaphore.Fill will handle this eventually
        fillOpacity = [[styleFill contextSettings] opacity];
        semaphore.gradient.startColor.a *= fillOpacity;
        semaphore.gradient.endColor.a *= fillOpacity;
      } else if (semaphore.type == "image") {
        semaphore.image = this.NSImage([[styleFill image] NSImage], [layer frame]);
      }

      return semaphore;
    },

    // MSStyleShadow -> Shadow
    MSStyleShadow: function(styleShadow) {
      var semaphore = {};

      semaphore.offset = {
        "x": [styleShadow offsetX],
        "y": [styleShadow offsetY],
      };
      semaphore.blur = [styleShadow blurRadius];
      semaphore.spread = [styleShadow spread];
      semaphore.color = Semaphore.Color
        .fromMSColor([styleShadow color])
        .toSemaphore();

      return semaphore;
    },

    // MSLayerGroup -> LayerTypeText
    MSTextLayer: function(textLayer) {
      var semaphore = {};

      semaphore.type = "text";
      semaphore.value = String([textLayer stringValue]).replace(
        /\u2028/g, "\n"
      );
      semaphore.fontPostscriptName = String([textLayer fontPostscriptName]);
      semaphore.textColor = Semaphore.Color
        .fromMSColor([textLayer textColor])
        .toSemaphore();
      semaphore.fontSize = Number([textLayer fontSize]);
      semaphore.lineSpacing = Number([textLayer lineHeight] || [textLayer defaultLineHeight]);
      semaphore.characterSpacing = Number([textLayer characterSpacing]);
      semaphore.paragraphSpacing = Number([[textLayer paragraphStyle] paragraphSpacing]);
      semaphore.textAlignment = FBSemaphore._enum.TextAlignment[
        // Sometimes Sketch stores a value of 4 for left aligned text, which
        // should have a value of 0
        [textLayer textAlignment] % 4
      ];

      var layoutManager = [textLayer layoutManager];
      var typesetter = [layoutManager typesetter];
      semaphore.baseline = Number([typesetter
                                   baselineOffsetInLayoutManager:layoutManager
                                   glyphIndex:0]);

      semaphore.attributeRuns = [];
      var textStorage = [layoutManager textStorage];
      var attributeRuns = [textStorage attributeRuns];
      var attributeRunsEnumerator = [attributeRuns objectEnumerator];
      while (attributeRun = [attributeRunsEnumerator nextObject]) {
        var range = [attributeRun range];
        var attributes = [textStorage fontAttributesInRange:range];
        var textColor = [MSColor colorWithNSColor:[attributeRun foregroundColor]];
        semaphore.attributeRuns.push({
          "range": {
            "location": Number(range.location),
            "length": Number(range.length),
          },
          "fontPostscriptName": String([[attributeRun font] fontName]),
          "textColor": Semaphore.Color.fromMSColor(textColor).toSemaphore(),
          "fontSize": Number([[attributeRun font] pointSize]),
          "characterSpacing": Number(attributes[NSKernAttributeName]),
        });
      }

      semaphore.metadata = {
        "Sketch": {
          "textBehaviour": Number([textLayer textBehaviour]),
        },
      };

      return semaphore;
    },

    // (NSBezierPath, MSRect) -> Path
    NSBezierPath: function(bezierPath, rect) {
      var semaphore = [];

      // [NSBezierPath elementAtIndex:associatedPoints:] expects a C-style
      // array, which CocoaScript doesn't support so this function takes an SVG
      // string and breaks it into separate commands using RegEx.

      var svgString = String([bezierPath svgPathAttribute]);

      // [MLCZ]    -> M, L, C, or Z
      // (
      //   [ ]?    -> zero or one spaces
      //   [\d.-]* -> zero or more digits, periods, or hyphens
      //   [,]     -> one comma
      //   [\d.-]* -> zero or more digits, periods, or hyphens
      // )*        -> zero or more of this block
      var commands = svgString.match(/[MLCZ]([ ]?[\de.-]*[,][\de.-]*)*/g);

      if (!commands) {
        // Return null if the string doesn't contain any commands.
        return;
      }

      for (var i = 0; i < commands.length; i++) {
        var command = {};

        command.type = FBSemaphore._enum.PathCommandType[commands[i].charAt(0)];

        var points = commands[i].substr(1).split(" ");
        for (var j = 0; j < points.length; j++) {
          points[j] = points[j].split(",");
          points[j] = {
            "x": (Number(points[j][0]) - [rect x]) / [rect width],
            "y": (Number(points[j][1]) - [rect y]) / [rect height],
          };
        };

        if (command.type == "curveTo") {
          command.curveFrom = points[0];
          command.curveTo = points[1];
          command.point = points[2];
        } else if (command.type != "closePath") {
          command.point = points[0];
        }

        semaphore.push(command);
      }

      return semaphore;
    },

    // NSImage, MSRect -> number
    NSImage: function(originalImage, containerFrame) {
      // If the NSImage is null return a null index. Some really old glyph
      // layers were set to null due to a Sketch bug, so without this fix some
      // designers can't export specs.
      if (!originalImage) {
        return -1;
      }

      var semaphore = {};

      var originalSize = [originalImage size];
      var originalWidth = originalSize.width;
      var originalHeight = originalSize.height;

      var widthScaleFactor = [containerFrame width] / originalWidth;
      var heightScaleFactor = [containerFrame height] / originalHeight;
      var scaleFactor = Math.max(widthScaleFactor, heightScaleFactor);

      var imageToExport = originalImage;

      // If the container is larger than the image, don't scale the image. If
      // the container is half the size of the original image it is probably
      // retina so don't scale the image.
      if (scaleFactor < 1 && scaleFactor !== 0.5) {
        // NSImage `initWithSize` and `drawInRect` are in points, so this
        // compensates for the device density of the exporting device.
        var backingScaleFactor = [[NSScreen mainScreen] backingScaleFactor];

        var scaledWidth = Math.round(
          originalWidth * scaleFactor / backingScaleFactor
        );
        var scaledHeight = Math.round(
          originalHeight * scaleFactor / backingScaleFactor
        );

        var scaledImage = [[NSImage alloc]
                           initWithSize:NSMakeSize(scaledWidth, scaledHeight)];
        [scaledImage lockFocus];
          [imageToExport
           drawInRect:NSMakeRect(0, 0, scaledWidth, scaledHeight)
           fromRect:NSMakeRect(0, 0, originalWidth, originalHeight)
           operation:NSCompositeSourceOver
           fraction:1.0];
        [scaledImage unlockFocus];

        imageToExport = scaledImage;
      }

      var tiffRepresentation = [imageToExport TIFFRepresentation];
      var bitmapImageRep = [NSBitmapImageRep
                            imageRepWithData:tiffRepresentation];
      var imageData = [bitmapImageRep
                       representationUsingType:NSPNGFileType
                       properties:nil];

      semaphore.data = String([imageData
                               base64EncodedStringWithOptions:
                               NSDataBase64EncodingEndLineWithLineFeed]);
      semaphore.width = [bitmapImageRep pixelsWide];
      semaphore.height = [bitmapImageRep pixelsHigh];

      this.images.push(semaphore);

      return this.images.indexOf(semaphore);
    },

  },

  _convertToSketch: {

    // string || number -> MSImageData || MSImageProxy
    Image: function(id) {
      if (this.version < 11) {
        var semaphore = this.images[id];
      } else {
        var semaphore = this.images.find(function(image) {
          return image.id === id;
        });
      }
      var data = [[NSData alloc]
                  initWithBase64EncodedString:semaphore.data
                  options:0];
      var image = [[NSImage alloc] initWithData:data];
      return [[MSImageData alloc] initWithImage:image convertColorSpace:false];
    },

    // Layer -> MSLayer
    Layer: function(semaphore) {
      var layer;

      if (semaphore.metadata &&
          semaphore.metadata.glyph) {
        layer = this.LayerMetadataTypeGlyph(semaphore);
      } else if (semaphore.type == "rectangle") {
        layer = this.LayerTypeRectangle(semaphore);
      } else if (semaphore.type == "ellipse") {
        layer = this.LayerTypeEllipse(semaphore);
      } else if (semaphore.type == "shape") {
        layer = this.LayerTypeShape(semaphore);
      } else if (semaphore.type == "text") {
        layer = this.LayerTypeText(semaphore);
      } else if (semaphore.type == "group") {
        layer = this.LayerTypeGroup(semaphore);
      } else if (semaphore.type == "artboard") {
        layer = this.LayerTypeArtboard(semaphore);
      }

      [layer setName:semaphore.name];
      [layer setFrame:Semaphore.Rect.fromSemaphore(semaphore.frame).toMSRect()];

      // -------------------
      // Optional properties
      // -------------------

      if (semaphore.visible == false) {
        [layer setIsVisible:false];
      }

      if (semaphore.locked == true) {
        [layer setIsLocked:true];
      }

      if (semaphore.mask) {
        [layer setHasClippingMask:semaphore.mask];
      }

      if (semaphore.rotation) {
        // Semaphore rotations are clockwise, Sketch is counterclockwise
        [layer setRotation:-semaphore.rotation];
      }

      if (semaphore.opacity) {
        [[[layer style] contextSettings] setOpacity:semaphore.opacity];
      }

      var semaphoreFill;
      if (semaphore.metadata &&
          semaphore.metadata.glyph) {
        semaphoreFill = semaphore.metadata.glyph.fill;
      } else if (semaphore.fill) {
        semaphoreFill = semaphore.fill;
      }

      if (semaphoreFill && semaphore.type != "artboard") {
        var fill = [[layer style] addStylePartOfType:FBSemaphore._enum.MSStylePart.Fill];
        if (semaphoreFill.type == "color") {
          [fill setFillType:FBSemaphore._enum.FillType.indexOf("color")];
          var fillColor = Semaphore.Color
            .fromSemaphore(semaphoreFill.color)
            .toMSColor();
          [fill setColor:fillColor];
        } else if (semaphoreFill.type == "gradient") {
          [fill setFillType:FBSemaphore._enum.FillType.indexOf("gradient")];
          var fillGradient = Semaphore.Gradient
            .fromSemaphore(semaphoreFill.gradient)
            .toMSGradient();
          [fill setGradient:fillGradient];
        } else if (semaphoreFill.type == "image") {
          [fill setFillType:FBSemaphore._enum.FillType.indexOf("image")];
          [fill setImage:this.Image(semaphoreFill.image)];
          [fill setPatternFillType:1];
        }
      }

      if (semaphore.border) {
        var border = [[layer style] addStylePartOfType:FBSemaphore._enum.MSStylePart.Border];
        var position = FBSemaphore._enum.BorderPosition.indexOf(
          semaphore.border.position
        );
        [border setPosition:position];
        [border setThickness:semaphore.border.thickness];
        if (semaphore.border.type == "color") {
          [border setFillType:FBSemaphore._enum.FillType.indexOf("color")];
          var borderColor = Semaphore.Color
            .fromSemaphore(semaphore.border.color)
            .toMSColor();
          [border setColor:borderColor];
        } else if (semaphore.border.type == "gradient") {
          [border setFillType:FBSemaphore._enum.FillType.indexOf("gradient")];
          var borderGradient = Semaphore.Gradient
            .fromSemaphore(semaphore.border.gradient)
            .toMSGradient();
          [border setGradient:borderGradient];
        }
      }

      if (semaphore.shadows) {
        for (var i = 0; i < semaphore.shadows.length; i++) {
          this._addShadowOnLayer(semaphore.shadows[i], layer);
        };
      }

      if (semaphore.innerShadows) {
        for (var i = 0; i < semaphore.innerShadows.length; i++) {
          this._addInnerShadowOnLayer(semaphore.innerShadows[i], layer);
        };
      }

      if (semaphore.metadata &&
          semaphore.metadata.Sketch &&
          semaphore.metadata.Sketch.blur) {
        const blur = layer.style().blurGeneric();
        blur.setCenter(
          Semaphore.Point
            .fromSemaphore(semaphore.metadata.Sketch.blur.center)
            .toCGPoint()
        );
        blur.setIsEnabled(true);
        blur.setMotionAngle(semaphore.metadata.Sketch.blur.motionAngle);
        blur.setRadius(semaphore.metadata.Sketch.blur.radius);
        blur.setType(semaphore.metadata.Sketch.blur.type);
      }

      if (semaphore.metadata &&
          semaphore.metadata.component) {
        // Duplicate the metadata object
        var componentMetadata = JSON.parse(JSON.stringify(semaphore.metadata.component));
        // Remove extra Semaphore-specific metadata properties

        FBLayerMetadata.setPluginValues(layer, "InterfaceKit", componentMetadata);
      }

      return layer;
    },

    _configureShadow: function(shadowObject, shadow) {
      var shadowColor = Semaphore.Color
        .fromSemaphore(shadow.color)
        .toMSColor();
      [shadowObject setColor:shadowColor];
      [shadowObject setOffsetX:shadow.offset.x];
      [shadowObject setOffsetY:shadow.offset.y];
      [shadowObject setBlurRadius:shadow.blur];
      [shadowObject setSpread:shadow.spread];
    },

    _addImage: function(semaphore) {
      var index = this.images.length;
      this.images[index] = semaphore;
    },

    _addShadowOnLayer: function(shadow, layer) {
      var shadowObject = [[layer style] addStylePartOfType:FBSemaphore._enum.MSStylePart.Shadow];
       this._configureShadow(shadowObject, shadow);
    },

    _addInnerShadowOnLayer: function(shadow, layer) {
      var shadowObject = [[layer style] addStylePartOfType:FBSemaphore._enum.MSStylePart.InnerShadow];
      this._configureShadow(shadowObject, shadow);
    },

    // [Layer...] -> [MSLayer...]
    Layers: function(semaphore) {
      var layers = [];

      for (var i = 0; i < semaphore.length; i++) {
        layers[i] = this.Layer(semaphore[i]);
      };

      return layers;
    },

    LayerMetadataTypeGlyph: function(semaphore) {
      var bitmapLayer = [[MSBitmapLayer alloc] init];
      // Duplicate the metadata object
      var glyphMetadata = JSON.parse(JSON.stringify(semaphore.metadata.glyph));
      // Remove extra Semaphore-specific metadata properties
      delete glyphMetadata.image;
      delete glyphMetadata.fill;

      [bitmapLayer setImage:this.Image(semaphore.metadata.glyph.image)];
      FBLayerMetadata.setPluginValues(bitmapLayer, "GlyphKit", glyphMetadata);

      return bitmapLayer;
    },

    LayerTypeArtboard: function(semaphore) {
      var artboardGroup = [[MSArtboardGroup alloc] init];

      [artboardGroup addLayers:this.Layers(semaphore.layers)];
      if (semaphore.fill) {
        [artboardGroup setHasBackgroundColor:true];
        var fillColor = Semaphore.Color
          .fromSemaphore(semaphore.fill.color)
          .toMSColor();
        [artboardGroup setBackgroundColor:fillColor];
      }

      return artboardGroup;
    },

    // LayerTypeEllipse -> MSShapeGroup
    LayerTypeEllipse: function(semaphore) {
      var shapeGroup = [[MSShapeGroup alloc] init];

      var ovalShape = [[MSOvalShape alloc] init];
      var ovalFrame = {
        "x": 0,
        "y": 0,
        "width": semaphore.frame.width,
        "height": semaphore.frame.height,
      };
      [ovalShape setFrame:Semaphore.Rect.fromSemaphore(ovalFrame).toMSRect()];

      [shapeGroup addLayers:[ovalShape]];

      return shapeGroup;
    },

    // LayerTypeGroup -> MSLayerGroup
    LayerTypeGroup: function(semaphore) {
      var layerGroup = [[MSLayerGroup alloc] init];

      [layerGroup addLayers:this.Layers(semaphore.layers)];

      return layerGroup;
    },

    // LayerTypeRectangle -> MSShapeGroup
    LayerTypeRectangle: function(semaphore) {
      var shapeGroup = [[MSShapeGroup alloc] init];

      var rectangleShape = [[MSRectangleShape alloc] init];
      var rectangleFrame = {
        "x": 0,
        "y": 0,
        "width": semaphore.frame.width,
        "height": semaphore.frame.height,
      };
      [rectangleShape setFrame:Semaphore.Rect.fromSemaphore(rectangleFrame).toMSRect()];
      if ("metadata" in semaphore &&
          "Sketch" in semaphore.metadata &&
          "cornerRadiusString" in semaphore.metadata.Sketch) {
        [rectangleShape setCornerRadiusString:semaphore.metadata.Sketch.cornerRadiusString];
      } else if (semaphore.cornerRadius) {
        [rectangleShape setCornerRadiusFloat:semaphore.cornerRadius];
      }

      [shapeGroup addLayers:[rectangleShape]];

      return shapeGroup;
    },

    // LayerTypeShape -> MSShapeGroup
    LayerTypeShape: function(semaphore) {
      var scalePoint = function(point) {
        return NSMakePoint(
          ((point.x * semaphore.frame.width) + semaphore.frame.x),
          ((point.y * semaphore.frame.height) + semaphore.frame.y)
        );
      };

      var bezierPath = [NSBezierPath bezierPath];
      for (var i = 0; i < semaphore.path.length; i++) {
        var command = semaphore.path[i];
        if (command.type == "moveTo") {
          [bezierPath moveToPoint:scalePoint(command.point)];
        } else if (command.type == "lineTo") {
          [bezierPath lineToPoint:scalePoint(command.point)];
        } else if (command.type == "curveTo") {
          [bezierPath
           curveToPoint:scalePoint(command.point)
           controlPoint1:scalePoint(command.curveFrom)
           controlPoint2:scalePoint(command.curveTo)];
        } else if (command.type == "closePath") {
          [bezierPath closePath];
        }
      };

      return [MSShapeGroup shapeWithBezierPath:bezierPath];
    },

    // LayerTypeText -> MSTextLayer
    LayerTypeText: function(semaphore) {
      var textLayer = [[MSTextLayer alloc] init];

      [textLayer setStringValue:semaphore.value];
      if ("metadata" in semaphore &&
          "Sketch" in semaphore.metadata &&
          "textBehaviour" in semaphore.metadata.Sketch) {
        [textLayer setTextBehaviour:semaphore.metadata.Sketch.textBehaviour];
      } else {
        kTextBehaviorFixed = 1;
        [textLayer setTextBehaviour:kTextBehaviorFixed];
      }
      [textLayer adjustContainerWidthTo:semaphore.frame.width];
      [textLayer setFontSize:semaphore.fontSize];
      [textLayer setFontPostscriptName:semaphore.fontPostscriptName];
      var textColor = Semaphore.Color
        .fromSemaphore(semaphore.textColor)
        .toMSColor();
      [textLayer setTextColor:textColor];
      var textAlignment = FBSemaphore._enum.TextAlignment.indexOf(
        semaphore.textAlignment
      );
      [textLayer setTextAlignment:textAlignment];
      if (semaphore.characterSpacing != 0) {
        [textLayer setCharacterSpacing:semaphore.characterSpacing];
      }
      var style = [textLayer style];
      var textStyle = [style textStyle];
      var attributes = [[textStyle attributes] mutableCopy];
      var paragraphStyle = attributes.NSParagraphStyle;
      [paragraphStyle setMaximumLineHeight:semaphore.lineSpacing];
      [paragraphStyle setMinimumLineHeight:semaphore.lineSpacing];
      if (semaphore.paragraphSpacing) {
        [paragraphStyle setParagraphSpacing:semaphore.paragraphSpacing];
      }
      attributes.NSParagraphStyle = paragraphStyle;
      [textStyle setAttributes:attributes];

      if (semaphore.attributeRuns) {
        semaphore.attributeRuns.forEach(function (attributeRun) {
          var attributes = {};
          attributes[NSForegroundColorAttributeName] =
            [NSColor colorWithRed:attributeRun.textColor.r
                            green:attributeRun.textColor.g
                             blue:attributeRun.textColor.b
                            alpha:attributeRun.textColor.a];
          var font = [NSFont fontWithName:attributeRun.fontPostscriptName
                                     size:attributeRun.fontSize];
          if (!font) {
            // If there is no font found, skip this attribute run and fallback
            // to the default style.
            return;
          } else {
            attributes[NSFontAttributeName] = font;
          }
          if (attributeRun.characterSpacing != 0) {
            attributes[NSKernAttributeName] =
              [NSNumber numberWithFloat:attributeRun.characterSpacing];
          }
          attributes[NSParagraphStyleAttributeName] = paragraphStyle;
          var range = NSMakeRange(
            attributeRun.range.location,
            attributeRun.range.length
          );
          [textLayer setAttributes:attributes forRange:range];
        });
      }

      return textLayer;
    },

  },

};
