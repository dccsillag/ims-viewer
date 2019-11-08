var width = 500;
var height = 500;

// Taken from https://benclinkinbeard.com/d3tips/make-any-chart-responsive-with-one-function/?utm_content=buffer976d6&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer
function responsivefy_keep_aspectratio(svg) {
    // container will be the DOM element
    // that the svg is appended to
    // we then measure the container
    // and find its aspect ratio
    const container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style('width'), 10),
        height = parseInt(svg.style('height'), 10),
        aspect = width / height;

    // set viewBox attribute to the initial size
    // control scaling with preserveAspectRatio
    // resize svg on inital page load
    svg.attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMinYMid')
        .call(resize);

    // add a listener so the chart will be resized
    // when the window resizes
    // multiple listeners for the same event type
    // requires a namespace, i.e., 'click.foo'
    // api docs: https://goo.gl/F3ZCFr
    d3.select(window).on(
        'resize.' + container.attr('id'),
        resize
    );

    // this is the code that resizes the chart
    // it will be called on load
    // and in response to window resizes
    // gets the width of the container
    // and resizes the svg to fill it
    // while maintaining a consistent aspect ratio
    function resize() {
        const w = parseInt(container.style('width'));
        svg.attr('width', w);
        svg.attr('height', Math.round(w / aspect));
    }
}

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

function mapRange(x, a, b, c, d) {
    return (d-c)*(x-a)/(b-a) + c;
}

function addSimilarityProjectionImages(data) {
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
    similarityprojection_svg
        .append("g")
        //.attr("clip-path", "url(#clip)")
        .selectAll("dot")
        .data(filtered_data)
        .enter()
        .append("circle")
            .attr("cx", d => mapRange(Number(d["similarity x"]), mx, Mx, 0, width))
            .attr("cy", d => mapRange(Number(d["similarity y"]), my, My, 0, height))
            .attr("r", 1.5)
            .style("fill", "#ff0000")
            .style("opacity", 0.5);

    var zoom = d3.zoom()
        .scaleExtent([1, 50])
        .extent([[0, 0], [width, height]])
        .on("zoom", function() {
            let newX = d3.event.transform.rescaleX(x);
            let newY = d3.event.transform.rescaleY(y);

            similarityprojection_svg
                .selectAll("circle")
                .attr('cx', d => newX(Number(d['similarity x'])))
                .attr('cy', d => newY(Number(d['similarity y'])));
            //similarityprojection_svg.attr("transform", d3.event.transform);
        });

    similarityprojection_svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);
}

function updateSimilarityProjectionImages(data) {
    // TODO
}

d3.csv(CSV_TABLE).then(addSimilarityProjectionImages)
