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

