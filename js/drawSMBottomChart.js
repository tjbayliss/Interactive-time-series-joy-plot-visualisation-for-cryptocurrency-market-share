

function drawSMBottomChart(){
	
	var count = 0;
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	
		
	var margin = { top: 15, right: 15, bottom: 15, left: 125 },
		width = 1160 - margin.left - margin.right,
		sm_height = 200;
	
	//Jan 01, 2017 - date format of Jessica's crptocurrency data
	var parseDate = d3.timeParse("%b %d, %Y");
	
	vis.x = d3.scaleTime().range([0, width-margin.right]);
	
	var startDate = '';
	var endDate = '';
	
	vis.symbols = {};
	
	var svg;
  	vis.chartHeight = 300;
	

	
	vis.svg = d3.select("#chart")
		.append("svg")
		.attr("id", "mainSvg")
		.attr("width", vis.width)
		.attr("height", vis.height);

	vis.g6 = vis.svg.append("g")
		.attr("class" , "trl_graph")
		.attr("id" , "trl_graph")
		.attr('width', width)
		.attr('height', vis.chartHeight)
		.attr("transform" , "translate(0,0)");
	
	var chart = d3.select('#trl_graph');
	vis.chartH = 350;

	
	d3.csv(vis.config.vars.dataFile4, type, function(error, data) {
	  if (error) throw error;
	  
	  vis.symbols = d3.nest()
		  .key(function(d) { return d.symbol; })
		  .entries(data);
	 
	  vis.dates = d3.nest()
		  .key(function(d) { return d.symbol; })
		  .key(function(d) { return d.originalDate; })
		  .key(function(d) { return d.value; })
		  .entries(data);
	
	
	vis.currencyMaxs = [];
	
	vis.x.domain([
		d3.min(vis.symbols, function(symbol) {
			startDate = symbol.values[0].originalDate;
			return symbol.values[0].tickdate;
		}),
			d3.max(vis.symbols, function(symbol) {
			endDate = symbol.values[symbol.values.length - 1].originalDate;
			vis.currencyMaxs.push(d3.max(symbol.values, function(d) { return d.value; }));
			return symbol.values[symbol.values.length - 1].tickdate;
		})
	]);
	
	vis.GobalYMax = d3.max(vis.currencyMaxs);
	
	var matchFormat = d3.timeFormat("%e %b, %Y");
	var domainArray = [];
	var domainArray2 = [];
	domainArray = d3.timeDay.range(vis.x.domain()[0], vis.x.domain()[1]);
	domainArray2 = domainArray.map(function(d,i){
		if ( matchFormat(d)[0] == ' ' ) { return matchFormat(d).replace(' ' , ''); }
		else { return matchFormat(d); }
	})
	
	
	
	// hit rectangle for chart
	hit = d3.select("#trl_graph").append('rect')
		.attr('class', 'hit')
		.attr('width', width-margin.right)
		.attr('height', vis.chartH)
		.attr('transform', 'translate(' + (margin.left) + ',' + (margin.top) + ')');
	
	svg = d3.select("#trl_graph").selectAll(".svg-sm")
		.data(vis.symbols)
		.enter()
		.append("g")
		.attr("class" , function(d,i){ return "svg-sm " + SpaceToHyphen(d.key); })
		.attr("id" , function(d,i){ return "svg-sm-" + SpaceToHyphen(d.key); })
		.attr("transform", function(d,i){
			return "translate(" + margin.left + "," + ((margin.top+((i+1)*(15)+margin.bottom))) + ")";
		})
		.each(multiple);
				
				
		var chartBounds = {
			top: margin.top,
			left: margin.left,
			right: width-margin.right+margin.left,
			bottom: vis.chartH+margin.top
		}
		
		
		
		// mouseover sets current date while allowing mouseover of any line in the chart
		vis.g6.on('mousemove', function(d) {
				
				// get year and month based on xpos
				var m = d3.mouse(this);
				var xpos = m[0];
				var ypos = m[1];
				
				var date = vis.x.invert(xpos-margin.left);
				var da = date.getDate();
				var mo = date.getMonth();
				var yr = date.getFullYear();
				var yrMo = String(yr) + '-' + months[mo];
				var yrMoDate = da + " " + months[mo] + ', ' + yr;
				
				var anch = 'start';
				if (xpos > width) { anch = 'end'; }
				
				if (		xpos > chartBounds.left && xpos < chartBounds.right &&
						ypos > chartBounds.top && ypos < chartBounds.bottom ) {
					
					d3.select('.yearText').text(da + " " + months[mo] + ', ' + yr).attr('text-anchor', anch)
					d3.select('#yearLineGroup').attr('transform', 'translate(' + (xpos) + ',0)').style("display" , "inline");
					var sel = d3.select('#yearLineGroup');
					sel.moveToFront();
					
					vis.dates.forEach(function(d,i){
						
						var dotNumber = i;
						var index = domainArray2.indexOf(yrMoDate);
					
						d3.selectAll(".svg-sm." + SpaceToHyphen(d.key))
							.selectAll(".dataDots."+SpaceToHyphen(d.key))
							.attr("cx" , function(d,i){ return vis.x(date); })
							.attr("cy" , function(d){ return vis.y(d.values[index].value); })
							.style("display", function(d,i){
								if ( d.values[index].value == 0 ){ return "none"; }
								else{ return "inline"; }
							});
							
				
						d3.selectAll(".svg-sm." + SpaceToHyphen(vis.dates[i].key))
							.selectAll(".dataDotLabels." + SpaceToHyphen(vis.dates[i].key))
							.attr("x" , function(d,i){
								if( anch == 'start' ){  return (vis.x(date))+5; }
								else if( anch == 'end' ){  return (vis.x(date))-5; }
							})
							.attr("y" , function(d){ return vis.y(d.values[index].value)-5; })
							.style("display", function(d,i){
								if ( d.values[index].value == 0 ){ return "none"; }
								else{ return "inline"; }
							})
							.attr('text-anchor', anch)
							.text(function(d,i){ return "$"+((d.values[index].value/1000000000).toFixed(2))+" billion"; });
						
						var sel = d3.selectAll('.dataDots');
						sel.moveToFront();
						var sel = d3.selectAll('.dataDotLabels');
						sel.moveToFront();
							
					})// end forEach
					
				} else {
					d3.select('#yearLineGroup').style("display" , "none");
					svg.selectAll(".dataDots").style("display", "none");
					svg.selectAll(".dataDotLabels").style("display", "none");
				}
				
			});
		
			
			// year hilight line
			var yearLine = vis.g6.append('g')
				.attr('class', 'yearLineGroup')
				.attr('id', 'yearLineGroup')
				.style("display", "none");
			
			yearLine.append('line')
				.attr('class', 'yearLine')
				.attr('id', 'yearLine')
				.attr('x1', 0)
				.attr('x2', 0)
				.attr('y1', margin.top)
				.attr('y2', margin.top+vis.chartH);
			
			yearLine.append('text')
				.attr('class', 'yearText')
				.attr('id', 'yearText')
				.attr('x', 5)
				.attr('y', margin.top+15);
			
			svg.append("text")
				.attr("class" , "yAxisLabels")
				.attr("x", function(d,i){
					for( el in d.values ){
						if ( d.values[el].value == 0 ){ continue; }
						else{ return vis.x(d.values[el].tickdate)-5; }
					}
					return;
				})
				.attr("y", function(d,i){
					for( el in d.values ){
						if ( d.values[el].value == 0 ){ continue; }
						else{ return vis.y(d.values[el].value); }
					}
					return;
				})
				.style("text-anchor" , "end")
				.text(function(d) { return d.key; });
				
		  d3.select("#trl_graph")
				.append("text")
				.attr("class" , "trl_GraphTitle")
				.attr("x", margin.left)
				.attr("y", margin.top)
				.style("text-anchor" , "start")
				.text("Market Capitalization ($)");
				
			vis.xAxis = d3.axisBottom(vis.x);
			
			// append vis.x axis definition to upper focus graph
			svg.append("g")
				.attr("class" , function(d) { return "x axis " + d.key; })
				.attr("transform", "translate(" + (0) + "," + (sm_height) + ")")
				.style("display" , function(d,i){
					if ( i==8 ){ return "inline"; }
					else{ return "none"; }
				})
				.call(vis.xAxis);
				
		});/// end d3.csv data loading ... 
		
		
	
	
	
	
	function multiple(symbol) {
		
		var svg = d3.select(this);
	 
		svg.append("circle")
			.attr("class" , function(d,i){ return "dataDots " + SpaceToHyphen(d.key); })
			.attr("id" , function(d,i){ return "dataDot-" + SpaceToHyphen(d.key); })
			.attr("r", 4)
			.style("display", "none")
			.style("pointer-events" , "none");
	
		svg.append("text")
			.attr("class" , function(d,i){ return "dataDotLabels " + SpaceToHyphen(d.key); })
			.style("display", "none")
			.style("pointer-events" , "none")
			.text("text");
		
		vis.y = d3.scaleLinear()
			.domain([0, vis.GobalYMax])
			.range([sm_height, 0]);
		vis.yAxis = d3.axisLeft(vis.y);
		
		// append vis.x axis definition to upper focus graph
		svg.append("g")
			.attr("class", "y axis " + SpaceToHyphen(symbol.key))
			.attr("id", "y-axis-" + SpaceToHyphen(symbol.key))
			.attr("transform", "translate(" + (margin.left) + "," + 0 + ")")
			.style("display" , "none")
			.call(vis.yAxis);
		
		var area = d3.area()
			.x(function(d) { return vis.x(d.tickdate); })
			.y0(sm_height)
			.y1(function(d) { return vis.y(d.value); });
		
		var line = d3.line()
			.defined(function(d) { return d.value; })
			.x(function(d) { return vis.x(d.tickdate); })
			.y(function(d) { return vis.y(d.value); });
		
		svg.append("path")
			.attr("class", "area")
			.attr("d", area(symbol.values));
		
		svg.append("path")
			.attr("class", "line SMline " + SpaceToHyphen(symbol.key))
			.attr("d", line(symbol.values));
	}
	
	function type(d) {
	  d.value = +d.value;
	  d.originalDate = d.tickdate;
	  d.tickdate = parseDate(d.tickdate);
	  return d;
	}
	
	function numToMonth(n) {
		return (months[Number(n) - 1]);
	}
	
	
	return;
	
}// end function drawGraph()
