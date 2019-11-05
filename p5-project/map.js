var myMap = L.map('map').setView([0, 0], 4);

var Wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
    minZoom: 1,
    maxZoom: 19
}).addTo(myMap);

clustermarkers = L.markerClusterGroup();

function addMarkers(data) {
    data.forEach(entry => clustermarkers.addLayer(L.marker([entry.latitude, entry.longitude]).bindPopup(
            "<img class=\"unselectable\" src=\"imgs/" + entry["file name"] + "\" width=\"400\" /><br class=\"unselectable\">" +
            "<br class=\"unselectable\">" +
            "<span class=\"unselectable\"> <b>Title:</b> </span><i>" + entry.title + "</i><br class=\"unselectable\">" +
            "<span class=\"unselectable\"> <b>Author:</b> </span>" + entry.author + "<br class=\"unselectable\">" +
            "<span class=\"unselectable\"> <b>Time of image:</b> </span>" + entry['time of image'] + "<br class=\"unselectable\">" +
            "<span class=\"unselectable\"> <b>Location:</b> </span>" + entry['location string'],
            { maxWidth: 'auto' }
        )));
}

function mapUpdateFilters(data) {
    clustermarkers.clearLayers();
    addMarkers(data);
}


d3.csv(CSV_TABLE).then(addMarkers);
myMap.addLayer(clustermarkers);
