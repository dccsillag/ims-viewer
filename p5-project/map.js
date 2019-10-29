d3.csv("test.csv")
    .then(function(data) {
        var myMap = L.map('map').setView([0, 0], 4);

        var Wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
            attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
            minZoom: 1,
            maxZoom: 19
        }).addTo(myMap);

        // Add the markers
        var markers = []
        data.forEach(entry => markers.push(L.marker([entry.latitude, entry.longitude]).addTo(myMap).bindPopup(
                //"<img class=\"previewimg\" src=\"imgs/" + entry["file name"] + "\"><br>" +
                "<img src=\"imgs/" + entry["file name"] + "\" width=\"400\" /><br>" +
                "<br>" +
                "<b>Title:</b> <i>" + entry.title + "</i><br>" +
                "<b>Author:</b> " + entry.author + "<br>" +
                "<b>Time of image:</b> " + entry['time of image'],
                { maxWidth: 'auto' }
            )));
    });
