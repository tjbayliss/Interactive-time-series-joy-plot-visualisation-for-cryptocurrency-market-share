

function drawBottomChart(){
	
	var count = 0;
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	function numToMonth(n) {
		return (months[Number(n) - 1]);
	}
		
	var margin = { top: 15, right: 10, bottom: 185, left: 15 },
		width = 1160 - margin.left - margin.right,
		sm_height = 200;
	
	//Jan 01, 2017 - date format of Jessica's crptocurrency data
	var parseDate = d3.timeParse("%b %d, %Y");
	
	vis.x = d3.scaleTime().range([0, width-margin.right]);
	
	var startDate = '';
	var endDate = '';
	
	vis.symbols = {};
	
	var svg;
  	vis.chartHeight = 270;

	vis.g6 = vis.svg.append("g")
		.attr("class" , "trl_graph")
		.attr("id" , "trl_graph")
		.attr('width', width)
		.attr('height', vis.chartHeight);
	
	var chart = d3.select('#trl_graph');
	var chartH = 225;

	
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
		.attr('height', chartH)
		.attr('transform', 'translate(' + (margin.left) + ',' + (455) + ')');
	
	svg = d3.select("#trl_graph").selectAll(".svg-sm")
		.data(vis.symbols)
		.enter()
		.append("g")
		.attr("class" , function(d,i){ return "svg-sm " + SpaceToHyphen(d.key); })
		.attr("id" , function(d,i){ return "svg-sm-" + SpaceToHyphen(d.key); })
		.attr("transform", function(d,i){
			vis.depth = parseInt((vis.config.vars.mapDimensions[1]-((i+1)*sm_height+5))-25);
			vis.count = i;
			//return "translate(" + margin.left + "," + ((vis.config.vars.mapDimensions[1]-((i+1)*(30)+margin.bottom))-25) + ")";
			return "translate(" + margin.left + "," + ((150+((i+1)*(15)+margin.bottom))) + ")";
		})
		.each(multiple);
				
				
		var chartBounds = {
			top: 455/*+margin.top*/,
			left: margin.left,
			right: width-margin.right+margin.left,
			bottom: 455+chartH/*-margin.bottom*/
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
				//console.log("yrMoDate: " + yrMoDate);
				
				var anch = 'start';
				if (xpos > width - 50) { anch = 'end'; }
				
				if (		xpos > chartBounds.left && xpos < chartBounds.right &&
						ypos > chartBounds.top && ypos < chartBounds.bottom ) {
							
					//d3.select('.trl_toolTip').remove();
					
					d3.select('.yearText').text(da + " " + months[mo] + ', ' + yr).attr('text-anchor', anch)
					d3.select('#yearLineGroup').attr('transform', 'translate(' + (xpos) + ',0)').style("display" , "inline");
					var sel = d3.select('#yearLineGroup');
					sel.moveToFront();
					
					//console.log("\nyrMoDate:" + yrMoDate);
					
					vis.dates.forEach(function(d,i){
						
						var dotNumber = i;
						
						var index = domainArray2.indexOf(yrMoDate);
					
						d3.selectAll(".svg-sm." + SpaceToHyphen(d.key))
							.selectAll(".dataDots."+SpaceToHyphen(d.key))
							.attr("cx" , function(d,i){ return vis.x(date); })
							.attr("cy" , function(d){ return vis.y(d.values[index].value); })
							.style("display", "inline");
				
						d3.selectAll(".svg-sm." + SpaceToHyphen(vis.dates[i].key))
							.selectAll(".dataDotLabels." + SpaceToHyphen(vis.dates[i].key))
							.attr("x" , function(d,i){
								if( anch == 'start' ){  return (vis.x(date))+5; }
								else if( anch == 'end' ){  return (vis.x(date))-5; }
							})
							.attr("y" , function(d){ return vis.y(d.values[index].value)-5; })
							.style("display", "inline")
							.attr('text-anchor', anch)
							.text(function(d,i){ return numberWithCommas(d.values[index].value); });
						
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
				.attr('y1', 350)
				.attr('y2', 671);
			
			yearLine.append('text')
				.attr('class', 'yearText')
				.attr('id', 'yearText')
				.attr('x', 5)
				.attr('y', 350);
			
			svg.append("text")
				.attr("class" , "yAxisLabels")
				.attr("x", 0)
				.attr("y", sm_height-1)
				.text(function(d) { return d.key; });
				
		  d3.select("#trl_graph")
				.append("text")
				.attr("class" , "trl_GraphTitle")
				.attr("x", margin.left)
				.attr("y", parseInt(vis.depth)-12 )
				.style("text-anchor" , "start")
				.text("Market Capitalization");
				
			vis.xAxis = d3.axisBottom(vis.x);
			
			// append vis.x axis definition to upper focus graph
			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(" + (0) + "," + (51+vis.chartHeight) + ")")
				.style("display" , function(d,i){
					if ( i==0 ){ return "inline"; }
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
			.domain([0, /*d3.max(symbol.values, function(d) { return d.value; })]*/vis.GobalYMax])
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
			.x(function(d) { return vis.x(d.tickdate); })
			.y(function(d) { return vis.y(d.value); });
		
		svg.append("path")
			.attr("class", "area")
			.attr("d", area(symbol.values));
		
		svg.append("path")
			.attr("class", "line SMline")
			.attr("d", line(symbol.values));
	}
	
	function type(d) {
	  d.value = +d.value;
	  d.originalDate = d.tickdate;
	  d.tickdate = parseDate(d.tickdate);
	  return d;
	}
	
	
	return;
	
}// end function drawGraph()
