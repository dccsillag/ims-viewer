var preloadedImageCounter = 0;

d3.csv(CSV_TABLE).then(function(data) {
    var row;
    for (var i = 0; i < data.length; i++) {
        row = data[i];

        row.image = new Image();
        row.image.onload = function() {
            preloadedImageCounter++;

            document.getElementById("loading").innerHTML = `Loading... [${preloadedImageCounter} / ${data.length}]`;
            console.log(`Loading... [${preloadedImageCounter} / ${data.length}]`)

            if (preloadedImageCounter === data.length) {
                console.log("All images were preloaded!");

                document.getElementById("contents").style.display = 'flex';
                document.getElementById("loading").style.display = 'none';

                build_map(data);                    // DONE
                build_histogram(data);              // TODO
                build_discretehistogram(data);      // TODO
                build_similarityprojection(data);   // DONE
                build_distributedview(data);        // TODO (WIP)
            }
        };
        row.image.src = "imgs/" + row['file name'];

        data[i] = row;
    }
});
