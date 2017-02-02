var Semaphore =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _Color = __webpack_require__(1);

	var _Color2 = _interopRequireDefault(_Color);

	var _Gradient = __webpack_require__(2);

	var _Gradient2 = _interopRequireDefault(_Gradient);

	var _Point = __webpack_require__(3);

	var _Point2 = _interopRequireDefault(_Point);

	var _Rect = __webpack_require__(4);

	var _Rect2 = _interopRequireDefault(_Rect);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Semaphore = {
	  Color: _Color2.default,
	  Gradient: _Gradient2.default,
	  Point: _Point2.default,
	  Rect: _Rect2.default
	};

	// Browserify's standalone flag requires `module.exports` instead of ES6 module
	// syntax, which is used elsewhere in this library.
	module.exports = Semaphore;

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Color = function () {
	  function Color(properties) {
	    _classCallCheck(this, Color);

	    this.r = properties.r;
	    this.g = properties.g;
	    this.b = properties.b;
	    this.a = properties.a;
	  }

	  _createClass(Color, [{
	    key: "toSemaphore",
	    value: function toSemaphore() {
	      return {
	        r: this.r,
	        g: this.g,
	        b: this.b,
	        a: this.a
	      };
	    }
	  }, {
	    key: "toMSColor",
	    value: function toMSColor() {
	      return MSColor.colorWithRed_green_blue_alpha(this.r, this.g, this.b, this.a);
	    }
	  }], [{
	    key: "fromSemaphore",
	    value: function fromSemaphore(semaphore) {
	      return new Color(semaphore);
	    }
	  }, {
	    key: "fromMSColor",
	    value: function fromMSColor(color) {
	      return new Color({
	        r: Number(color.red()),
	        g: Number(color.green()),
	        b: Number(color.blue()),
	        a: Number(color.alpha())
	      });
	    }
	  }]);

	  return Color;
	}();

	exports.default = Color;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Color = __webpack_require__(1);

	var _Color2 = _interopRequireDefault(_Color);

	var _Point = __webpack_require__(3);

	var _Point2 = _interopRequireDefault(_Point);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function convertSemaphoreGradientType(type) {
	  if (type === 'linear') {
	    return 0;
	  } else {
	    return 1;
	  }
	}

	function convertMSGradientType(type) {
	  if (type === 0) {
	    return 'linear';
	  } else {
	    return 'radial';
	  }
	}

	var Gradient = function () {
	  function Gradient(properties) {
	    _classCallCheck(this, Gradient);

	    this.type = properties.type;
	    this.startColor = properties.startColor;
	    this.startPosition = properties.startPosition;
	    this.endColor = properties.endColor;
	    this.endPosition = properties.endPosition;
	  }

	  _createClass(Gradient, [{
	    key: 'toSemaphore',
	    value: function toSemaphore() {
	      return {
	        type: this.type,
	        startColor: this.startColor.toSemaphore(),
	        startPosition: this.startPosition.toSemaphore(),
	        endColor: this.endColor.toSemaphore(),
	        endPosition: this.endPosition.toSemaphore()
	      };
	    }
	  }, {
	    key: 'toMSGradient',
	    value: function toMSGradient() {
	      var gradient = MSGradient.alloc().init();
	      gradient.setGradientType(convertSemaphoreGradientType(this.type));
	      gradient.setColor_atIndex(this.startColor.toMSColor(), 0);
	      gradient.setFrom(this.startPosition.toCGPoint());
	      gradient.setColor_atIndex(this.endColor.toMSColor(), 1);
	      gradient.setTo(this.endPosition.toCGPoint());
	      return gradient;
	    }
	  }], [{
	    key: 'fromSemaphore',
	    value: function fromSemaphore(semaphore) {
	      return new Gradient({
	        type: semaphore.type,
	        startColor: _Color2.default.fromSemaphore(semaphore.startColor),
	        startPosition: _Point2.default.fromSemaphore(semaphore.startPosition),
	        endColor: _Color2.default.fromSemaphore(semaphore.endColor),
	        endPosition: _Point2.default.fromSemaphore(semaphore.endPosition)
	      });
	    }
	  }, {
	    key: 'fromMSGradient',
	    value: function fromMSGradient(gradient) {
	      return new Gradient({
	        type: convertMSGradientType(gradient.gradientType()),
	        startColor: _Color2.default.fromMSColor(gradient.stops().firstObject().color()),
	        startPosition: _Point2.default.fromCGPoint(gradient.from()),
	        endColor: _Color2.default.fromMSColor(gradient.stops().lastObject().color()),
	        endPosition: _Point2.default.fromCGPoint(gradient.to())
	      });
	    }
	  }]);

	  return Gradient;
	}();

	exports.default = Gradient;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Point = function () {
	  function Point(properties) {
	    _classCallCheck(this, Point);

	    this.x = properties.x;
	    this.y = properties.y;
	  }

	  _createClass(Point, [{
	    key: "toSemaphore",
	    value: function toSemaphore() {
	      return {
	        x: this.x,
	        y: this.y
	      };
	    }
	  }, {
	    key: "toCGPoint",
	    value: function toCGPoint() {
	      return CGPointMake(this.x, this.y);
	    }
	  }], [{
	    key: "fromSemaphore",
	    value: function fromSemaphore(semaphore) {
	      return new Point(semaphore);
	    }
	  }, {
	    key: "fromCGPoint",
	    value: function fromCGPoint(point) {
	      return new Point({
	        x: Number(point.x),
	        y: Number(point.y)
	      });
	    }
	  }]);

	  return Point;
	}();

	exports.default = Point;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Rect = function () {
	  function Rect(properties) {
	    _classCallCheck(this, Rect);

	    this.x = properties.x;
	    this.y = properties.y;
	    this.width = properties.width;
	    this.height = properties.height;
	  }

	  _createClass(Rect, [{
	    key: "toSemaphore",
	    value: function toSemaphore() {
	      return {
	        x: this.x,
	        y: this.y,
	        width: this.width,
	        height: this.height
	      };
	    }
	  }, {
	    key: "toMSRect",
	    value: function toMSRect() {
	      return MSRect.rectWithX_y_width_height(this.x, this.y, this.width, this.height);
	    }
	  }], [{
	    key: "fromSemaphore",
	    value: function fromSemaphore(semaphore) {
	      return new Rect(semaphore);
	    }
	  }, {
	    key: "fromMSRect",
	    value: function fromMSRect(rect) {
	      return new Rect({
	        x: Number(rect.x()),
	        y: Number(rect.y()),
	        width: Number(rect.width()),
	        height: Number(rect.height())
	      });
	    }
	  }]);

	  return Rect;
	}();

	exports.default = Rect;

/***/ }
/******/ ]);