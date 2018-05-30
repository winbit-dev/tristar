var $body = document.getElementsByClassName('body-inner')[0];
		var colors = [[44, 50, 128], //blue
		[103, 165, 72], //green
		[165, 71, 79], //red
		[95, 44, 146], //purple
		[67, 98, 198] //light blue
		];
		var colorLen = colors.length;
		var step = 0;
		var colorIndices = new Array(colorLen - 1).join().split(',').map(function (v, i) {
			return i;
		});
		var gradientSpeed = 0.01; //transition speed

		var getColor = function getColor(color1, color2) {
			var r_step = 1 - step;
			var rgb = color1.map(function (v, i) {
				return ~~(r_step * color1[i] + step * color2[i]);
			}).join();
			return 'rgb(' + rgb + ')';
		};

		var upodateColorIdx = function upodateColorIdx() {
			colorIndices.forEach(function (v, i) {
				if (i % 2) {
					colorIndices[i] = ~~(colorIndices[i - 1] + Math.random() * (colorLen - 1) + 1) % colorLen;
				} else {
					colorIndices[i] = colorIndices[(i + 1) % (colorLen - 1)];
				}
			});
		};

		var Gradient = function Gradient() {
			var colorNow = colorIndices.map(function (v) {
				return colors[v];
			});
			var color1 = getColor(colorNow[0], colorNow[1]);
			var color2 = getColor(colorNow[2], colorNow[3]);

			$body.style.backgroundImage = 'linear-gradient(to right bottom, ' + color1 + ', ' + color2 + ')';

			step += gradientSpeed;
			if (step >= 1) {
				step %= 1;
				upodateColorIdx();
			}
		};

		window.requestAnimFrame = function () {
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
		}();

		(function animloop() {
			requestAnimFrame(animloop);
			Gradient();
		})();


var width, height;
var canvas = document.querySelector('canvas');
canvas.width = width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
canvas.height = height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var ctx = canvas.getContext('2d');

ctx.translate(canvas.width / 2, canvas.height / 2);

var points = [];
var depth = 8;
var scale = 70;
for (var x = -depth/2; x <= depth/2; x++) {
  for (var y = -depth/2; y <= depth/2; y++) {
    for (var z = -depth/2; z <= depth/2; z++) {
      points.push([x * scale, y * scale, z * scale]);
    }
  }  
}

var minDistance = 1000;
var maxDistance = 2000;
var f = 500;
var rot = 0;
var direction = -1;
var distance;
ctx.fillStyle = 'rgba(255, 255, 255, 1)';

requestAnimationFrame(function loop() {
  rot += .75;
  distance = maxDistance - (maxDistance - minDistance) * Math.abs(Math.sin(rot/100));
  
  ctx.clearRect( -width / 2, -height / 2, width, height);
  
  var cpm = [
    [f, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, 2, distance]
  ];
  
  var rotX = getRotateY(rot);
  var rotY = getRotateY(rot*2);
  var rotZ = getRotateZ(rot*3);
  
  var transformMatrix = matrixMultiply(rotY, rotZ);
  transformMatrix = matrixMultiply(transformMatrix, rotX);
  
  points
  .forEach(function(point) {
    var imagePoint = getImagePoint(matrixTimesVec(transformMatrix, point), cpm);
    if (imagePoint[2] < 0) { return; }
    
    var size = 1 * f / imagePoint[2];
    var x = imagePoint[0] / imagePoint[2];
    var y = imagePoint[1] / imagePoint[2];
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, true);
    ctx.fill();
  });
  
  requestAnimationFrame(loop);
});

function getImagePoint(point3D, cameraProjectionMatrix) {
  // make homogenous
  var homogenousPoint3D = point3D.concat([1]);
  return matrixTimesVec(cameraProjectionMatrix, homogenousPoint3D);
}

function add(a, b) { return a + b; }

function getRotateZ(deg) {
  var rad = deg * Math.PI / 180;
  var cos = Math.cos(rad);
  var sin = Math.sin(rad);
  return  [
    [cos, -sin, 0],
    [sin,  cos, 0],
    [  0,    0, 1]
  ]; 
}

function getRotateY(deg) {
  var rad = deg * Math.PI / 180;
  var cos = Math.cos(rad);
  var sin = Math.sin(rad);
  return  [
    [ cos, 0, sin],
    [   0, 1,   0],
    [-sin, 0, cos]
  ]; 
}

function getRotateX(deg) {
  var rad = deg * Math.PI / 180;
  var cos = Math.cos(rad);
  var sin = Math.sin(rad);
  return  [
    [1,   0,    0],
    [0, cos, -sin],
    [0, sin,  cos]
  ]; 
}

function matrixTimesVec(matrix, vec) {
  return deepCopy(matrix).map(function(row) {
    return row.map(function(cell, i) {
      return cell * vec[i];
    }).reduce(add, 0);
  });
}

function deepCopy(arr) {
  return arr.slice(0).map(function(v) {
     return Array.isArray(v) ? deepCopy(v) : v;
  });
}

function matrixMultiply(m1, m2) {
  var m1_0 = m1[0];
  var m1_1 = m1[1];
  var m1_2 = m1[2];
  var m2_0 = m2[0];
  var m2_1 = m2[1];
  var m2_2 = m2[2];

  var m1_0_0 = m1_0[0];
  var m1_0_1 = m1_0[1];
  var m1_0_2 = m1_0[2];
  var m1_1_0 = m1_1[0];
  var m1_1_1 = m1_1[1];
  var m1_1_2 = m1_1[2];
  var m1_2_0 = m1_2[0];
  var m1_2_1 = m1_2[1];
  var m1_2_2 = m1_2[2];

  var m2_0_0 = m2_0[0];
  var m2_0_1 = m2_0[1];
  var m2_0_2 = m2_0[2];
  var m2_1_0 = m2_1[0];
  var m2_1_1 = m2_1[1];
  var m2_1_2 = m2_1[2];
  var m2_2_0 = m2_2[0];
  var m2_2_1 = m2_2[1];
  var m2_2_2 = m2_2[2];

  return [
    [m1_0_0 * m2_0_0 + m1_0_1 * m2_1_0 + m1_0_2 * m2_2_0, m1_0_0 * m2_0_1 + m1_0_1 * m2_1_1 + m1_0_2 * m2_2_1, m1_0_0 * m2_0_2 + m1_0_1 * m2_1_2 + m1_0_2 * m2_2_2],
    [m1_1_0 * m2_0_0 + m1_1_1 * m2_1_0 + m1_1_2 * m2_2_0, m1_1_0 * m2_0_1 + m1_1_1 * m2_1_1 + m1_1_2 * m2_2_1, m1_1_0 * m2_0_2 + m1_1_1 * m2_1_2 + m1_1_2 * m2_2_2],
    [m1_2_0 * m2_0_0 + m1_2_1 * m2_1_0 + m1_2_2 * m2_2_0, m1_2_0 * m2_0_1 + m1_2_1 * m2_1_1 + m1_2_2 * m2_2_1, m1_2_0 * m2_0_2 + m1_2_1 * m2_1_2 + m1_2_2 * m2_2_2]
  ];
}