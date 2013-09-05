;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("Joystick/index.js", function(exports, require, module){
function Joystick(canvas, onChange) {
	console.log("Constructed joystick");
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");

	this.value = { 
		x : 0, 
		y : 0,
		left : 0, 
		right : 0 
	};
	this.mouseDown = false;

	if (typeof onChange == "function") {
		this.onChange = onChange;
		this.onChange(this.value);
	} else {
		this.onChange = null;
	}

	this.bindJoystickEvent(this.canvas);

	this.draw();


}

Joystick.prototype.constructor = Joystick;

Joystick.prototype.setValue = function(value) {
	if (value.x) { this.value.x = value.x; }
	if (value.y) { this.value.y = value.y; }
	//if (value.left) { this.value.left = value.left; }
	//if (value.right) { this.value.right = value.right; }

	this.draw();
}

Joystick.prototype.canvasClicked = function(e) {
	if (typeof e.forceClick == "undefined" && this.mouseDown == false) {return;}
	
	//get position relative to bitmap
	var x = e.offsetX;
	var y = e.offsetY;
	
	var width = this.canvas.width;
	var a = "a";
	if (e.forceClick == true) {
		var div = document.getElementById("joystick-wrapper-left");
		width = div.offsetWidth;
		a = "b";
	}

	//Firefox hack.
	if (typeof x == "undefined" && typeof e.originalTarget == "undefined") {
		x = e.layerX - e.originalTarget.offsetLeft;
		y = e.layerY - e.originalTarget.offsetTop;
	}

	//convert to position relative to origin
	x = (width/2) - x;
	x = -x;
	y = (width/2) - y;

	var joystickX = x / 100;
	var joystickY = y / 100;

	radians = Math.atan(x/y);
	degrees = radians / (Math.PI / 180);
	
	//fix negative hemisphere problem.
	if (y < 0) 
		degrees = degrees + 180;
					
	//fix negative degrees problem
	if (degrees < 0) 
		degrees = degrees + 360;
	
	degrees = Math.round(degrees);
	
	//Calculate the speed
	z = Math.round(Math.sqrt(Math.pow(x,2) + Math.pow(y,2)));
	if (z > 100) 
		z = 100;

	var motors = this.convertJoystickToMotors(joystickX, joystickY);

	this.value = {
		x: joystickX,
		y: joystickY,
		left: motors.left,
		right: motors.right
	};
	

	this.onChange && this.onChange(this.value);
	
	this.draw();
}

Joystick.prototype.convertJoystickToMotors = function(x, y) {
	var left = 0;
	var right = 0;
	var l = y;
	var r = y;
	var yDiff = 0;
	var xDiff = 0;
	if (y > 0) {
		yDiff = 1 - y;
	} else {
		yDiff = 1 + y;
	}
	if (x > 0) {
		xDiff = 1 - x;
		r = r * xDiff;
		l = l + yDiff;
		r = r - yDiff;
	} else {
		xDiff = 1 + x;
		l = l * xDiff;
		r = r + yDiff;
		l = l - yDiff;
	}

	var multiplier = (1 - Math.min(xDiff, yDiff)) * 100;

	l = parseInt(l * multiplier);
	r = parseInt(r * multiplier);

	//Round down for non-zering joystick.
	if (l < 15 && r < 15 && l > -15 && r > -15) {
		l = 0;
		r = 0;
	}

	//console.log(left, right, l, r, yDiff.toFixed(2), xDiff.toFixed(2), multiplier, x.toFixed(2), y.toFixed(2));

	//Using the joystick or the triggers?
	if (Math.abs(l) > Math.abs(left)) {
		left = l;
	}
	if (Math.abs(r) > Math.abs(right)) {
		right = r;
	}

	return {
		left: left,
		right: right
	};
}

Joystick.prototype.draw = function() {
	//clear the this.canvas
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
	//Draw circles
	this.ctx.beginPath();  
	this.ctx.arc(100,100,99,0,Math.PI*2,true); // Outer circle
	this.ctx.moveTo(110,100);
	this.ctx.arc(100,100,10,0,Math.PI*2,true); // inner circle
	this.ctx.closePath();  
	this.ctx.strokeStyle = "222";
	this.ctx.stroke();
	
	//Draw coords
	//this.ctx.fillText(this.value.x.toFixed(2) + ", " +  this.value.y.toFixed(2), 3, 195);
	
	//Draw joystick
	var x = ((this.value.x) * this.canvas.width/2) + this.canvas.width/2;
	var y = ((-this.value.y) * this.canvas.width/2) + this.canvas.width/2;
	this.ctx.beginPath();  
	this.ctx.arc(x,y,10,0,Math.PI*2,true); // Stick circle
	this.ctx.closePath();  
	this.ctx.strokeStyle = "rgb(0,200,0)";
	this.ctx.stroke();

}



Joystick.prototype.bindJoystickEvent = function(canvas) {
	var self = this;
	canvas.onmousedown = function(e) { self.mouseDown = true;  self.canvasClicked(e); } 
	canvas.onmouseup =   function(e) { self.mouseDown = false; self.canvasClicked(e); } 
	canvas.onmousemove = function(e) { self.canvasClicked(e); }

	canvas.addEventListener("touchstart", function(e) { self.touchHandler(e); }, true);
	canvas.addEventListener("touchmove", function(e) { self.touchHandler(e); }, true);
	canvas.addEventListener("touchend", function(e) { self.touchHandler(e); }, true);
	canvas.addEventListener("touchcancel", function(e) { self.touchHandler(e); }, true); 
}

Joystick.prototype.touchHandler = function(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";

    switch(event.type)
    {
       case "touchstart": type = "mousedown"; break;
       case "touchmove":  type = "mousemove"; break;        
       case "touchend":   type = "mouseup"; break;
       default: return;
    }

    var fakeEvent = { 
    	srcElement:event.srcElement,
    	offsetX:first.screenX,
    	offsetY:first.screenY,
    	forceClick: true
    };

    this.canvasClicked(fakeEvent);


    //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //           screenX, screenY, clientX, clientY, ctrlKey, 
    //           altKey, shiftKey, metaKey, button, relatedTarget);

    // var simulatedEvent = document.createEvent("MouseEvent");
    // simulatedEvent.initMouseEvent(type, true, true, window, 1, 
    //                       first.screenX, first.screenY, 
    //                       first.clientX, first.clientY, false, 
    //                       false, false, false, 0/*left*/, null);

    // first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

module.exports = Joystick;

});
require.alias("Joystick/index.js", "Joystick/index.js");if (typeof exports == "object") {
  module.exports = require("Joystick");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("Joystick"); });
} else {
  this["Joystick"] = require("Joystick");
}})();