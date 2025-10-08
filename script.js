// Load the CSV and create the chart
d3.csv("rides_per_hour.csv").then(function(data) {

  // Convert text to numbers
  data.forEach(d => {
    d.Hour = +d.Hour;
    d.Ride_Count = +d.Ride_Count;
  });

  // Set chart size
  const margin = { top: 50, right: 30, bottom: 60, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X-axis scale (hours)
  const x = d3.scaleLinear()
    .domain([21, 26]) // 21 = 9PM, 26 = 2AM
    .range([0, width]);

  // Y-axis scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Ride_Count)])
    .nice()
    .range([height, 0]);

  // X-axis
  const xAxis = d3.axisBottom(x)
    .tickValues([21, 22, 23, 24, 25, 26])
    .tickFormat(d => {
      if (d === 24) return "12 AM";
      if (d === 25) return "1 AM";
      if (d === 26) return "2 AM";
      return `${d - 12} PM`;
    });

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  // Y-axis
  svg.append("g").call(d3.axisLeft(y));

  // Line generator
  const line = d3.line()
    .x(d => x(d.Hour))
    .y(d => y(d.Ride_Count))
    .curve(d3.curveMonotoneX);

  // Draw line
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#007844")
    .attr("stroke-width", 3)
    .attr("d", line);

  // Dots
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Hour))
    .attr("cy", d => y(d.Ride_Count))
    .attr("r", 5)
    .attr("fill", "#00A86B");

  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Hour of Night (9 PM – 2 AM)");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Number of Rides");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Night Flight — Rides per Hour");
});
