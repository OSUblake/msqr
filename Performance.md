Performance
-----------

Performance tests in Chrome v.52 (Canary), Opera v.36, Firefox v.48 (dev) tracing an image draw into canvas on a i5-4210U 2.4 GHz/Intel 4400/Windows 8.1.

It compares MSQR to [D3 Contour plugin](https://github.com/d3/d3-plugins/tree/master/geom/contour) by Michael Bostock and [Sakri's port](https://github.com/sakri/MarchingSquaresJS) of Phill Spiess .Net version.

All times are in milliseconds (ms).

Average time per 1000 traces in Chrome, 5 runs:

	 MSQR       D3 plugin  Sakri's          Diff D3    Diff Sakri
	+----------+----------+----------+     +----------+----------+
	  3.7244      4.6021    10.2650          1.2357x    2.7562x  
	  3.7128      4.6379    14.1267          1.2492x    3.8048x  
	  3.6871      4.8342     9.9511          1.3111x    2.6989x  
	  3.5231      5.0839    10.0688          1.4430x    2.8579x  
	  3.6815      5.1165    10.0613          1.3898x    2.7330x  
	
	MSQR ~1.33x faster than D3 Plugin on average.
	MSQR ~2.97x faster than Sakri's port on average.

Average time per 1000 traces in Opera, 5 runs:

	 MSQR       D3 plugin  Sakri's          Diff D3    Diff Sakri
	+----------+----------+----------+     +----------+----------+
	  3.3763      5.5273    16.0342          1.6371x    4.7491x  
	  3.5368      5.6331    16.3504          1.5927x    4.6229x  
	  4.6460      5.6573    16.1521          1.2177x    3.4765x  
	  4.6382      5.6472    16.1498          1.2175x    3.4819x  
	  4.6160      5.6487    12.2810          1.2237x    2.6605x  
	
	MSQR ~1.38x faster than D3 Plugin on average.
	MSQR ~3.80x faster than Sakri's port on average.

Average time per 1000 traces in Firefox, 5 runs:

	 MSQR       D3 plugin  Sakri's          Diff D3    Diff Sakri
	+----------+----------+----------+     +----------+----------+
	  7.0635      6.3013    79.0548          0.8921x   11.1921x  
	  3.6008      3.4746    90.1968          0.9649x   25.0491x  
	  3.9651      3.4901    91.3328          0.8802x   23.0341x  
	  3.7656      3.8152    70.4570          1.0132x   18.7107x  
	  4.7745      6.4277    95.9644          1.3463x   20.0995x  
	
	MSQR ~1.02x faster than D3 Plugin on average.
	MSQR ~19.62x faster than Sakri's port on average.

There will be fluctuations depending on CPU cache, browser compiling of JavaScript and so forth.
