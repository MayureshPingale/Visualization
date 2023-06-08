d3.csv("data/processed-final.csv", function(data){
    d3.select(".toggleButtonDiv").style("opacity", 1);

    var variable = "accommodates";

    var margin = {top: 20, right: 20, bottom: 55, left: 55};
    var widthContainer = 500, heightContainer = 500;

    var svg = d3.select("body")
            .append("svg")
            .attr("class","bar-chart")
            .attr("width", widthContainer)
            .attr("height", heightContainer)
            .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

    var allGroup = ["accommodates", "bathrooms", "bedrooms", "price", "minimum_nights", "number_of_reviews", "review_scores_rating", "review_scores_cleanliness", "review_scores_location"];
    d3.select(".dropdownOption")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; })

    function checkboxUpdate() {
        var map = data.map(function(i) {return parseInt(i[variable]) || 0;})
        d3.select(".title").text("Histogram: " + variable);

        d3.selectAll(".checkbox").each(function(d){
            cb = d3.select(this);
            grp = cb.property("value");;

            if(cb.property("checked")){
                svg.selectAll("*").remove();

                var yScale = d3.scaleLinear()
                .domain([0, d3.max(map)]) 
                .range([heightContainer - margin.top - margin.bottom, 0]);

                var histogram = d3.histogram()
                                    .domain(yScale.domain())
                                    .value(function(d) {return d})
                                    .thresholds(yScale.ticks(7));

                var bins = histogram(map);

                var xScale = d3.scaleLinear()
                                .domain([0, d3.max(bins, function(d) { return d.length; })])
                                .range([0,widthContainer - margin.left - margin.right]);

                svg.append("g")
                    .attr("transform", "translate(0," + (heightContainer - margin.top - margin.bottom) + ")")
                    .call(d3.axisBottom(xScale));

                svg.append("g")
                    .call(d3.axisLeft(yScale));

                svg.selectAll("rect")
                    .data(bins)
                    .enter()
                    .append("rect")
                        .attr("y", function(d) { return yScale(d.x1)})
                        .attr("height", function(d) { return  - yScale(d.x1) + yScale(d.x0) -2 ; })
                        .attr("width", function(d) { return xScale(d.length); })
                        .style("fill", "#192E47");
                
                svg.append("text")
                    .attr("transform", "translate(" + ((widthContainer-margin.left- margin.right) / 2) + " ," + (heightContainer - margin.top -3) + ")")
                    .attr("class", "axis-label")
                    .text("Frequency");

                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left)
                    .attr("x",0 - ((heightContainer- margin.top-margin.bottom) / 2))
                    .attr("dy", "1em")
                    .attr("class", "axis-label")
                    .text(variable);
            }
            else{
                svg.selectAll("*").remove();

                var x = d3.scaleLinear()
                .domain([0, d3.max(map)]) 
                .range([0, widthContainer - margin.left - margin.right]);

                var histogram = d3.histogram()
                                    .domain(x.domain())
                                    .value(function(d) {return d})
                                    .thresholds(x.ticks(7));
        
                var bins = histogram(map);
        
                var y = d3.scaleLinear()
                        .domain([0, d3.max(bins, function(d) { return d.length; })])
                        .range([heightContainer - margin.top - margin.bottom,0 ]);
            
                svg.append("g")
                    .attr("transform", "translate(0," + (heightContainer - margin.top - margin.bottom) + ")")
                    .call(d3.axisBottom(x));
        
                svg.append("g")
                    .call(d3.axisLeft(y));
            
        
                svg.selectAll("rect")
                    .data(bins)
                    .enter()
                    .append("rect")
                    .attr("x", 1)
                    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                    .attr("width", function(d) { return x(d.x1) - x(d.x0) -2 ; })
                    .attr("height", function(d) { return heightContainer - margin.top - margin.bottom - y(d.length); })
                    .style("fill", "#192E47");
                
                svg.append("text")
                    .attr("transform", "translate(" + ((widthContainer-margin.left- margin.right) / 2) + " ," + (heightContainer - margin.top -3) + ")")
                    .attr("class", "axis-label")
                    .text(variable);
        
                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left)
                    .attr("x",0 - ((heightContainer- margin.top-margin.bottom) / 2))
                    .attr("dy", "1em")
                    .attr("class", "axis-label")
                    .text("Frequency");

            }
        })
    }

    d3.selectAll(".checkbox").on("change",checkboxUpdate);

    d3.select(".dropdownOption").on("change", function(d) {
        var selectedOption = d3.select(this).property("value");
        variable = selectedOption;
        checkboxUpdate();
    });
    
    checkboxUpdate();
});