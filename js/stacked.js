// set the dimensions and margins of the graph
const margin_sb = { top: 30, right: 30, bottom: 15, left: 50 },
  width_sb = 500 - margin_sb.left - margin_sb.right,
  height_sb = 490 - margin_sb.top - margin_sb.bottom;

// append the svg object to the body of the page
const svgStacked = d3
  .select("#stack_plot")
  .append("svg")
  .attr("width", width_sb + margin_sb.left + margin_sb.right)
  .attr("height", height_sb + margin_sb.top + margin_sb.bottom)
  .append("g")
  .attr("transform", `translate(${margin_sb.left},${margin_sb.top})`);

// Parse the Data
async function draw_stacked() {
  // List of subgroups = header of the csv files = soil condition here
  dataset_stack = await d3.csv("./js/stack.csv");
  var subgroups = ["Nitrogen", "normal", "stress"];

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = dataset_stack.map((d) => d.group);

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.1]);
  svgStacked
    .append("g")
    .attr("transform", `translate(0, ${height_sb})`)
    .call(d3.axisBottom(x).tickSizeOuter(-1));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 60]).range([height_sb, 0]);
  svgStacked.append("g").call(d3.axisLeft(y));

  // color palette = one color per subgroup
  const color = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range(["#C7EFCF", "#FE5F55", "#EEF5DB"]);

  //stack the data? --> stack per subgroup
  const stackedData = d3.stack().keys(subgroups)(dataset_stack);

  // ----------------
  // Create a tooltip
  // ----------------
  const tooltip = d3
    .select("#bubble_1")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .attr("style", "position: absolute; opacity: 0;")
    .style("background-color", "#333333")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function (event, d) {
    const subgroupName = d3.select(this.parentNode).datum().key;
    const subgroupValue = d.data[subgroupName];

    tooltip
      .style("opacity", 1)
      .html("subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue)
      .style("left", event.x / 2 + "px")
      .style("top", event.y / 2 + 30 + "px");
  };
  const mousemove = function (event, d) {
    tooltip.style("left", event.x + "px").style("top", event.y + 300 + "px");
  };
  const mouseleave = function (event, d) {
    tooltip.style("opacity", 0);
  };

  // Show the bars
  svgStacked
    .append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d.data.group))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("stroke", "grey")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

draw_stacked();
