/*!
	MSQR v0.2.0 alpha
	(c) 2016 K3N / Epistemex
	www.epistemex.com
	MIT License
*/

/**
 * Convert a canvas, context, image or video frame to a path that aligns with the outline of the non-alpha pixels
 * using an optimized version of the marching squares algorithm.
 *
 * Alpha threshold can be adjusted. Optional point reduction can be performed to reduce total number of points.
 *
 * Embeds alignment feature to produce tighter fit. Can pre-align before point reduction as well.
 *
 * Use maxShapes to trace more than 1 shape.
 *
 * @param {*} src - source is either canvas, context, image or video (note: only webm video format supports alpha channel. webm is only available in Chrome/Opera).
 * @param {*} [options] - an optional option object to tweak values or to set clip
 * @param {number} [options.x] - set x for clipping bound. Default is 0.
 * @param {number} [options.y] - set y for clipping bound. Default is 0.
 * @param {number} [options.width] - set width for clipping bound. Default is width of source.
 * @param {number} [options.height] - set height for clipping bound. Default is c of source.
 * @param {number} [options.alpha=0] - alpha level [0, 254] to use for clipping. Any alpha value in the image above this value is considered a solid pixel.
 * @param {number} [options.tolerance=0] - point reduction tolerance in pixels. If 0 no point reduction is performed. Recommended values [0.7, 1.5]
 * @param {number} [options.bleed=5] - if maxShapes > 1 activates bleed mask for removing a traced shape.
 * @param {number} [options.maxShapes=1] - maximum number of shapes to trace. Minimum is 1. No upper limit but be careful not to block the browser.
 * @param {boolean} [options.align=false] - Attempts to align points to edge after reduction or with path if no reduction is performed. Disabled if padding is enabled.
 * @param {number} [options.alignWeight=0.95] - Weighting a aligned point to avoid overlapping points.
 * @param {number} [options.padding=0] - Add padding before tracing (radius). Use negative value to contract. Padding overrides and disables aligning if enabled.
 * @param {boolean} [options.path2D=false] - Return array holding Path2D objects instead of point arrays.
 * @returns {Array} Holds arrays with points for each shape, or if path2D=true an Path2D object for each shape
 * @static
 */
function MSQR(src, options) {

	"use strict";

	options = options || {};

	var ctx;

	if (src instanceof CanvasRenderingContext2D) {
		ctx = src;
	}
	else if (src instanceof HTMLCanvasElement) {
		ctx = src.getContext("2d");
	}
	else if (src instanceof HTMLImageElement || src instanceof HTMLVideoElement) {
		ctx = img2context(src);
	}
	else throw "Invalid source.";

	var w           = ctx.canvas.width,
		h           = ctx.canvas.height,
		cx          = options.x || 0,
		cy          = options.y || 0,
		cw          = options.width || w,
		ch          = options.height || h,
		bu, paths   = [], path,
		lastPos = 3, // for recursive calls
		bleed       = Math.max(1, options.bleed || 5),
		max         = Math.max(1, options.maxShapes || 1),
		alpha       = Math.max(0, Math.min(254, options.alpha || 0)),
		padding 	= options.padding || 0,
		tolerance   = Math.max(0, options.tolerance || 0),
		doAlign     = !!options.align,
		alignWeight = options.alignWeight || 0.95,
		retPath     = !!options.path2D,
		ctx2, inc;

	// check bounds
	if (cx < 0 || cy < 0 || cx >= w  || cy >= h ||
		cw < 1 || ch < 1 || cx + cw > w || cy + ch > h)
		return [];

	// recursive? make backup since we will need to remove shapes
	if (max > 1 || padding) {

		// backup bitmap so we can mess around
		bu = ctx.getImageData(0, 0, w, h);

		// force reset so we won't get surprises
		ctx.save();
		ctx.setTransform(1,0,0,1,0,0);
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = ctx.strokeStyle = "#000";
		ctx.globalAlpha = 1;
		ctx.shadowColor = "rgba(0,0,0,0)";

		// Padding redraws the image in n number of timer around center
		// to extend the edges.
		if (padding) {

			ctx2 = img2context(ctx.canvas);
			inc = padding < 0 ? 4 : (padding > 5 ? 16 : 8);

			if (padding < 0)
				ctx.globalCompositeOperation = "destination-in";

			padding = Math.min(10, Math.abs(padding));

			for(var angle = 0, step = Math.PI * 2 / inc; angle < 6.28; angle += step)
				ctx.drawImage(ctx2.canvas, padding * Math.cos(angle), padding * Math.sin(angle));
		}

		// loop to find each shape
		do {
			path = trace();
			if (path.length) {

				// add to list
				paths.push(retPath ? points2path(path) : path);

				// remove traced shape
				ctx.beginPath();
				var i = path.length - 1;
				while(i--) ctx.lineTo(path[i].x, path[i].y);
				ctx.globalCompositeOperation = "destination-out";
				ctx.lineWidth = bleed;
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		}
		while(path.length && --max);

		// restore bitmap to original
		ctx.putImageData(bu, 0, 0);
		ctx.restore();

		return paths
	}
	else {
		path = trace();
		paths.push(retPath ? points2path(path) : path);
	}

	return paths;

	/*
		Trace
	 */
	function trace() {

		var path = [],
			data, l,
			i, x, y, sx, sy,
			start = -1,
			step, pStep = 9,
			steps = [9, 0, 3, 3, 2, 0, 9, 3, 1, 9, 1, 1, 2, 0, 2, 9];

		data = new Uint32Array(ctx.getImageData(cx, cy, cw, ch).data.buffer);
		l = data.length;

		// start position
		for(i = lastPos; i < l; i++) {
			if ((data[i]>>>24) > alpha) {
				start = lastPos = i;
				break
			}
		}

		// calculate start position
		x = sx = (start % cw) | 0;
		y = sy = (start / cw) | 0;

		// march from start point until start point
		if (sx > -1) {
			do {
				step = getNextStep(x, y);

				if (step === 0) y--;
				else if (step === 1) y++;
				else if (step === 2) x--;
				else if (step === 3) x++;

				if (step !== pStep) {
					path.push({x: x + cx, y: y + cy});
					pStep = step;
				}
			}
			while(x !== sx || y !== sy);

			// point reduction?
			if (tolerance)
				path = reduce(path, tolerance);

			// align? (only if no padding)
			if (doAlign && !padding)
				path = align(path, alignWeight);
		}

		// lookup map entry
		function getState(x, y) {
			return (x >= 0 && y >= 0 && x < cw && y < ch) ? (data[y * cw + x]>>>24) > alpha : 0
		}

		// Parse 2x2 pixels to determine next step direction.
		// See https://en.wikipedia.org/wiki/Marching_squares for details.
		// Note: does not do clockwise cycle as in the original specs, but line by line.
		function getNextStep(x, y) {

			var v = 0|0;
			if (getState(x - 1, y - 1)) v |= 1;
			if (getState(x, y - 1)) v |= 2;
			if (getState(x - 1, y)) v |= 4;
			if (getState(x, y)) v |= 8;

			if (v === 6)
				return pStep === 0 ? 2 : 3;
			else if (v === 9)
				return pStep === 3 ? 0 : 1;
			else
				return steps[v];
		}

		// Ramer Douglas Peucker with correct distance point-to-line
		function reduce(points, epsilon) {

			var len1 = points.length - 1;
			if (len1 < 2) return points;

			var fPoint = points[0],
				lPoint = points[len1],
				epsilon2 = epsilon * epsilon,
				i, index = -1,
				cDist, dist = 0,
				l1, l2, r1, r2;

			for (i = 1; i < len1; i++) {
				cDist = distPointToLine(points[i], fPoint, lPoint);
				if (cDist > dist) {
					dist = cDist;
					index = i
				}
			}

			if (dist > epsilon2) {
				l1 = points.slice(0, index + 1);
				l2 = points.slice(index);
				r1 = reduce(l1, epsilon);
				r2 = reduce(l2, epsilon);

				return r1.slice(0, r1.length - 1).concat(r2)
			}
			else
				return [fPoint, lPoint]
		}

		function distPointToLine(p, l1, l2) {

			var lLen = dist(l1, l2), t;

			if (!lLen)
				return 0;

			t = ((p.x - l1.x) * (l2.x - l1.x) + (p.y - l1.y) * (l2.y - l1.y)) / lLen;

			if (t < 0)
				return dist(p, l1);
			else if (t > 1)
				return dist(p, l2);
			else
				return dist(p, { x: l1.x + t * (l2.x - l1.x), y: l1.y + t * (l2.y - l1.y)});
		}

		function dist(p1, p2) {
			var dx = p1.x - p2.x,
				dy = p1.y - p2.y;
			return dx * dx + dy * dy
		}

		// Align by K3N
		function align(points, w) {

			var ox = new Int8Array([1, -1, -1, 1]),
				oy = new Int8Array([1, 1, -1, -1]);

			points.forEach(function(p) {
				p.x = Math.round(p.x);
				p.y = Math.round(p.y);

				for(var i = 0, tx, ty, dx, dy; i < 4; i++) {
					dx = ox[i];
					dy = oy[i];
					tx = p.x + (dx<<1);
					ty = p.y + (dy<<1);
					if (tx > cx && ty > cy && tx < cw - 1 && ty < ch - 1) {
						if (!getState(tx, ty)) {
							tx -= dx;
							ty -= dy;
							if (getState(tx, ty)) {
								p.x += dx * w;
								p.y += dy * w;
							}
						}
					}
				}
			});

			return points
		}

		return path
	}

	/*
		Helper functions
	 */

	function img2context(src) {
		var c = document.createElement("canvas"), ctx;
		c.width = src.naturalWidth || src.videoWidth || src.width;
		c.height = src.naturalHeight || src.videoHeight || src.height;
		ctx = c.getContext("2d");
		ctx.drawImage(src, 0, 0);
		return ctx
	}

	function points2path(points) {
		var path = new Path2D(), i, point;
		path.moveTo(points[0].x, points[0].y);
		for(i = 1; point = points[i++];) path.lineTo(point.x, point.y);
		path.closePath();
		return path
	}

}

/**
 * Generic function to obtain boundaries of an array with points. The
 * array contains point objects with properties x and y.
 *
 * @example
 *
 *     var rect = MSQR.getBounds(points);
 *
 * @param {Array} points - point array with point objects
 * @returns {{x: Number, y: Number, width: number, height: number}}
 * @name MSQR.getBounds
 * @function
 * @global
 */
MSQR.getBounds = function(points) {

	var minX = 9999999, minY = 9999999,
		maxX = -9999999, maxY = -9999999,
		i, l = points.length;

	for(i = 0; i < l; i++) {
		if (points[i].x > maxX) maxX = points[i].x;
		if (points[i].x < minX) minX = points[i].x;
		if (points[i].y > maxY) maxY = points[i].y;
		if (points[i].y < minY) minY = points[i].y;
	}

	return {
		x: minX|0,
		y: minY|0,
		width: Math.ceil(maxX - minX),
		height: Math.ceil(maxY - minY)
	}
};

if (typeof exports !== "undefined") exports.MSQR = MSQR;
