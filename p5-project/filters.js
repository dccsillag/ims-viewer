function updateFilters() {
    d3.csv(CSV_TABLE).then(function(data) {
            var anonimos_checked = document.getElementById('Anonimos').checked;
            var farkas_checked = document.getElementById('Farkas').checked;
            var ferrez_checked = document.getElementById('Ferrez').checked;
            var maureen_checked = document.getElementById('Maureen').checked;
            var medeiros_checked = document.getElementById('Medeiros').checked;

            var filteredData = data.filter(function(entry) {
                var output = true;

                output = output && !(!anonimos_checked && entry['author'] === "Anônimo"); // Consider "Anonimos" filter
                output = output && !(!farkas_checked   && entry['author'] === "Farkas, Thomaz"); // Consider "Farkas" filter
                output = output && !(!ferrez_checked   && entry['author'] === "Ferrez, Marc"); // Consider "Ferrez" filter
                output = output && !(!maureen_checked  && entry['author'] === "Bisilliat, Maureen"); // Consider "Maureen" filter
                output = output && !(!medeiros_checked && entry['author'] === "Medeiros, José"); // Consider "Medeiros" filter

                return output;
            });

            // update all views
            mapUpdateFilters(filteredData);
        });
}
