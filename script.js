let apiKey = 'e86b577642bfd672361e9cd14e542e3e'; 
let url = `http://localhost:3000/api/gdp`;

let data; // Diese Variable wird von der fetch-Antwort befüllt
let values = []; // Diese wird die gefilterten und geparsten Daten enthalten

let heightScale;
let xScale;
let xAxisScale;
let yAxisScale;

let width = 800;
let height = 600;
let padding = 40;

let svg = d3.select('svg');

let drawCanvas = () => {
    svg.attr('width', width);
    svg.attr('height', height);
};

let generateScales = () => {
    // Stellen Sie sicher, dass item.value als Zahl behandelt wird
    heightScale = d3.scaleLinear()
                    .domain([0, d3.max(values, (item) => {
                        return item.value; // item.value ist jetzt schon eine Zahl dank forEach im fetch-Block
                    })])
                    .range([0, height - (2 * padding)]);

    xScale = d3.scaleLinear()
                    .domain([0, values.length - 1])
                    .range([padding, width - padding]);

    let datesArray = values.map((item) => {
        return new Date(item.date);
    });

    xAxisScale = d3.scaleTime()
                    .domain([d3.min(datesArray), d3.max(datesArray)])
                    .range([padding, width - padding]);

    yAxisScale = d3.scaleLinear()
                    .domain([0, d3.max(values, (item) => {
                        return item.value; // item.value ist jetzt schon eine Zahl
                    })])
                    .range([height - padding, padding]);
};

let drawBars = () => {
    let tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip')
                    .style('visibility', 'hidden')
                    .style('width', 'auto')
                    .style('height', 'auto');

    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('width', (width - (2 * padding)) / values.length)
        .attr('data-date', (item) => {
            return item.date;
        })
        .attr('data-gdp', (item) => {
            return item.value;
        })
        .attr('height', (item) => {
            return heightScale(item.value); // item.value ist jetzt schon eine Zahl
        })
        .attr('x', (item, index) => {
            return xScale(index);
        })
        .attr('y', (item) => {
            return (height - padding) - heightScale(item.value); // item.value ist jetzt schon eine Zahl
        })
        .on('mouseover', (event, item) => { // Updated for d3.v5 event handling
            tooltip.transition()
                .style('visibility', 'visible');

            tooltip.html(`Date: ${item.date}<br>GDP: $${item.value} Billions`); // Formatted for better readability

            document.querySelector('#tooltip').setAttribute('data-date', item.date);
        })
        .on('mouseout', (event, item) => { // Updated for d3.v5 event handling
            tooltip.transition()
                .style('visibility', 'hidden');
        });      
};

let generateAxes = () => {
    let xAxis = d3.axisBottom(xAxisScale);
    let yAxis = d3.axisLeft(yAxisScale);

    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0, ' + (height - padding) + ')');

    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ', 0)');      
};

// --- Datenabruf mit fetch API ---
fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(apiData => { // Umbenennung von 'data' zu 'apiData', um Verwechslung zu vermeiden
        // FRED's JSON verwendet 'observations' als Schlüssel für die Daten
        // Filtern Sie fehlende Werte ('.' bedeutet N/A bei FRED)
        // Wandeln Sie den Wert explizit in eine Zahl um
        values = apiData.observations
            .filter(item => item.value !== '.')
            .map(item => ({
                date: item.date,
                value: parseFloat(item.value)
            }));

        console.log(values); // Zur Überprüfung, ob die Daten richtig ankommen

        drawCanvas();
        generateScales();
        drawBars();
        generateAxes();
    })
    .catch(error => {
        console.error('Es gab ein Problem beim Abrufen der Daten:', error);
        // Zeigen Sie eine Fehlermeldung auf dem Chart an
        d3.select("#canvas").append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "#17252A")
            .style("font-size", "16px")
            .text("Fehler beim Laden der Daten. Bitte API-Key oder Verbindung prüfen.");
    });