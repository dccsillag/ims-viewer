const CSV_TABLE = "table.csv"

const similarity_projection_diagonals = 2.420369946780824e-120;


// Adapted from https://benclinkinbeard.com/d3tips/make-any-chart-responsive-with-one-function/?utm_content=buffer976d6&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer
function responsivefy(svg) {
    const container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style('width'), 10),
        height = parseInt(svg.style('height'), 10);

    svg.call(resize);

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
