MSQR
====

This is a fast JavaScript implementation of the [Marching Squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm
which can convert the outline of an image to path data based on the alpha channel.

It's internally recursive and can trace multiple paths in the same image. It includes optional point reduction algorithm (Ramer-Douglas-Peucker) to 
reduce number of points in the path in addition to offering padding/bleed and clipping features, as well as point alignment for a more tighter path. 

Use with an image which already has an alpha channel, or pre-process the image to obtain desired alpha channel.


Features
--------

- [Fast](Performance.md), small and easy to use
- Can trace all separate shapes in the same using a single call
- Optional fast Ramer-Douglas-Peucker point reduction
- Alignment of points to make tighter fit
- Padding, Contracting and Bleed mask options
- Optional clipping region
- Can optionally return Path2D objects representing each shape
- Optional node.js support
- HTML docs included

NOTE: ALPHA


Performance
-----------

Overall test results indicate MSQR to be up to 33% faster compared to other 
fast implementations depending on browser and hardware, and up to 20 times 
faster compared to non-optimized solutions.

For details, see **[Performance.md](Performance.md)**. 

Test code included comparing two other solutions.


Demo
----

- **[Try out various parameters and settings](https://epistemex.github.io/msqr/demo.html)**.


Install
-------

**MSQR** can be installed in various ways:

- Git using HTTPS: `git clone https://github.com/epistemex/msqr.git`
- Git using SSH: `git clone git@github.com:epistemex/msqr.git`
- NPM: `npm install -g msqr`
- Bower: `bower install msqr`
- Download [zip archive](https://github.com/epistemex/msqr/archive/master.zip) and extract.
- [msqr.min.js](https://raw.githubusercontent.com/epistemex/msqr/master/msqr.min.js)


Usage
-----

Draw the image to canvas, or provide an image or context (even video):

	var pathPoints = MSQR( canvas|context|image|video [, options] );

The returned array contains point objects with x and y properties, or is empty
is no path could be traced.

Options include clipping, alpha tolerance and point distance tolerance:

	var pathPoints = MSQR(src, {
	  x: 10,			// clipping rect (can be used individually)
	  y: 10,
	  width: 100,
	  height: 50,
	  alpha: 64, 		// alpha threshold (default is 0 = any non-alpha pixels)
	  tolerance: 1.1,	// point reduction distance tolerance (default 0 = off)
	  bleed: 5,			// width of bleed mask (used with multiple shapes only)
	  maxShapes: 5,		// max shapes to trace (default = 1)
	  padding: 0,		// pad image before processing, negative value = contract
	  align: true,		// attempt to better align resulting path
	  path2D: false		// return list with Path2D objects instead of point arrays
	});

Additional helper function:

    var bounds = MSQR.getBounds(points);
    
Video can be passed in but is not much usable unless you use webp encoded video utilizing an alpha channel.
This video format is currently only supported by the Blink engine (Chrome and Opera).


Issues
------

See the [issue tracker](https://github.com/epistemex/msqr/issues) for details.


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You may use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.


*&copy; Epistemex 2016*
 
![Epistemex](http://i.imgur.com/wZSsyt8.png)
