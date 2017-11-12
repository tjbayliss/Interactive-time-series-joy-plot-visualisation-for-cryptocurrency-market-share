
	
	function drawLinearBottomChart(){
		
		console.log("linear Line Chart");
		
		var count = 0;
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		function numToMonth(n) {
			return (months[Number(n) - 1]);
		}
		
		vis.graphLegend = d3.select("#chart")
									.append('div')
									.attr('class', 'trl_graphLegend');
		
		var matchFormat = d3.timeFormat("%e %b, %Y");
		var domainArray = [];
		var domainArray2 = [];
		
		var chartH = 225;
	
		var svg = d3.select("svg");
		var margin = { top: 450, right: 40, bottom: 5, left: 30 };
		var width = 960 - margin.left - margin.right;
		var height = 225;
		
		vis.g6 = svg.append("g")
			.attr("class" , "trl_graphBottom")
			.attr("id" , "trl_graphBottom")
			.attr('width', width)
			.attr('height', 270)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		// hit rectangle for chart
		hit = d3.select("#trl_graphBottom")
			.append('rect')
			.attr('class', 'hit')
			.attr('width', width)
			.attr('height', height)
			.attr('transform', 'translate(' + (0) + ',' + (0) + ')');
	
		var parseTime = d3.timeParse("%b %d, %Y");
		
		var x = d3.scaleTime().range([0, width]),
			y = d3.scaleLinear().range([height, 0]),
			z = d3.scaleOrdinal(d3.schemeCategory10);
		
		var line = d3.line()
			.curve(d3.curveBasis)
			.defined(function(d) { return d.currencyData; })
			.x(function(d) { return x(d.date); })
			.y(function(d) { return y(d.currencyData); });
			
		d3.csv(vis.config.vars.dataFile1, type, function(error, data) {
			  if (error) throw error;
			
			  vis.currencies = data.columns.slice(1).map(function(id) {
				  
					return {
							id: id,
							values: data.map(function(d) {
								return {date: d.date, currencyData: d[id]};
							})
					};
			  });
		
		
		x.domain(d3.extent(data, function(d) { return d.date; }));
		
		y.domain([
			d3.min(vis.currencies, function(c) { return d3.min(c.values, function(d) { return d.currencyData; }); }),
			d3.max(vis.currencies, function(c) {
				return d3.max(c.values, function(d) { return Math.ceil(d.currencyData / 10000000000) * 10000000000; });
			})
		]);
				  
		
		domainArray = d3.timeDay.range(x.domain()[0], x.domain()[1]);
		domainArray2 = domainArray.map(function(d,i){
			if ( matchFormat(d)[0] == ' ' ) { return matchFormat(d).replace(' ' , ''); }
			else { return matchFormat(d); }
		})
		z.domain(vis.currencies.map(function(c) { return c.id; }));
		
		vis.g6.append("g")
			.attr("class", "axis axis--x")
			.attr("id", "axis--x")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));
		
		vis.g6.append("g")
			.attr("class", "axis axis--y")
			.attr("id", "axis--y")
			.call(d3.axisLeft(y).tickFormat(function(d,i){ return d/1000000000; }) );
		d3.selectAll(".tick").selectAll("line").style("display" , "none")
									
		// draw tick grid lines extending from y-axis ticks on axis across scatter graph
		vis.yticks = vis.g6.selectAll('#axis--y').selectAll('.tick');					 
		vis.yticks.append('svg:line')
			.attr( 'class' , "yAxisTicks" )
			.attr( 'y0' , 0 )
			.attr( 'y1' , 0 )
			.attr( 'x1' , -5 )
			.attr( 'x2',  width )
			.style("opacity" , 0.33)
			.style("pointer-events" , "none");
			
		var currency = vis.g6.selectAll(".currency")
			.data(vis.currencies)
			.enter().append("g").attr("class", "currency");
		
		currency.append("path")
			.attr("class", function(d){ return "line "+SpaceToHyphen(d.id); })
			.attr("id", function(d){ return "line-"+SpaceToHyphen(d.id); })
			.attr("d", function(d) { return line(d.values); })
			.style("pointer-events" , "auto")
			.on("mouseover", function(d,i){
				
				d3.selectAll(".graphLegend.name").style("opacity",0.25);
				d3.selectAll(".name." + SpaceToHyphen(d.id)).style("font-weight",700).style("opacity",1.0);
				d3.selectAll(".line").transition().duration(300)/*.style("opacity", 1.0)*/.style("opacity", 0.2);
				d3.select("#"+this.id).transition().duration(300)/*.style("opacity", 1.0)*/.style("opacity", 1.0).style("stroke-width", "5px");
				d3.select("#dataDot-" + SpaceToHyphen(d.id)).transition().duration(300).style("opacity", 1.0).attr("r", 6);
				return;
			})
			.on("mouseout", function(d,i){
				d3.selectAll(".graphLegend.name").style("opacity",1.0).style("font-weight",300);
				d3.selectAll(".line").transition().duration(300)/*.style("opacity", 1.0)*/.style("opacity", 1.0).style("stroke-width", "2.5px");
				//d3.select("#"+this.id).transition().duration(300)/*.style("opacity", 0.6)*/.style("stroke-width", "2.5px");
				d3.select("#dataDot-" + SpaceToHyphen(d.id)).transition().duration(300).style("opacity", 0.5).attr("r", 4);
				return;
			});
/*	
		currency.append("circle")
			.attr("class" , function(d,i){ return "dataDots " + SpaceToHyphen(d.id); })
			.attr("id" , function(d,i){ return "dataDot-" + SpaceToHyphen(d.id); })
			.attr("r", 5)
			.style("display", "none")
			.style("pointer-events" , "none");
*/
		
		currency.append("text")
			.attr("class" , function(d,i){ return "dataDotLabels " + SpaceToHyphen(d.id); })
			.style("display", "none")
			.style("pointer-events" , "none")
			.text("text");
		});
		
		function type(d, _, columns) {
		  d.date = parseTime(d.date);
		  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
		  return d;
		}		
				
		var chartBounds = {
			top: 455,
			left: margin.left,
			right: width-margin.right+margin.left,
			bottom: 455+chartH
		}
		
		vis.g6.on('mouseout', function(d){
			
			d3.select('#yearLineGroup').style("display" , "none");
			svg.selectAll(".dataDots").style("display", "none");
			vis.currencies.forEach(function(d,i){
				d3.selectAll(".name." + SpaceToHyphen(d.id)).selectAll(".marketCap_value").text(function(){
					return "";
				}); 
			})
		})
		
		// mouseover sets current date while allowing mouseover of any line in the chart
		vis.g6.on('mousemove', function(d){
		
			// get year and month based on xpos
			var m = d3.mouse(this);
			var xpos = m[0];
			var ypos = m[1];
			
			var date = /*vis.*/x.invert(xpos);
			var da = date.getDate();
			var mo = date.getMonth();
			var yr = date.getFullYear();
			var yrMo = String(yr) + '-' + months[mo];
			var yrMoDate = da + " " + months[mo] + ', ' + yr;
			
			var anch = 'start';
			if (xpos > width - 50) { anch = 'end'; }
			
			d3.select('.yearText').text(da + " " + months[mo] + ', ' + yr).attr('text-anchor', anch)
			d3.select('#yearLineGroup').attr('transform', 'translate(' + (xpos) + ',0)').style("display" , "inline");
			var sel = d3.select('#yearLineGroup');
			sel.moveToFront();
		
		
			var index = domainArray2.indexOf(yrMoDate);
			vis.timelineIndex = index;
			
			//buildTreemap(index);
			drawTopChart();
			
			vis.currencies.forEach(function(d,i){
				
				var dotNumber = i;
					
				d3.selectAll(".currency")
					.selectAll(".dataDots")
					.attr("cx" , function(d,i){ return x(date); })
					.attr("cy" , function(d){ return y(d.values[index].currencyData); })
					.style("display", "inline");
					
				d3.selectAll(".name." + SpaceToHyphen(d.id)).selectAll(".marketCap_value").text(function(){
					return " ($" + ((d.values[index].currencyData/1000000000).toFixed(1)) + " billion)";
				}); 
			 
				var sel = d3.selectAll('.dataDots');
				sel.moveToFront();
				var sel = d3.selectAll('.dataDotLabels');
				sel.moveToFront();
		
			})// end forEach
		
		});
		
		
		// year highlight line
		var yearLine = vis.g6.append('g')
			.attr('class', 'yearLineGroup')
			.attr('id', 'yearLineGroup')
			.style("display", "none");
		
		yearLine.append('line')
			.attr('class', 'yearLine')
			.attr('id', 'yearLine')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', 0)
			.attr('y2', height)
			.style("pointer-events" , "none");
		
		yearLine.append('text')
			.attr('class', 'yearText')
			.attr('id', 'yearText')
			.attr('x', 5)
			.attr('y', -5)
			.style("pointer-events" , "none");
		
		d3.select("#trl_graphBottom")
			.append("text")
			.attr("class" , "trl_GraphTitle")
			.attr("x", -25 )
			.attr("y", -20 )
			.style("text-anchor" , "start")
			.style("fill" , "#4D4D4D")
			.text("Market Capitalization ($ Billion)")
			.style("pointer-events" , "none");;
			
		drawGraphLegend();
	
		return;
		
	}// end function drawGraph()




	function drawGraphLegend() {

		vis.graphLegend.append('div').attr('class', 'trl_header').append('span').html('Legend');
		vis.currencies = [ "Bitcoin" , "Bitcoin Cash" , "Dash" , "Ethereum" , "Ethereum Classic" , "IOTA" , "Litecoin" , "NEM" , "Ripple"  ];
		
		// timeseries legend
		var ts = vis.graphLegend.append('div').attr('class', 'timeseries');
		ts.append('div').attr('class', 'exp').html('Market Capitalization');

		var col1 = ts.append('div').attr('class', 'col col1'),
			col2 = ts.append('div').attr('class', 'col col2');

		vis.currencies.forEach(function(d, i) {
		
			var col = col1;
			if (i > 9) col = col2;
			var indx = col.append('div').attr('class', 'graphLegend trl_index ' + SpaceToHyphen(d))
				.on("mouseover" , function(){
					d3.selectAll(".graphLegend.trl_index").style("opacity" , 0.25);
					d3.select(this).style("opacity" , 1.0);
					
					d3.selectAll(".line").style("opacity" , 0.15).style("stroke-width" , "1.0px");
					d3.selectAll(".line."+SpaceToHyphen(d)).style("opacity" , 1.00).style("stroke-width" , "3.0px");
					return;
				})
				.on("mouseout" , function(d,i){
					d3.selectAll(".graphLegend.trl_index").style("opacity" , 1.00);
					d3.selectAll(".line").style("opacity" ,1.00).style("stroke-width" , "2.5px");
					return;
				})
			
			indx.append('div')
				.attr('class', 'graphic')
				.append('svg')
				.attr('width', 30)
				.attr('height', 12)
				.append('line')
					.attr('class', SpaceToHyphen(d))
					.attr('x1', 0)
					.attr('x2', 30)
					.attr('y1', 9)
					.attr('y2', 9)
					.attr('stroke-width', 4);

			indx.append('div')
				.attr('class', function(){ return 'graphLegend name ' + SpaceToHyphen(d.substr(0, 1).toUpperCase() + d.substr(1, d.length)); })
				.style("width" , "160px")
				.html(function(){
					return (d.substr(0, 1).toUpperCase() + d.substr(1, d.length)) + "<span class='marketCap_value'></span>";
				})
				
		});
		
		return;
		
	}// end function drawGraphLegend();