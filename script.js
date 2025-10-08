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


// ---------------------------
// SECOND CHART: Rides per Weekday
// ---------------------------

// Aggregate rides by day of the week
const ridesByDay = d3.rollups(
  data,
  v => v.length,
  d => d.DayOfWeek
).map(([DayOfWeek, Count]) => ({ DayOfWeek, Count }));

// Sort days (assuming they are numbers 0–6 or names like 'Monday')
const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
ridesByDay.sort((a, b) => dayOrder.indexOf(a.DayOfWeek) - dayOrder.indexOf(b.DayOfWeek));

// Create new SVG container
const svg2 = d3.select("body")
  .append("svg")
  .attr("width", 800)
  .attr("height", 500);

const width2 = +svg2.attr("width");
const height2 = +svg2.attr("height");
const margin2 = { top: 60, right: 40, bottom: 60, left: 80 };
const chartWidth2 = width2 - margin2.left - margin2.right;
const chartHeight2 = height2 - margin2.top - margin2.bottom;

const chart2 = svg2.append("g")
  .attr("transform", `translate(${margin2.left},${margin2.top})`);

// Scales
const x2 = d3.scaleBand()
  .domain(ridesByDay.map(d => d.DayOfWeek))
  .range([0, chartWidth2])
  .padding(0.2);

const y2 = d3.scaleLinear()
  .domain([0, d3.max(ridesByDay, d => d.Count)])
  .nice()
  .range([chartHeight2, 0]);

// Axes
chart2.append("g")
  .attr("transform", `translate(0,${chartHeight2})`)
  .call(d3.axisBottom(x2));

chart2.append("g")
  .call(d3.axisLeft(y2));

// Bars
chart2.selectAll(".bar2")
  .data(ridesByDay)
  .enter()
  .append("rect")
  .attr("class", "bar2")
  .attr("x", d => x2(d.DayOfWeek))
  .attr("y", d => y2(d.Count))
  .attr("width", x2.bandwidth())
  .attr("height", d => chartHeight2 - y2(d.Count))
  .attr("fill", "#009966");

// Tooltips
const tooltip2 = d3.select("body").append("div")
  .style("position", "absolute")
  .style("background", "white")
  .style("padding", "6px 10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "6px")
  .style("font-size", "12px")
  .style("display", "none");

svg2.selectAll(".bar2")
  .on("mouseover", (event, d) => {
    tooltip2.style("display", "block")
      .html(`<strong>${d.DayOfWeek}</strong><br/>Rides: ${d.Count}`);
  })
  .on("mousemove", (event) => {
    tooltip2.style("top", event.pageY - 30 + "px")
            .style("left", event.pageX + 10 + "px");
  })
  .on("mouseout", () => tooltip2.style("display", "none"));

// Chart Title
svg2.append("text")
  .attr("x", width2 / 2)
  .attr("y", 30)
  .attr("text-anchor", "middle")
  .attr("font-size", "20px")
  .attr("font-weight", "bold")
  .attr("fill", "#007a33")
  .text("Night Flight — Rides per Day of the Week");

// ---------------------------
// THIRD CHART: Weekly Ride Trend (Aug–Sept 2025)
// ---------------------------

// Parse date and extract week number
data.forEach(d => {
  const parsedDate = new Date(d.Day);
  // Week number (ISO-like)
  const weekNum = Math.ceil((((parsedDate - new Date(parsedDate.getFullYear(),0,1)) / 86400000) + parsedDate.getDay()+1) / 7);
  d.Week = weekNum;
});

// Aggregate rides per week
const ridesPerWeek = d3.rollups(
  data,
  v => v.length,
  d => d.Week
).map(([Week, Count]) => ({ Week, Count }))
  .sort((a, b) => a.Week - b.Week);

// SVG setup
const svg3 = d3.select("body")
  .append("svg")
  .attr("width", 800)
  .attr("height", 500);

const width3 = +svg3.attr("width");
const height3 = +svg3.attr("height");
const margin3 = { top: 60, right: 40, bottom: 60, left: 80 };
const chartWidth3 = width3 - margin3.left - margin3.right;
const chartHeight3 = height3 - margin3.top - margin3.bottom;

const chart3 = svg3.append("g")
  .attr("transform", `translate(${margin3.left},${margin3.top})`);

// Scales
const x3 = d3.scaleLinear()
  .domain(d3.extent(ridesPerWeek, d => d.Week))
  .range([0, chartWidth3]);

const y3 = d3.scaleLinear()
  .domain([0, d3.max(ridesPerWeek, d => d.Count)])
  .nice()
  .range([chartHeight3, 0]);

// Line generator
const line = d3.line()
  .x(d => x3(d.Week))
  .y(d => y3(d.Count))
  .curve(d3.curveMonotoneX);

// Axes
chart3.append("g")
  .attr("transform", `translate(0,${chartHeight3})`)
  .call(d3.axisBottom(x3).ticks(ridesPerWeek.length).tickFormat(d => "Week " + d));

chart3.append("g").call(d3.axisLeft(y3));

// Line path
chart3.append("path")
  .datum(ridesPerWeek)
  .attr("fill", "none")
  .attr("stroke", "#007a33")
  .attr("stroke-width", 3)
  .attr("d", line);

// Dots
chart3.selectAll(".dot")
  .data(ridesPerWeek)
  .enter()
  .append("circle")
  .attr("cx", d => x3(d.Week))
  .attr("cy", d => y3(d.Count))
  .attr("r", 5)
  .attr("fill", "#00a86b");

// Tooltip
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

// Chart title
svg3.append("text")
  .attr("x", width3 / 2)
  .attr("y", 30)
  .attr("text-anchor", "middle")
  .attr("font-size", "20px")
  .attr("font-weight", "bold")
  .attr("fill", "#007a33")
  .text("Night Flight — Weekly Ride Trends (Aug–Sept 2025)");

