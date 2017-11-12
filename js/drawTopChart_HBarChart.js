
	function drawTopChart(){
		
		var margin = { top: 10, right: 10, bottom: 10, left: 15 };
		var width = 200;
		var height = 375;
		
		d3.csv(vis.config.vars.dataFile2, type, function(error, data){
			  if (error) throw error;
			
			  vis.compare = data.columns.slice(1).map(function(id) {
				  
					return {
							id: id,
							values: data.map(function(d) {
								return { category: d.Category, currencyData: +d[id] };
							})
					};
			  });
		
			var svg = d3.select("svg");
			var tooltip = d3.select("body").append("div").attr("class", "toolTip");
		
			var x = d3.scaleLinear().range([0, width]);
			var y = d3.scaleBand().range([height, 0]);
			
			vis.g7 = svg.append("g")
				.attr("class" , "trl_graphTop")
				.attr("id" , "trl_graphTop")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
			vis.compare.sort(function(a, b) { return a.value - b.value; });
			x.domain([0, d3.max(vis.compare[0].values, function(d) { return d.currencyData; })]);
			y.domain(vis.compare[0].values.map(function(d) { return d.category; })).padding(0.1);
		
			vis.g7.append("g")
				.attr("class", "x axis")
				.attr("id", "xAxis")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));
									
			// draw tick grid lines extending from y-axis ticks on axis across scatter graph
			var xticks = vis.g7.selectAll('.x.axis').selectAll('.tick');					 
			xticks.append('svg:line')
				.attr( 'class' , "xAxis_Ticks" )
				.attr( 'y0' , 0 )
				.attr( 'y1' , -height )
				.attr( 'x1' , 0 )
				.attr( 'x2',  0 )
				.style("opacity" , 1.00)
				.style("pointer-events" , "none")
				.style("display" , "inline")
				.style("stroke-width" , "10px");
		
			vis.g7.selectAll(".bar")
				.data(vis.compare[0].values)
				.enter()
				.append("rect")
				.attr("class", "bar")
				.attr("x", 0)
				.attr("height", y.bandwidth())
				.attr("y", function(d) { return y(d.category); })
				.attr("width", function(d){ return x(d.currencyData); })
				
			vis.g7.append("g")
				.attr("class", "y axis")
				.attr("id", "yAxis")
				.call(d3.axisLeft(y));
			
			vis.g7.selectAll('#yAxis').selectAll('.tick')
				.selectAll("text")
				.attr("transform", "translate(15,0)")
				.style("text-anchor" , "start")
				.style("font-weight" , 500)
				.style("fill" , "#4D4D4D")
				.text(function(d,i){
					var lbl = d;
					var suffix = '';
					vis.compare[0].values.forEach(function(d,i){
						var cat = d.category;
						var value = d.currencyData;
						if ( lbl === cat ) { suffix = " ($" + d.currencyData.toFixed(2) + " Trillion)"; }
					})
					return d + suffix;
				});
		
		});	
		
		return;
		
	}// end function drawTopChart()
	

	
	function type(d, _, columns) {
		for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
		return d;
	} 