d3.csv("data/processed-final.csv", function(data){
    d3.select(".toggleButtonDiv").style("opacity", 1);

    var margin = {top: 50, right: 20, bottom: 120, left: 120};
    var widthContainer = 500, heightContainer = 500;
    
    var categoricalVariable = "property_type";

    var svg = d3.select("body")
                    .append("svg")
                    .attr("class","bar-chart")
                    .attr("width", widthContainer)
                    .attr("height", heightContainer)
                    .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

    
    var allGroup = ["property_type", "host_response_time", "room_type", "bed_type", "cancellation_policy", "zipcode", "neighbourhood_group_cleansed"]

    d3.select(".dropdownOption")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })


    function checkboxUpdate() {

        var tooltip = d3.select("body")
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "1px")
                    .style("border-radius", "5px")
                    .style("padding", "10px");

                    
        d3.select(".title").text("Bar chart of " + categoricalVariable);
    
        var countUnique = d3.nest()
            .key(function(d) { return d[categoricalVariable];})
            .rollup(function(v) { return v.length; })
            .entries(data);

        d3.selectAll(".checkbox").each(function(d){
            cb = d3.select(this);
            grp = cb.property("value")
    
            if(cb.property("checked")){

                svg.selectAll("*").remove();
                                
                var yScale = d3.scaleBand()
                    .range([0, heightContainer - margin.top - margin.bottom])
                    .domain(countUnique.map(function(d) { return d.key; }))
                    .padding(0.2); 
    
                var xScale = d3.scaleLinear()
                    .domain([0, d3.max(countUnique, function(i) {return i.value})])
                    .range([0, widthContainer - margin.left - margin.right]);

    
                svg.selectAll("rect")
                    .data(countUnique)
                    .enter()
                        .append("rect")
                        .attr("x", function(d) { return xScale(0)})
                        .attr("y", function(d) { return yScale(d.key)})
                        .style("fill", "#192E47")
                        .attr("height", yScale.bandwidth())
                        .attr("width", function(d) { return xScale(d.value); })
        
    
                svg.append("g")
                .attr("transform", "translate(0," + (heightContainer - margin.top - margin.bottom) + ")")
                .call(d3.axisBottom(xScale))
    
                svg.append("g").call(d3.axisLeft(yScale));

                
                svg.append("text")
                    .attr("transform", "translate(" + ((widthContainer-margin.left- margin.right) / 2) + " ," + (heightContainer - margin.bottom) + ")")
                    .attr("class", "axis-label")
                    .text("Frequency");

                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left)
                    .attr("x",0 - ((heightContainer- margin.top-margin.bottom) / 2))
                    .attr("dy", "1em")
                    .attr("class", "axis-label")
                    .text(categoricalVariable);

            }else{

                svg.selectAll("*").remove();

                var xScale = d3.scaleBand()
                                .range([ 0, widthContainer - margin.left - margin.right ])
                                .domain(countUnique.map(function(d) { return d.key; }))
                                .padding(0.2); 

                var yScale = d3.scaleLinear()
                                .domain([0, d3.max(countUnique, function(i) {return i.value})])
                                .range([heightContainer - margin.top - margin.bottom,0]);
                
                var bars = svg.selectAll("rect")
                                .data(countUnique)
                                .enter()
                                    .append("rect")
                                    .attr("x", function(d) { return xScale(d.key); })
                                    .attr("y", function(d) { return yScale(d.value)})
                                    .style("fill", "#192E47")
                                    .attr("width", xScale.bandwidth())
                                    .attr("height", function(d) { return heightContainer - margin.top -margin.bottom - yScale(d.value); })
                                
                    
                svg.append("g")
                    .attr("transform", "translate(0," + (heightContainer - margin.top - margin.bottom) + ")")
                    .call(d3.axisBottom(xScale))
                    .selectAll("text")
                        .attr("transform", "translate(-10,0)rotate(-45)")
                        .style("text-anchor", "end");

    
                svg.append("g").call(d3.axisLeft(yScale));

                svg.append("text")
                    .attr("transform", "translate(" + ((widthContainer-margin.left- margin.right) / 2) + " ," + (heightContainer - margin.bottom + 35) + ")")
                    .attr("class", "axis-label")
                    .text(categoricalVariable);

                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left)
                    .attr("x",0 - ((heightContainer- margin.top-margin.bottom) / 2))
                    .attr("dy", "2.5em")
                    .attr("class", "axis-label")
                    .text("Frequency");
            }
          })

    }
    
    d3.selectAll(".checkbox").on("change",checkboxUpdate);

    d3.select(".dropdownOption").on("change", function(d) {
        var selectedOption = d3.select(this).property("value")
        categoricalVariable = selectedOption;
        checkboxUpdate();
    });

    // Initializion
    checkboxUpdate();
});

