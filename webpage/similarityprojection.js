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

    var zoom = d3.zoom()
        .on("zoom", function() {
            similarityprojection_svg.attr("transform", d3.event.transform);
        });

    var similarityprojection_svg = d3.select("#similarity-projection")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(responsivefy)
        .call(zoom)
        .append("g");

    let filtered_data = data.filter(d => !isNaN(Number(d["similarity x"])));

    let mx = Math.min(...filtered_data.map(d => Number(d['similarity x']))) - 50;
    let Mx = Math.max(...filtered_data.map(d => Number(d['similarity x']))) + 50;
    let my = Math.min(...filtered_data.map(d => Number(d['similarity y']))) - 50;
    let My = Math.max(...filtered_data.map(d => Number(d['similarity y']))) + 50;

    // Scatter the images
    var imgs = similarityprojection_svg
        .attr("viewBox", [mx-10, my-10, Mx-mx+20, My-my+20])
        .append("g")
        .selectAll("dot")
        .data(filtered_data)
        .enter()
        .append("image")
            .attr("x", d => Number(d["similarity x"]))
            .attr("y", d => Number(d["similarity y"]))
            .attr("width", d => d["similarity width"])
            .attr("height", d => d["similarity height"])
            .attr("xlink:href", d => d["image"].src);

    svgLoaded = true;
    console.log("SVG Loaded");

    function updateSimilarityProjectionImages(data) {
        // TODO
    }
}
