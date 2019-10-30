function updateFilters() {
    d3.csv(CSV_TABLE).then(function(data) {
            var medeiros_checked = document.getElementById('Medeiros').checked;

            var filteredData = data.filter(function(entry) {
                var output = true;

                output = output && !(!medeiros_checked && entry['author'] === "Medeiros, José"); // Consider "Medeiros" filter
                // TODO: other filters

                return output;
            });

            // update all views
            mapUpdateFilters(filteredData);
        });
}
