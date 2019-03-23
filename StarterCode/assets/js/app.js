// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 100,
  left: 120
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select scatter, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(acsData, chosenXAxis) {
    // create x scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenXAxis]) * 0.8,
        d3.max(acsData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, chartWidth]);
  
    return xLinearScale;
}

// function used for updating x-scale var upon click on axis label
function yScale(acsData, chosenYAxis) {
    // create y scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenYAxis]) * 0.8,
        d3.max(acsData, d => d[chosenYAxis]) * 1.2
      ])
      .range([chartHeight, 0]);
  
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles & text
function renderXCircles(elemEnter, newXScale, chosenXAxis) {

    elemEnter.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    elemEnter.selectAll("text")
        .transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return elemEnter;
}

function renderYCircles(elemEnter, newYScale, chosenYAxis) {

    elemEnter.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    elemEnter.selectAll("text")
        .transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]));
  
    return elemEnter;
}
  
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, elemEnter) {
    // Setup the tool tip.  Note that this is just one example, and that many styling options are available.
    // See original documentation for more details on styling: http://labratrevenge.com/d3-tip/
    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => `${d.state} <br>${chosenXAxis}: ${d[chosenXAxis]} <br>${chosenYAxis}: ${d[chosenYAxis]}`);
    
    svg.call(tool_tip);

    elemEnter.classed("active inactive", true)
    .on('mouseover', tool_tip.show)
    .on('mouseout', tool_tip.hide);
   
    return elemEnter;
}
  

var formatPercent = d3.format('.2%')

// Load data from data.csv
d3.csv("/assets/data/data.csv").then(acsData => {

    var r = 10;
    // Throw an error if one occurs
    //if (error) throw error;
  
    // Print the data
    // console.log(acsData);
  
    // Parse data: Cast the data values to a number
    acsData.forEach(d => {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.obesity = +d.obesity;
      d.healthcare = +d.healthcare;
      d.smokes = +d.smokes;
    });

    
    // Create initial xLinearScale, yLinearScale
    var xLinearScale = xScale(acsData, chosenXAxis);
    var yLinearScale = yScale(acsData, chosenYAxis);

    // Create initial axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("axis", true)
      .call(leftAxis);
      
    // Define the data for the circles + text
    var elem = chartGroup.selectAll("g circle")
        .data(acsData)
 
    // Create and place the "blocks" containing the circle and the text  
    var elemEnter = elem.enter()
        .append("g")
    
    // Create the circle for each block
    elemEnter.append("circle")
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', r)
        .classed("stateCircle", true);
    
    // Create the text for each circle
    elemEnter.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .classed("stateText", true)
        .attr("font-size", parseInt(r*0.8))
        .text(d => d.abbr)
  
    // Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`)
        .classed("atext", true);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90 " + (margin.left/2) + " " + (chartHeight/2) + ")")
        .attr("x", margin.left/2)
        .attr("y", chartHeight/2)
        .attr("dy", "1em")
        .classed("atext", true);

    var obesityLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    // updateToolTip function
    var elemEnter = updateToolTip(chosenXAxis, chosenYAxis, elemEnter);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXaxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(acsData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            elemEnter = renderXCircles(elemEnter, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            elemEnter = updateToolTip(chosenXAxis, chosenYAxis, elemEnter);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                .classed("active", true)
                .classed("inactive", false);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if(chosenXAxis === "age"){
                ageLabel
                .classed("active", true)
                .classed("inactive", false);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
                incomeLabel
                .classed("active", true)
                .classed("inactive", false);
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
            }
        }
    });
    // y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;

            // console.log(chosenYAxis)

            // functions here found above csv import
            // updates y scale for new data
            yLinearScale = yScale(acsData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new x values
            elemEnter = renderYCircles(elemEnter, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            elemEnter = updateToolTip(chosenXAxis, chosenYAxis, elemEnter);

            // changes classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel
                .classed("active", true)
                .classed("inactive", false);
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
                smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if(chosenYAxis === "healthcare"){
                healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
                smokesLabel
                .classed("active", false)
                .classed("inactive", true);
                obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
                smokesLabel
                .classed("active", true)
                .classed("inactive", false);
                obesityLabel
                .classed("active", false)
                .classed("inactive", true);
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            }
        }
    });
  });
