function build_histogram(newdata) {
    // Meta stuff

    var width = 500;
    var height = 500;

    // Make the stacked histogram
    var formatDate = d3.timeFormat("%m/%y");
    var formatCount = d3.format(",.0f");

    var zoom = d3.zoom()
        .on("zoom", function() {
            svg.attr("transform", d3.event.transform);
        });

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var xAxis = d3.axisBottom(x)
        .tickFormat(formatDate);
    var yAxis = d3.axisLeft(y)
        .ticks(12);

    var svg = d3.select('#histogram')
        .append('svg')
            .attr('width',  width)
            .attr('height', height)
            .call(zoom)
            .call(responsivefy);

    // Prepare the data
    data = [];
    newdata.forEach(function(row) {
            if (row.year == 0) {
                // */*/* TODO
                row.resolution = '*/*/*';
                row.date = new Date(1, 1, 1);
                data.push(row);
            } else if (row.month == 0) {
                // Y/*/* TODO
                row.resolution = 'y/*/*';
                row.date = new Date(row.year, 1, 1);
                data.push(row);
            } else if (row.day == 0) {
                // Y/M/* TODO
                row.resolution = 'y/m/*';
                row.date = new Date(row.year, row.month, 1);
                data.push(row);
            } else {
                // Y/M/D
                row.resolution = 'y/m/d';
                row.date = new Date(row.year, row.month, row.day);
                data.push(row);
            }
        });
    //// Determine the date range
    var monthExtent = d3.extent(data, d => d.date);
    //// Create one bin per month
    var monthBins = d3.timeMonths(d3.timeMonth.offset(monthExtent[0], -1), d3.timeMonth.offset(monthExtent[1], 1));
    //// Create the histogram layout
    var binByMonth = d3.histogram()
        .value(d => d.created_date)
        .thresholds(monthBins);

    var dataGrouped = d3.nest()
        .key(d => d.resolution)
        .map(data, d3.map);

    var histDataByResolution = [];
    console.log(dataGrouped);
    dataGrouped.each(function(key, value) {
            var histData = binByMonth(value);
            histDataByResolution.push({
                resolution: key,
                values: histData
            });
        });

    var stack = d3.stack()
        .keys(dataGrouped.keys())
        .order(d3.stackOrderNone) // XXX
        .offset(d3.stackOffsetNone)
        .value(d => d.values);
    console.log(histDataByResolution);
    var stackedHistData = stack(histDataByResolution);
    console.log(stackedHistData);

    x.domain(d3.extent(monthBins));
    y.domain([0, d3.max(stackedHistData[stackedHistData.length - 1].values, d => d.y + d.y0)])

    var resolution = svg.selectAll('.resolution')
        .data(stackedHistData)
        .enter().append('g')
            .attr('class', 'resolution')
            .style('fill', d => color(d.resolution))
            .style('stroke', d => d3.rgb(color(d.resolution)).darker())
    resolution.selectAll('.bar')
        .data(d => d.values)
        .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.x))
            .attr('width', d => x(new Date(d.x0.getTime() + (d.x1-d.x0))) - x(d.x0) - 2)
            .attr('y', d => y(d.y0 - d.length))
            .attr('height', d => y(d.y0) - y(d.y0 + d.length));

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', ".71em")
            .style('text-anchor', 'end')
            .text('Number of Photos');

    // TODO: legend
}
