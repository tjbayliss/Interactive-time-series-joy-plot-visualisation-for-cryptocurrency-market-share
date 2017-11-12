	/*

	Name: CRYPTOCURRENCY MAP
	Developer: J BAYLISS
	From/to: OCTOBER 2017 to _____
	Technologies: D3, Javascript, D3, Chosen, Bootstrap

	*/



	// initialise global variables.
	var graphic = $('#graphic'); // set variable to DOM element to contain graphic
	var map = $('#map'); // set variable to DOM element to contain graphic
	var vis = {}; // global object variable to contain all variables prefixed with 'vis.'	
	vis.pymChild = null; // initial Pym variable
	vis.margin; // initialise margin object            
	vis.svg; // vis.svg container
	
	
	vis.countryCodes = [];

	// browser use checking		
	vis.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
	vis.isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
	vis.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; // At least Safari 3+: "[object HTMLElementConstructor]"
	vis.isChrome = !!window.chrome && !vis.isOpera;              // Chrome 1+
	vis.isIE = /*@cc_on!@*/false || !!document.documentMode;   // At least IE6		
	vis.output = 'Detecting browsers by ducktyping:		';
	
	vis.output += 'vis.isFirefox: ' + vis.isFirefox + '		';
	vis.output += 'vis.isChrome: ' + vis.isChrome + '		';
	vis.output += 'vis.isSafari: ' + vis.isSafari + '		';
	vis.output += 'vis.isOpera: ' + vis.isOpera + '		';
	vis.output += 'vis.isIE: ' + vis.isIE + '		';
	
	vis.g1, vis.g2, vis.g3, vis.g4;
	vis.width;
	vis.height;
	vis.active;
	vis.cryptoData;
	
	vis.timelineIndex = 0;

	d3.select('.trl_toolTip').remove();
	vis.toolTip;
	
	d3.selectAll('.trl_legend').remove();
	vis.legend;
	
	
	
	
		
		
	function getCountryNameFromCode(c) {
		return vis.countryCodes[c][0]['Common Name'];
	}
	
		
	function wrangleCountryCodes(data) {
		vis.countryCodes = d3.nest()
			.key(function(d) { return d['ISO 3166-1 3 Letter Code']; })
			// .rollup(function(d) { return d.Name; })
			.map(data);
	}
	
	function showCountryCryptoInformation(c, information) {
		
		var flagCode = vis.countryCodes["$"+c.properties.code][0]['ISO 3166-1 2 Letter Code'].toLowerCase();
		var flagSpan = '<span class="flag-icon flag-icon-' + flagCode + '"></span>';
		
		// build-up tool tip for country hover over
		vis.txt = '<div class="trl_header">';
		vis.txt += '<div class="flag">' + flagSpan + '</div>';
		vis.txt += '<span class="country">' + UnderscoreToSpace(c.properties.name) + '</span></div>';
		vis.txt += '<div class="trl_information">' + information + '</span></div>';

		vis.toolTip.html(vis.txt);
		vis.toolTip.style('opacity',0.99);
			
		var sel = d3.select('.trl_toolTip');
		sel.moveToFront();
		
		return;
		
	}// end function showCountryCryptoInformation()
	
	
	// initialise domain and range for colour scale associated to paths drawn
	vis.linearScale = d3.scaleLinear().domain(-1,1).range(-1,1);
	

	d3.loadData = function() {
		var loadedCallback = null;
		var toload = {};
		var data = {};
		var loaded = function(name, d) {
		  delete toload[name];
		  data[name] = d;
		  return notifyIfAll();
		};
		var notifyIfAll = function() {
		  if ((loadedCallback != null) && d3.keys(toload).length === 0) {
			loadedCallback(data);
		  }
		};
		var loader = {
		  json: function(name, url) {
			toload[name] = url;
			d3.json(url, function(d) {
			  return loaded(name, d);
			});
			return loader;
		  },
		  csv: function(name, url) {
			toload[name] = url;
			d3.csv(url, function(d) {
			  return loaded(name, d);
			});
			return loader;
		  },
		  onload: function(callback) {
			loadedCallback = callback;
			notifyIfAll();
		  }
		};
		return loader;
	  };
	
	var taperedArcArea = d3.area()
		.x(function(d) { return (d.x); })
		.x0(function(d) { return (d.x0); })
		.y0(function(d) { return (d.y0); })
		.y1(function(d) { return (d.y1); })
		.curve(d3.curveCardinal.tension(0.5));
			 

	/*
		name: 			drawGraphic
		DESCRIPTION:	Main drawing function to draw to DOM initial scarter plot view. 	
		CALLED FROM:	Pym in 	
		CALLS:			
		REQUIRES: 		n/a
		RETURNS: 		n/a
	*/
	function drawGraphic()
	{
		
	
		// set mobile size margins, height and width
		vis.margin = {top: vis.config.vars.margin[0], right: vis.config.vars.margin[1], bottom: vis.config.vars.margin[2], left: vis.config.vars.margin[3]}; 
		vis.width = vis.config.vars.mapDimensions[0];
		vis.height = vis.config.vars.mapDimensions[1];
			
		// update domain and range for colour scale associated to paths drawn with values taken from config file
		vis.linearScale.domain(vis.config.vars.pathGradientDomain).range(vis.config.vars.pathGradientRange);
	
    	vis.active = d3.select(null);

			
		switch (vis.config.vars.mapStyle) {
			case "boundary":
				d3.select("#map").attr("width", vis.width).attr("height", vis.height);
				//makeBoundaryMap();
				//drawTopChart();
				
				if ( vis.config.vars.bottomChart == 'linear' ){ drawLinearBottomChart(); }
				else if ( vis.config.vars.bottomChart == 'sm' ){ drawSMBottomChart(); }
				else { }
				break;
				
			case "tile":
				d3.select("#map").style("width", vis.width+"px").style("height", vis.height+"px");
				makeTileMap();
				break;
				
		}// end switch
		
		
		setupExpandClicks();
	
		//use pym to calculate chart dimensions	
		if (vis.pymChild) { vis.pymChild.sendHeight(); }
		
		
		return;
		 

	} // end function drawGraphic()








	/*
		NAME: 			buildUI
		DESCRIPTION: 	function to build intitial UI interface.
		CALLED FROM:	Modernizr.inlinesvg
		CALLS:			n/a
		REQUIRES: 		n/a	
		RETURNS: 		n/a		
	*/
	function buildUI(){	
	
		console.log(vis.config);
			
		switch (vis.config.vars.headers){
			
			case true:	
				$(".row.headers").show();
				
				d3.select("#mainHeader").text(vis.config.vars.mainHeader);
				d3.select("#subHeader").text(vis.config.vars.subHeader);
				d3.select("#information").text(vis.config.vars.information);
				break;
			default:
				$(".row.headers").hide();
				break;
				
		}// end switch
		
			
		switch (vis.config.vars.legend) {
			
			case "horizontal":
				$(".row.vertical").remove();
				$(".row.horizontal").show();
				break;
			case "vertical":
				$(".row.vertical").show();
				$(".row.horizontal").remove();
				break;
				
		}// end switch
		
		
		//loadData();
		
			
		return;
		
	} // end function buildUI()
	
	
	
	function loadData(){
		
		d3.queue()
			/*.defer(d3.csv, vis.config.vars.dataFile)*/
			.defer(d3.csv, vis.config.vars.countriesFile)
			/*.defer(d3.json, vis.config.vars.dataFile3)*/
			.awaitAll(function ready(error, results, treemapData) {
				if (error) throw error;
				globaliseData(results);
				//drawTopChart(treemapData);
			});
		
		return;
		
	}//end function loadData()
	
	
	
	
	function globaliseData(data){
		
		vis.countryData = data[0];
		wrangleCountryCodes(vis.countryData);
		
		return;
		
	}// end function globaliseData() 
	
	
	
	

	/*
	NAME: 			transitionData
	DESCRIPTION: 	function used to transition all and/or selected grouped dots plus related voronoi layers
	CALLED FROM:	clickPillGroups
					drawGraphic
	CALLS:			showtooltip
					hidetooltip
	REQUIRES: 		n/a
	RETURNS: 		n/a
	*/
	function transitionData()
	{

	return;
	 
	}// end transitionData()

				
				
	/*==========  expandable sections  ==========*/
	
	function setupExpandClicks() {
		
		$('.more .reveal').slideToggle(0);
	
		$('.explanation .more .trigger').click(function(){
			var r = $(this).parent().find('.reveal');
			if ( r.css('display') == 'none') {
				$(this).html('less...'); 
			} else {
				$(this).html('more...')
			}
			r.slideToggle();
		});
	
		$('.notes .more .trigger').click(function() {
			var r = $(this).parent().find('.reveal');
			if ( r.css('display') == 'none') {
				$(this).html('Click to hide data sources and methodology'); 
			} else {
				$(this).html('Click to show data sources and methodology')
			}
			r.slideToggle();
		});
	}

				
							

	//then, onload, check to see if the web browser can handle 'inline vis.svg'
	if (Modernizr.inlinesvg)
	{


		// open and load configuration file. 					
		d3.json("data/config.json", function(error, json)
		{	

								
			// store read in json data from config file as as global vis. variable ...	
			vis.config = json;
			
			
			// call functionm to draw initial UI on load.
			buildUI();
			loadData();
			vis.pymChild = new pym.Child({renderCallback: drawGraphic});
		
		})// end 


	} // end if ... 
	else {


		//use pym to create iframe containing fallback image (which is set as default)
		vis.pymChild = new pym.Child();
		if (vis.pymChild) { vis.pymChild.sendHeight(); }
	}	
	
	


function screenResize() {
	// http://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
	var width = window.innerWidth
	|| document.documentElement.clientWidth
	|| document.body.clientWidth;

	var height = window.innerHeight
	|| document.documentElement.clientHeight
	|| document.body.clientHeight;


	// $('.chart').css('height', (height - 0) + 'px');

	width = $('.chart').width();
	height = $('.chart').height();

	// vis.screenSize = [width, height];
	// vis.riotHeight = height * 0.2;
	// vis.chartHeight = height * 0.3;
	// vis.tooltipHeight = height * 0.4
	// vis.touchLineHeight = height * 0.2;

	if (vis.dataLoaded) { renderChart(); }

	trace('screenResize: ' + width + ' x ' + height);
}

function setupResize() {
	window.addEventListener('resize', updateLayout, false);
	screenResize();
}