function build_similarityprojection(data) {
    var width = 500;
    var height = 500;

    // Adapted from https://benclinkinbeard.com/d3tips/make-any-chart-responsive-with-one-function/?utm_content=buffer976d6&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer
    function responsivefy(svg) {
        const container = d3.select(svg.node().parentNode),
            width = parseInt(svg.style('width'), 10),
            height = parseInt(svg.style('height'), 10);

        svg.attr('viewBox', `0 0 ${width} ${height}`)
            //.attr('preserveAspectRatio', 'xMinYMid')
            .call(resize);

        d3.select(window).on(
            'resize.' + container.attr('id'),
            resize
        );

        function resize() {
            const w = parseInt(container.style('width'));
            const h = parseInt(container.style('height'));
            svg.attr('width', w);
            svg.attr('height', h);
        }
    }

    var similarityprojection_svg = d3.select("#similarity-projection")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(responsivefy)
        .append("g");

    let filtered_data = data.filter(d => !isNaN(Number(d["similarity x"])));

    let mx = Math.min(...filtered_data.map(d => Number(d['similarity x']))) - 50;
    let Mx = Math.max(...filtered_data.map(d => Number(d['similarity x']))) + 50;
    let my = Math.min(...filtered_data.map(d => Number(d['similarity y']))) - 50;
    let My = Math.max(...filtered_data.map(d => Number(d['similarity y']))) + 50;

    var x = d3.scaleLinear()
        .domain([mx, Mx])
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([my, My])
        .range([0, height]);

    var clip = similarityprojection_svg.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("SVG:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    // Scatter the images
    var imgs = similarityprojection_svg
        .append("g")
        //.attr("clip-path", "url(#clip)")
        .selectAll("dot")
        .data(filtered_data)
        .enter()
        .append("image")
            .attr("x", d => x(Number(d["similarity x"]))-50)
            .attr("y", d => x(Number(d["similarity y"]))-50)
            .attr("width", 100)
            .attr("height", 100)
            .attr("xlink:href", d => d["image"].src);

    var zoom = d3.zoom()
        //.scaleExtent([1, 100])
        .extent([[0, 0], [width, height]])
        .on("zoom", function() {
            let newX = d3.event.transform.rescaleX(x);
            let newY = d3.event.transform.rescaleY(y);

            similarityprojection_svg
                .selectAll("image")
                .attr('x', d => newX(Number(d['similarity x']))-50)
                .attr('y', d => newY(Number(d['similarity y']))-50);

            //similarityprojection_svg.attr("transform", d3.event.transform);
        });

    similarityprojection_svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);

    svgLoaded = true;
    console.log("SVG Loaded");

    function updateSimilarityProjectionImages(data) {
        // TODO
    }
}
