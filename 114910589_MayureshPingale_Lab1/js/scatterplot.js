var dataCsv = d3.csv("data/processed-final.csv", function(data){    
    d3.select(".toggleButtonDiv").style("opacity", 0);

    var xAxisVariable = "accommodates";
    var yAxisVariable = "bathrooms";
    var radioButtonActive = "x";

    var widthContainer = 500;
    var heightContainer = 500;
    var spacing = 200;

    var numericalVaribles = ["accommodates", "bathrooms", "bedrooms", "price", "minimum_nights", "number_of_reviews", "review_scores_rating", "review_scores_cleanliness", "review_scores_location"];
    var categoricalVariable = ["property_type", "host_response_time", "room_type", "bed_type", "cancellation_policy", "zipcode", "neighbourhood_group_cleansed"];

    var isXAxisCat = false;
    var isYAxisCat = false;
    
    var allGroup = numericalVaribles.concat( categoricalVariable);

    d3.select(".dropdownOption")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });


    var radioDiv = d3.select(".radioButtonDiv");

    radioDiv
        .append("text")
        .text("X-axis")
        .append("input")
        .attr("type" , "radio")
        .attr("checked", "checked")
        .attr("name", "radioButton")
        .attr("value", "x");
    
    radioDiv
        .append("text")
        .text("Y-axis")
        .style("margin-left", "40px")
        .append("input")
        .attr("type" , "radio")
        .attr("name", "radioButton")
        .attr("value", "y");
    
    var svg = d3.select("body")
        .append("svg")
        .attr("class","bar-chart")
        .attr("width", widthContainer)
        .attr("height", heightContainer)
        .append("g")
            .attr("transform", "translate(" + spacing/2 + "," + spacing/2 + ")");

    function updateGraph() {
        svg.selectAll("*").remove();

        if(xAxisVariable.length > 0 && yAxisVariable.length > 0) {

            var data1 = [];
            var data2 = [];
            var xScale;
            var yScale;

            if(categoricalVariable.includes(xAxisVariable)) {
                isXAxisCat = true;

                var xdataGrouped = d3.nest() 
                .key(function (d) { return d[xAxisVariable]; }) 
                .entries(data); 
                
                console.log(xdataGrouped);
                xScale = d3.scaleBand()
                    .domain(xdataGrouped.map(function(d) { return d.key; }))
                    .range([0, widthContainer - spacing])
                    .padding(0.2);

            }
            else {
                data1 = data.map(function(i) {return parseInt(i[xAxisVariable]) || 0;})

                isXAxisCat = false;
                xScale = d3.scaleLinear()
                    .domain([0, d3.max(data1)])
                    .range([0, widthContainer - spacing]);
                
            }


            if(categoricalVariable.includes(yAxisVariable)) {
                isYAxisCat = true;
                
                var ydataGrouped = d3.nest() 
                .key(function (d) { return d[yAxisVariable]; }) 
                .entries(data); 
                
                yScale = d3.scaleBand()
                    .domain(ydataGrouped.map(function(d) { return d.key; }))
                    .range([0, heightContainer - spacing])
                    .padding(0.2);

            }
            else {
                isYAxisCat = false;
                data2 = data.map(function(i) {return parseInt(i[yAxisVariable]) || 0;})

                yScale = d3.scaleLinear()
                    .domain([0, d3.max(data2)])
                    .range([heightContainer - spacing, 0]);

            }

            d3.select(".title").text(yAxisVariable+ " vs " + xAxisVariable);


            if(isXAxisCat && isYAxisCat) {
                svg.append("g")
                            .selectAll("dot")
                            .data(data)
                            .enter()
                                .append("circle")
                                .attr("cx", function(d, i) { return 5 + xScale(d[xAxisVariable]) + xScale.bandwidth() / 2 + Math.random()*30})
                                .attr("cy", function(d, i) { return -5 + yScale(d[yAxisVariable]) + yScale.bandwidth() / 2 + Math.random()*30})
                                .attr("r", 5)
                                .style("fill", "#192E47");
                
            }
            else{
                svg.append("g")
                            .selectAll("dot")
                            .data(data)
                            .enter()
                                .append("circle")
                                .attr("cx", function(d, i) { return !isXAxisCat ? 5 + xScale(data1[i]) : 5+  xScale(d[xAxisVariable]) + xScale.bandwidth() / 2})
                                .attr("cy", function(d, i) { return !isYAxisCat ?  -5 + yScale(data2[i]):  -5+ yScale(d[yAxisVariable]) + yScale.bandwidth() / 2})
                                .attr("r", 5)
                                .style("fill", "#192E47");

            }

            if(isXAxisCat) {

                svg.append("g")
                .attr("transform", "translate(0," + (heightContainer - spacing) + ")")
                .call(d3.axisBottom(xScale))
                    .selectAll("text")
                        .attr("transform", "translate(-10,0)rotate(-45)")
                        .style("text-anchor", "end");

            }
            else{
            svg.append("g")
                    .attr("transform", "translate(0," + (heightContainer - spacing) + ")")
                    .call(d3.axisBottom(xScale));

            }
            svg.append("g")
                    .call(d3.axisLeft(yScale));

        

            svg.append("text")
                    .attr("transform", "translate(" + ((widthContainer-spacing) / 2) + " ," + (heightContainer - spacing/2 - 20) + ")")
                    .attr("class", "axis-label")
                    .text(xAxisVariable);


            svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - spacing/2)
                    .attr("x",0 - ((heightContainer- spacing) / 2))
                    .attr("dy", "0.7em")
                    .attr("class", "axis-label")
                    .text(yAxisVariable);
        }

    }

    d3.select(".dropdownOption").on("change", function(d) {
        var selectedOption = d3.select(this).property("value");

        if(radioButtonActive){
            if(radioButtonActive == 'x') {
                xAxisVariable = selectedOption;
            }
            else{
                yAxisVariable = selectedOption;
            }

            updateGraph();
        }        
    });

    updateGraph();

    function changeAxis() {
        if(this.value) {
            if(this.value == 'x') {
                radioButtonActive = 'x'; 
            }
            else {
                radioButtonActive = 'y';
            }
        }
    }
        
    radioDiv.selectAll("input").on("change", changeAxis);
})
