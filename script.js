d3.csv("rides_per_hour.csv").then(function (data) {
  // Convert text to numbers and adjust 0–2 hours to 24–26
  data.forEach(d => {
    d.Hour = +d.Hour;
    if (d.Hour === 0) d.Hour = 24;
    if (d.Hour === 1) d.Hour = 25;
    if (d.Hour === 2) d.Hour = 26;
    d.Ride_Count = +d.Ride_Count;
  });

  // Chart dimensions
  const margin = { top: 60, right: 40, bottom: 70, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // SVG setup
  const svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear()
    .domain([21, 26]) // 9 PM–2 AM
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Ride_Count) + 5])
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
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "13px");

  // Y-axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "13px");

  // Tooltip setup
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "8px 10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "8px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font-size", "13px");

  // Line generator
  const line = d3.line()
    .x(d => x(d.Hour))
    .y(d => y(d.Ride_Count))
    .curve(d3.curveCatmullRom.alpha(0.5));

  // Line path with animation
  const path = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#007844")
    .attr("stroke-width", 3)
    .attr("d", line);

  const totalLength = path.node().getTotalLength();

  path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(1500)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  // Circles (data points)
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Hour))
    .attr("cy", d => y(d.Ride_Count))
    .attr("r", 5)
    .attr("fill", "#00A86B")
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(
        `<strong>${d.Hour <= 24 ? (d.Hour - 12) + " PM" : (d.Hour - 24) + " AM"}</strong><br/>Rides: <b>${d.Ride_Count}</b>`
      )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 30 + "px");
      d3.select(this).attr("fill", "#005E35").attr("r", 8);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(300).style("opacity", 0);
      d3.select(this).attr("fill", "#00A86B").attr("r", 5);
    });

  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Hour of Night (9 PM – 2 AM)");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Number of Rides");

  // Chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -25)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text("Night Flight — Interactive Ride Trend");
});
