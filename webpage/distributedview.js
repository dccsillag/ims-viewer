function build_distributedview(data) {
    let filtered_data = data.filter(d => !isNaN(Number(d["distribution weight"])));
    let maximum_weight = Math.max(...data.map(d => d['distribution weight']));

    var proposed_width  = 500;
    var proposed_height = 500;

    var zoom = d3.zoom()
        .on("zoom", function() {
            svg_draw.attr("transform", d3.event.transform);
        });

    var svg = d3.select("#distributed-view")
        .append("svg")
        .attr("width", proposed_width)
        .attr("height", proposed_height)
        .call(zoom)
        .call(responsivefy);
    var container = d3.select(svg.node().parentNode);
    var width     = parseInt(container.style('width')),
        height    = parseInt(container.style('height'));
    var ratio     = height / width;
    var svg_draw = svg.append('g');

    console.log("Max Weight: " + maximum_weight);

    // Initialize the Image Cloud
    d3.layout.picturecloud().size([1000, ratio*1000])
        .pictures(filtered_data.map(d => ({url: d['image'].src, weight: 5e-6 * Math.pow(maximum_weight - d['distribution weight'] + 1, 4)})))
        //.pictures(filtered_data.map(d => ({url: d['image'].src, weight: 0.001*Math.exp(d['distribution weight'])})))
        .padding(0.1) // min distance between images
        .on('end', function(pictures, bounds, extent) {
                svg.attr('viewBox', [extent.left, extent.top, extent.right-extent.left, extent.bottom-extent.top]);

                svg_draw.selectAll('.picture')
                    .data(pictures)
                    .enter().append('image')
                        .attr('class', 'picture')
                        .attr('x', d => d.x-d.width/2)
                        .attr('y', d => d.y-d.height/2)
                        .attr('width', d => d.width)
                        .attr('height', d => d.height)
                        .attr('xlink:href', d => d.url);
            })
        .start();
}
