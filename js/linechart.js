const line_svg = d3.select("#linegraph").append("svg");
function draw_cood(data) {
  console.log("linechart");
  line_svg.selectAll("*").remove();
  data = data.map(function (d) {
    return {
      cholesterol: d.cholesterol,
      creatinine: d.creatinine,
      glycemia: d.glycemia,
      triglycerides: d.triglycerides,
      age_group: d.age_group,
    };
  });

  line_svg
    .attr("width", 500)
    .attr("height", 500)
    .append("g")
    .attr("transform", `translate(60,60)`);

  // console.log('data', data)
  // Color scale: give me a specie name, I return a color
  const color = d3
    .scaleOrdinal()
    .domain(["Juvenile", "Adult", "Elderly"])
    .range(["#440154ff", "#21908dff", "#fde725ff"]);

  // Here I set the list of dimension manually to control the order of axis:
  dimensions = ["cholesterol", "creatinine", "glycemia", "triglycerides"];

  // For each dimension, I build a linear scale. I store all in a y object
  const y = {};
  for (i in dimensions) {
    col = dimensions[i];
    y[col] = d3
      .scaleLinear()
      .domain([0, 2000]) //.domain( [d3.extent(data, function(d) { return +d[name]; })] )
      //.domain( [d3.extent(data, function(d) { return +d[col]; })] )
      .range([460, 50]);
  }
  // console.log('y: ', y)
  // Build the X scale -> it find the best position for each Y axis
  const x = d3
    .scalePoint()
    .range([50, width + 50])
    .domain(dimensions);

  // Highlight the specie that is hovered
  const highlight = function (event, d) {
    selected_specie = d.age_group;

    // first every group turns grey
    d3.selectAll(".line")
      .transition()
      .duration(200)
      .style("stroke", "lightgrey")
      .style("opacity", "0.2");
    // Second the hovered specie takes its color
    d3.selectAll("." + selected_specie)
      .transition()
      .duration(200)
      .style("stroke", color(selected_specie))
      .style("opacity", "1");
  };

  // Unhighlight
  const doNotHighlight = function (event, d) {
    d3.selectAll(".line")
      .transition()
      .duration(200)
      .delay(1000)
      .style("stroke", function (d) {
        return color(d.age_group);
      })
      .style("opacity", "1");
  };

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(
      dimensions.map(function (p) {
        return [x(p), y[p](d[p])];
      })
    );
  }

  // Draw the lines
  line_svg
    .selectAll("myPath")
    .data(data)
    .join("path")
    .attr("class", function (d) {
      return "line " + d.age_group;
    }) // 2 class for each line: 'line' and the group name
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", function (d) {
      return color(d.age_group);
    })
    .style("opacity", 0.5)
    .on("mouseover", highlight)
    .on("mouseleave", doNotHighlight);

  // Draw the axis:
  line_svg
    .selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "axis")
    // I translate this element to its right position on the x axis
    .attr("transform", function (d) {
      return `translate(${x(d)})`;
    })
    // And I build the axis with the call function
    .each(function (d) {
      d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]));
    })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) {
      return d;
    })
    .style("fill", "black");

  line_svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Protien Levels vs Age Group");
}