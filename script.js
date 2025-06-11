const csvUrl = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv';

const svg = d3.select('#canvas');
const width = 800;
const height = 600;
const margin = { top: 40, right: 30, bottom: 50, left: 60 };

svg.attr('width', width).attr('height', height);

const tooltip = d3.select('#tooltip');

d3.csv(csvUrl, d3.autoType)
  .then(data => {
    console.log('Daten geladen:', data);
    data = data.filter(d => d.Nitrogen != null && !isNaN(d.Nitrogen));

    const x = d3.scaleBand()
      .domain(data.map(d => d.group))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Nitrogen)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.group))
      .attr('y', d => y(d.Nitrogen))
      .attr('width', x.bandwidth())
      .attr('height', d => y(0) - y(d.Nitrogen))
      .on('mouseover', (event, d) => {
        tooltip.style('visibility', 'visible')
          .html(`Pflanze: ${d.group}<br>Nitrogen: ${d.Nitrogen}`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => tooltip.style('visibility', 'hidden'));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '24px')
      .text('Beispiel Bar Chart – Nitrogen-Werte pro Pflanze');
  })
  .catch(err => {
    console.error('Fehler beim Laden der CSV:', err);
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .text('Fehler beim Laden der CSV-Daten');
  });
