MSQR
====

This is a fast JavaScript implementation of the [Marching Squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm
which can convert the outline of an image to path data based on the alpha channel.

It's internally recursive and can trace multiple paths in the same image. It includes optional point reduction algorithm (Ramer-Douglas-Peucker) to 
reduce number of points in the path as well as offering padding/bleed and clipping features and point alignment for a more tighter path. 

Use with an image which already has an alpha channel, or pre-process the image to obtain desired alpha channel.


Features
--------

- Fast, small and easy to use
- Can trace all separate shapes in the same image
- Optional fast Ramer-Douglas-Peucker point reduction algorithm
- Alignment of points to make tighter fit as well as help reduce more points
- Padding, Contracting and Bleed mask options
- Optional clipping can be defined
- Optional node.js support
- HTML docs included

NOTE: ALPHA

Demo
----

- **[Try out various parameters and settings](https://epistemex.github.io/msqr/demo.html)**.


Install
-------

**MSQR** can be installed in various ways:

- Git using HTTPS: `git clone https://github.com/epistemex/msqr.git`
- Git using SSH: `git clone git@github.com:epistemex/msqr.git`
- Download [zip archive](https://github.com/epistemex/msqr/archive/master.zip) and extract.
- [msqr.min.js](https://raw.githubusercontent.com/epistemex/msqr/master/msqr.min.js)

	
Usage
-----

Draw the image to canvas, then hand over the context and optionally set options:

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
	  align: true		// attempt to better align resulting path
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
