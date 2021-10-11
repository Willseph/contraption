let BlobSettings = {
	colored: false,
	enabledBg: "#460f00",
	disabledBg: "#111113"
};

function formatPoints(points, close) {
  points = [...points];
  if (!Array.isArray(points[0])) {
    points = points.map(({x, y}) => [x, y]);
  }
  if (close) {
    const lastPoint = points[points.length - 1];
    const secondToLastPoint = points[points.length - 2];
    const firstPoint = points[0];
    const secondPoint = points[1];
    points.unshift(lastPoint);
    points.unshift(secondToLastPoint);
    points.push(firstPoint);
    points.push(secondPoint);
  }
  return points.flat();
}
function spline(points = [], tension = 1, close = false, cb) {
  points = formatPoints(points, close);
  const size = points.length;
  const last = size - 4;
  const startPointX = close ? points[2] : points[0];
  const startPointY = close ? points[3] : points[1];
  let path = "M" + [startPointX, startPointY];
  cb && cb("MOVE", [startPointX, startPointY]);
  const startIteration = close ? 2 : 0;
  const maxIteration = close ? size - 4 : size - 2;
  const inc = 2;
  for (let i = startIteration; i < maxIteration; i += inc) {
    const x0 = i ? points[i - 2] : points[0];
    const y0 = i ? points[i - 1] : points[1];
    const x1 = points[i + 0];
    const y1 = points[i + 1];
    const x2 = points[i + 2];
    const y2 = points[i + 3];
    const x3 = i !== last ? points[i + 4] : x2;
    const y3 = i !== last ? points[i + 5] : y2;
    const cp1x = x1 + (x2 - x0) / 6 * tension;
    const cp1y = y1 + (y2 - y0) / 6 * tension;
    const cp2x = x2 - (x3 - x1) / 6 * tension;
    const cp2y = y2 - (y3 - y1) / 6 * tension;
    path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2];
    cb && cb("CURVE", [cp1x, cp1y, cp2x, cp2y, x2, y2]);
  }
  return path;
}

function createCommonjsModule(fn, basedir, module) {
  return module = {
    path: basedir,
    exports: {},
    require: function(path, base) {
      return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
    }
  }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var SimplexNoise = createCommonjsModule(function(module, exports) {
  (function() {
    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;
    var F3 = 1 / 3;
    var G3 = 1 / 6;
    var F4 = (Math.sqrt(5) - 1) / 4;
    var G4 = (5 - Math.sqrt(5)) / 20;
    function SimplexNoise2(randomOrSeed) {
      var random;
      if (typeof randomOrSeed == "function") {
        random = randomOrSeed;
      } else if (randomOrSeed) {
        random = alea(randomOrSeed);
      } else {
        random = Math.random;
      }
      this.p = buildPermutationTable(random);
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);
      for (var i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }
    SimplexNoise2.prototype = {
      grad3: new Float32Array([
        1,
        1,
        0,
        -1,
        1,
        0,
        1,
        -1,
        0,
        -1,
        -1,
        0,
        1,
        0,
        1,
        -1,
        0,
        1,
        1,
        0,
        -1,
        -1,
        0,
        -1,
        0,
        1,
        1,
        0,
        -1,
        1,
        0,
        1,
        -1,
        0,
        -1,
        -1
      ]),
      grad4: new Float32Array([
        0,
        1,
        1,
        1,
        0,
        1,
        1,
        -1,
        0,
        1,
        -1,
        1,
        0,
        1,
        -1,
        -1,
        0,
        -1,
        1,
        1,
        0,
        -1,
        1,
        -1,
        0,
        -1,
        -1,
        1,
        0,
        -1,
        -1,
        -1,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        -1,
        1,
        0,
        -1,
        1,
        1,
        0,
        -1,
        -1,
        -1,
        0,
        1,
        1,
        -1,
        0,
        1,
        -1,
        -1,
        0,
        -1,
        1,
        -1,
        0,
        -1,
        -1,
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        -1,
        1,
        -1,
        0,
        1,
        1,
        -1,
        0,
        -1,
        -1,
        1,
        0,
        1,
        -1,
        1,
        0,
        -1,
        -1,
        -1,
        0,
        1,
        -1,
        -1,
        0,
        -1,
        1,
        1,
        1,
        0,
        1,
        1,
        -1,
        0,
        1,
        -1,
        1,
        0,
        1,
        -1,
        -1,
        0,
        -1,
        1,
        1,
        0,
        -1,
        1,
        -1,
        0,
        -1,
        -1,
        1,
        0,
        -1,
        -1,
        -1,
        0
      ]),
      noise2D: function(xin, yin) {
        var permMod12 = this.permMod12;
        var perm = this.perm;
        var grad3 = this.grad3;
        var n0 = 0;
        var n1 = 0;
        var n2 = 0;
        var s = (xin + yin) * F2;
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var X0 = i - t;
        var Y0 = j - t;
        var x0 = xin - X0;
        var y0 = yin - Y0;
        var i1, j1;
        if (x0 > y0) {
          i1 = 1;
          j1 = 0;
        } else {
          i1 = 0;
          j1 = 1;
        }
        var x1 = x0 - i1 + G2;
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1 + 2 * G2;
        var y2 = y0 - 1 + 2 * G2;
        var ii = i & 255;
        var jj = j & 255;
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
          var gi0 = permMod12[ii + perm[jj]] * 3;
          t0 *= t0;
          n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0);
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
          var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
          t1 *= t1;
          n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
          var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
          t2 *= t2;
          n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
        }
        return 70 * (n0 + n1 + n2);
      },
      noise3D: function(xin, yin, zin) {
        var permMod12 = this.permMod12;
        var perm = this.perm;
        var grad3 = this.grad3;
        var n0, n1, n2, n3;
        var s = (xin + yin + zin) * F3;
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var k = Math.floor(zin + s);
        var t = (i + j + k) * G3;
        var X0 = i - t;
        var Y0 = j - t;
        var Z0 = k - t;
        var x0 = xin - X0;
        var y0 = yin - Y0;
        var z0 = zin - Z0;
        var i1, j1, k1;
        var i2, j2, k2;
        if (x0 >= y0) {
          if (y0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
          } else if (x0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 0;
            k2 = 1;
          } else {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 1;
            j2 = 0;
            k2 = 1;
          }
        } else {
          if (y0 < z0) {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 0;
            j2 = 1;
            k2 = 1;
          } else if (x0 < z0) {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 0;
            j2 = 1;
            k2 = 1;
          } else {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
          }
        }
        var x1 = x0 - i1 + G3;
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;
        var x2 = x0 - i2 + 2 * G3;
        var y2 = y0 - j2 + 2 * G3;
        var z2 = z0 - k2 + 2 * G3;
        var x3 = x0 - 1 + 3 * G3;
        var y3 = y0 - 1 + 3 * G3;
        var z3 = z0 - 1 + 3 * G3;
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0)
          n0 = 0;
        else {
          var gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
          t0 *= t0;
          n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0)
          n1 = 0;
        else {
          var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
          t1 *= t1;
          n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0)
          n2 = 0;
        else {
          var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
          t2 *= t2;
          n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0)
          n3 = 0;
        else {
          var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
          t3 *= t3;
          n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
        }
        return 32 * (n0 + n1 + n2 + n3);
      },
      noise4D: function(x, y, z, w) {
        var perm = this.perm;
        var grad4 = this.grad4;
        var n0, n1, n2, n3, n4;
        var s = (x + y + z + w) * F4;
        var i = Math.floor(x + s);
        var j = Math.floor(y + s);
        var k = Math.floor(z + s);
        var l = Math.floor(w + s);
        var t = (i + j + k + l) * G4;
        var X0 = i - t;
        var Y0 = j - t;
        var Z0 = k - t;
        var W0 = l - t;
        var x0 = x - X0;
        var y0 = y - Y0;
        var z0 = z - Z0;
        var w0 = w - W0;
        var rankx = 0;
        var ranky = 0;
        var rankz = 0;
        var rankw = 0;
        if (x0 > y0)
          rankx++;
        else
          ranky++;
        if (x0 > z0)
          rankx++;
        else
          rankz++;
        if (x0 > w0)
          rankx++;
        else
          rankw++;
        if (y0 > z0)
          ranky++;
        else
          rankz++;
        if (y0 > w0)
          ranky++;
        else
          rankw++;
        if (z0 > w0)
          rankz++;
        else
          rankw++;
        var i1, j1, k1, l1;
        var i2, j2, k2, l2;
        var i3, j3, k3, l3;
        i1 = rankx >= 3 ? 1 : 0;
        j1 = ranky >= 3 ? 1 : 0;
        k1 = rankz >= 3 ? 1 : 0;
        l1 = rankw >= 3 ? 1 : 0;
        i2 = rankx >= 2 ? 1 : 0;
        j2 = ranky >= 2 ? 1 : 0;
        k2 = rankz >= 2 ? 1 : 0;
        l2 = rankw >= 2 ? 1 : 0;
        i3 = rankx >= 1 ? 1 : 0;
        j3 = ranky >= 1 ? 1 : 0;
        k3 = rankz >= 1 ? 1 : 0;
        l3 = rankw >= 1 ? 1 : 0;
        var x1 = x0 - i1 + G4;
        var y1 = y0 - j1 + G4;
        var z1 = z0 - k1 + G4;
        var w1 = w0 - l1 + G4;
        var x2 = x0 - i2 + 2 * G4;
        var y2 = y0 - j2 + 2 * G4;
        var z2 = z0 - k2 + 2 * G4;
        var w2 = w0 - l2 + 2 * G4;
        var x3 = x0 - i3 + 3 * G4;
        var y3 = y0 - j3 + 3 * G4;
        var z3 = z0 - k3 + 3 * G4;
        var w3 = w0 - l3 + 3 * G4;
        var x4 = x0 - 1 + 4 * G4;
        var y4 = y0 - 1 + 4 * G4;
        var z4 = z0 - 1 + 4 * G4;
        var w4 = w0 - 1 + 4 * G4;
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        var ll = l & 255;
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
        if (t0 < 0)
          n0 = 0;
        else {
          var gi0 = perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32 * 4;
          t0 *= t0;
          n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
        if (t1 < 0)
          n1 = 0;
        else {
          var gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32 * 4;
          t1 *= t1;
          n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
        if (t2 < 0)
          n2 = 0;
        else {
          var gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32 * 4;
          t2 *= t2;
          n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
        if (t3 < 0)
          n3 = 0;
        else {
          var gi3 = perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32 * 4;
          t3 *= t3;
          n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
        }
        var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
        if (t4 < 0)
          n4 = 0;
        else {
          var gi4 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32 * 4;
          t4 *= t4;
          n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
        }
        return 27 * (n0 + n1 + n2 + n3 + n4);
      }
    };
    function buildPermutationTable(random) {
      var i;
      var p = new Uint8Array(256);
      for (i = 0; i < 256; i++) {
        p[i] = i;
      }
      for (i = 0; i < 255; i++) {
        var r = i + ~~(random() * (256 - i));
        var aux = p[i];
        p[i] = p[r];
        p[r] = aux;
      }
      return p;
    }
    SimplexNoise2._buildPermutationTable = buildPermutationTable;
    function alea() {
      var s0 = 0;
      var s1 = 0;
      var s2 = 0;
      var c = 1;
      var mash = masher();
      s0 = mash(" ");
      s1 = mash(" ");
      s2 = mash(" ");
      for (var i = 0; i < arguments.length; i++) {
        s0 -= mash(arguments[i]);
        if (s0 < 0) {
          s0 += 1;
        }
        s1 -= mash(arguments[i]);
        if (s1 < 0) {
          s1 += 1;
        }
        s2 -= mash(arguments[i]);
        if (s2 < 0) {
          s2 += 1;
        }
      }
      mash = null;
      return function() {
        var t = 2091639 * s0 + c * 23283064365386963e-26;
        s0 = s1;
        s1 = s2;
        return s2 = t - (c = t | 0);
      };
    }
    function masher() {
      var n = 4022871197;
      return function(data) {
        data = data.toString();
        for (var i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          var h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 4294967296;
        }
        return (n >>> 0) * 23283064365386963e-26;
      };
    }
    exports.SimplexNoise = SimplexNoise2;
    {
      module.exports = SimplexNoise2;
    }
  })();
});

// our <path> element
const path = document.querySelector("path");
// used to set our custom property values
const root = document.documentElement;

let hueNoiseOffset = 5;
let noiseStep = 0.0005;

const simplex = new SimplexNoise();

const points = createPoints();

(function animate() {
  path.setAttribute("d", spline(points, 1, true));

  // for every point...
  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    // return a pseudo random value between -1 / 1 based on this point's current x, y positions in "time"
    const nX = noise(point.noiseOffsetX, point.noiseOffsetX);
    const nY = noise(point.noiseOffsetY, point.noiseOffsetY);
    // map this noise value to a new value, somewhere between it's original location -20 and it's original location + 20
    const x = map(nX, -1, 1, point.originX - 20, point.originX + 20);
    const y = map(nY, -1, 1, point.originY - 20, point.originY + 20);

    // update the point's current coordinates
    point.x = x;
    point.y = y;

    // progress the point's x, y values through "time"
    point.noiseOffsetX += noiseStep;
    point.noiseOffsetY += noiseStep;
  }

  const hueNoise = noise(hueNoiseOffset, hueNoiseOffset);
  const hue = 0

  root.style.setProperty("--startColor", generateBlobColor (hue-10, BlobSettings.colored));
  root.style.setProperty("--stopColor", generateBlobColor (hue+10, BlobSettings.colored));

  var bgColor = BlobSettings.colored ? BlobSettings.enabledBg : BlobSettings.disabledBg;
  document.getElementById('blob').style.setProperty ("background-color", bgColor)

  requestAnimationFrame(animate);
})();

function generateBlobColor (val, colored) {
	if (colored) {
		return `hsl(${val}, 100%, 60%)`
	}
	return `hsl(${val}, 0%, ${(val / 8.0) + 12}%)`
}

function map(n, start1, end1, start2, end2) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

function noise(x, y) {
  return simplex.noise2D(x, y);
}

function createPoints() {
  const points = [];
  // how many points do we need
  const numPoints = 6;
  // used to equally space each point around the circle
  const angleStep = (Math.PI * 2) / numPoints;
  // the radius of the circle
  const rad = 75;

  for (let i = 1; i <= numPoints; i++) {
    // x & y coordinates of the current point
    const theta = i * angleStep;

    const x = 100 + Math.cos(theta) * rad;
    const y = 100 + Math.sin(theta) * rad;

    // store the point's position
    points.push({
      x: x,
      y: y,
      // we need to keep a reference to the point's original point for when we modulate the values later
      originX: x,
      originY: y,
      // more on this in a moment!
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000
    });
  }

  return points;
}