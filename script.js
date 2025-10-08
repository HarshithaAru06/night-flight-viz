// Load the CSV and create the chart
d3.csv("rides_per_hour.csv").then(function(data) {

  // Convert text to numbers
  data.forEach(d => {
    d.Hour = +d.Hour;
    d.Ride_Count = +d.Ride_Count;
  });

  // Set chart size
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Hour))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Ride_Count)])
    .nice()
    .range([height, 0]);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d => d + ":00"));

  svg.append("g").call(d3.axisLeft(y));

  // Line
  const line = d3.line()
    .x(d => x(d.Hour))
    .y(d => y(d.Ride_Count))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#005ea8")
    .attr("stroke-width", 3)
    .attr("d", line);

  // Points
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Hour))
    .attr("cy", d => y(d.Ride_Count))
    .attr("r", 4)
    .attr("fill", "#00a86b");

  // Labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Hour of Night (9 PM – 2 AM)");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Number of Rides");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text("Night Flight – Rides per Hour");
});
