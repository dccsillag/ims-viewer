function build_histogram(data) {
    var formatDate = d3.timeFormat("%Y");
    var formatCount = d3.format(",.0f");

    var margin = { top: 10, right: 30, bottom: 30, left: 50 };
    var width  = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    //var xAxis = d3.svg.axis()/*.scale(x)*/.orient('bottom').tickFormat(formatDate);
    //var yAxis = d3.svg.axis()/*.scale(y)*/.orient('left').ticks(6);
    var xAxis = d3.axisBottom().tickFormat(formatDate);
    var yAxis = d3.axisLeft().ticks(6);

    var svg = d3.select("#histogram")
        .append("svg")
        .append("g");

    /*
    d3.csv("test.csv")
        .then(function(data) {
            // Treat the data
            let histogramData = [];
            data.forEach(function(row, i) {
                let parts = row['time of image'].split("/").map(parseInt);
                if (parts.length === 3) {
                    histogramData.push({
                        date: new Date(parts[2], parts[1], parts[0]),
                        index: i
                    });
                } else if (parts.length === 2) {
                    histogramData.push({
                        date: new Date(parts[1], parts[0]),
                        index: i
                    });
                } else if (parts.length === 1) {
                    histogramData.push({
                        date: new Date(parts[0], 0),
                        index: i
                    });
                }
            });

            var monthExtent = d3.extent(histogramData);
            var monthBins   = d3.time.months(d3.time.month.offset(monthExtent[0], -1),
                                             d3.time.month.offset(monthExtent[1],  1));

            var binByMonth = d3.layout.histogram()
                .bins(monthBins);

            var histData = binByMonth(histogramData);

            svg.selectAll(".bar")
                .data(histData)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.x); })
                .attr("width", function(d) { return x(new Date(d.x.getTime() + d.dx))-x(d.x)-1; })
                .attr("y", function(d) { return y(d.y); })
                .attr("height", function(d) { return height - y(d.y); });

            // Add the X Axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            // Add the Y Axis and label
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Number of Sightings");
        });
        */
}
