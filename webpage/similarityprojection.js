function build_similarityprojection(data) {
    let filtered_data = data.filter(d => !isNaN(Number(d["similarity x"])));

    let mx = Math.min(...filtered_data.map(d => Number(d['similarity x']))) - 50;
    let Mx = Math.max(...filtered_data.map(d => Number(d['similarity x']))) + 50;
    let my = Math.min(...filtered_data.map(d => Number(d['similarity y']))) - 50;
    let My = Math.max(...filtered_data.map(d => Number(d['similarity y']))) + 50;

    var width = 500;
    var height = 500;

    var zoom = d3.zoom()
        .on("zoom", function() {
            similarityprojection_svg.attr("transform", d3.event.transform);
        });

    var similarityprojection_svg = d3.select("#similarity-projection")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .call(responsivefy)
        .attr("viewBox", [mx-10, my-10, Mx-mx+20, My-my+20])
        .append("g");

    // Scatter the images
    var imgs = similarityprojection_svg
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
