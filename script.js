// Load the cleaned dataset
d3.csv("cleaned_nightflight_data.csv").then(function(data) {
  // Convert Hour to number
  data.forEach(d => {
    d.Hour = +d.Hour;
  });

  // Aggregate ride counts per hour
  const ridesPerHour = d3.rollups(
    data,
    v => v.length,   // count how many rides per hour
    d => d.Hour
  ).map(([Hour, Count]) => ({ Hour, Count }));

  // SVG setup
  const svg = d3.select("svg");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 50, right: 40, bottom: 60, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleBand()
    .domain(ridesPerHour.map(d => d.Hour))
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(ridesPerHour, d => d.Count)])
    .nice()
    .range([chartHeight, 0]);

  // Axes
  chart.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).tickFormat(d => `${d}:00`));

  chart.append("g").call(d3.axisLeft(y));

  // Bars
  chart.selectAll(".bar")
    .data(ridesPerHour)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.Hour))
    .attr("y", d => y(d.Count))
    .attr("width", x.bandwidth())
    .attr("height", d => chartHeight - y(d.Count))
    .attr("fill", "#007a33");

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "6px 10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("font-size", "12px")
    .style("display", "none");

  svg.selectAll(".bar")
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block")
        .html(`<strong>${d.Hour}:00</strong><br/>Rides: ${d.Count}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("top", event.pageY - 30 + "px")
             .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", () => tooltip.style("display", "none"));

  // Chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("fill", "#007a33")
    .text("Night Flight — Rides per Hour");
});
