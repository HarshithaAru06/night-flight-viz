// Load and visualize the cleaned Night Flight dataset
d3.csv("cleaned_nightflight_data.csv").then(function(data) {

  // Convert hour to a number
  data.forEach(d => { d.Hour = +d.Hour; });

  // ---------------------------
  // CHART 1: Rides per Hour (9 PM – 2 AM)
  // ---------------------------

  const filteredData = data.filter(d => d.Hour >= 21 || d.Hour <= 2);

  // Aggregate by hour
  const ridesPerHour = d3.rollups(
    filteredData,
    v => v.length,
    d => d.Hour
  ).map(([Hour, Count]) => ({ Hour, Count }))
   .sort((a, b) => a.Hour - b.Hour);

  const svg1 = d3.select("body")
    .append("svg")
    .attr("width", 800)
    .attr("height", 500);

  const width1 = 800, height1 = 500;
  const margin1 = { top: 60, right: 40, bottom: 60, left: 80 };
  const chart1 = svg1.append("g")
    .attr("transform", `translate(${margin1.left},${margin1.top})`);

  const x1 = d3.scaleBand()
    .domain(ridesPerHour.map(d => d.Hour))
    .range([0, width1 - margin1.left - margin1.right])
    .padding(0.2);

  const y1 = d3.scaleLinear()
    .domain([0, d3.max(ridesPerHour, d => d.Count)])
    .nice()
    .range([height1 - margin1.top - margin1.bottom, 0]);

  chart1.append("g")
    .attr("transform", `translate(0,${height1 - margin1.top - margin1.bottom})`)
    .call(d3.axisBottom(x1).tickFormat(d => {
      if (d === 21) return "9 PM";
      if (d === 22) return "10 PM";
      if (d === 23) return "11 PM";
      if (d === 0) return "12 AM";
      if (d === 1) return "1 AM";
      if (d === 2) return "2 AM";
      return "";
    }));

  chart1.append("g").call(d3.axisLeft(y1));

  chart1.selectAll(".bar")
    .data(ridesPerHour)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x1(d.Hour))
    .attr("y", d => y1(d.Count))
    .attr("width", x1.bandwidth())
    .attr("height", d => (height1 - margin1.top - margin1.bottom) - y1(d.Count))
    .attr("fill", "#007a33");

  svg1.append("text")
    .attr("x", width1 / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("fill", "#007a33")
    .text("Night Flight — Rides per Hour (9 PM – 2 AM)");

  // ---------------------------
  // CHART 2: Weekly Ride Trend (Aug – Sept 2025)
  // ---------------------------

  // Parse Day column into week number
  data.forEach(d => {
    const parsed = new Date(d.Day);
    const weekNum = Math.ceil(
      (((parsed - new Date(parsed.getFullYear(), 0, 1)) / 86400000)
        + parsed.getDay() + 1) / 7
    );
    d.Week = weekNum;
  });

  const ridesPerWeek = d3.rollups(
    data,
    v => v.length,
    d => d.Week
  ).map(([Week, Count]) => ({ Week, Count }))
   .sort((a, b) => a.Week - b.Week);

  const svg3 = d3.select("body")
    .append("svg")
    .attr("width", 800)
    .attr("height", 500);

  const width3 = 800, height3 = 500;
  const margin3 = { top: 60, right: 40, bottom: 60, left: 80 };
  const chart3 = svg3.append("g")
    .attr("transform", `translate(${margin3.left},${margin3.top})`);

  const x3 = d3.scaleLinear()
    .domain(d3.extent(ridesPerWeek, d => d.Week))
    .range([0, width3 - margin3.left - margin3.right]);

  const y3 = d3.scaleLinear()
    .domain([0, d3.max(ridesPerWeek, d => d.Count)])
    .nice()
    .range([height3 - margin3.top - margin3.bottom, 0]);

  const line3 = d3.line()
    .x(d => x3(d.Week))
    .y(d => y3(d.Count))
    .curve(d3.curveMonotoneX);

  chart3.append("g")
    .attr("transform", `translate(0,${height3 - margin3.top - margin3.bottom})`)
    .call(d3.axisBottom(x3).ticks(ridesPerWeek.length).tickFormat(d => "Week " + d));

  chart3.append("g").call(d3.axisLeft(y3));

  chart3.append("path")
    .datum(ridesPerWeek)
    .attr("fill", "none")
    .attr("stroke", "#007a33")
    .attr("stroke-width", 3)
    .attr("d", line3);

  chart3.selectAll(".dot")
    .data(ridesPerWeek)
    .enter()
    .append("circle")
    .attr("cx", d => x3(d.Week))
    .attr("cy", d => y3(d.Count))
    .attr("r", 5)
    .attr("fill", "#00a86b");

  const tooltip3 = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "6px 10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("font-size", "12px")
    .style("display", "none");

  svg3.selectAll("circle")
    .on("mouseover", (event, d) => {
      tooltip3.style("display", "block")
        .html(`<strong>Week ${d.Week}</strong><br/>Rides: ${d.Count}`);
    })
    .on("mousemove", (event) => {
      tooltip3.style("top", event.pageY - 30 + "px")
              .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", () => tooltip3.style("display", "none"));

  svg3.append("text")
    .attr("x", width3 / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("fill", "#007a33")
    .text("Night Flight — Weekly Ride Trends (Aug – Sept 2025)");

});
