// === CONSTANTS ===

// load the data

/*
histogramData = [];
var table = d3.csv(csv_path).then(function(data) {
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
});

// make the bins

let bins = [];
//table.forEach(entry => bins.push(entry.));

// Make the histogram

d3.select("#histogram")
    .data(bins)
    .enter().append("div")
    .style("width", function(d) { return d * 10 + "px"; })
    .text(function (d) { return d; })
    ;
    */
