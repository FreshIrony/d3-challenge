var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(healthData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]),
        d3.max(healthData, d => d[chosenXAxis])
        ])
        .range([0, width]);
    return xLinearScale;
}

function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]),
        d3.max(healthData, d => d[chosenYAxis])
        ])
        .range([height, 0]);
    return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis])-7)
        .attr("y", d => newYScale(d[chosenYAxis])+5);
    return textGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty %: ";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Age: ";
    }
    else {
        var xlabel = "Household Income: ";
    }

    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare %: ";
    }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smokes %: ";
    }
    else {
        var ylabel = "Obesity %: ";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {

            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

d3.csv("assets/data/data2.csv").then(function (healthData) {

    healthData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
        data.income = +data.income;
        console.log(data.abbr);
    });



    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("class", "stateCircle")
        .attr("opacity", ".5");

    var textGroup = chartGroup.append('g').selectAll('text')
        .data(healthData)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr('x', d => xLinearScale(d[chosenXAxis])-7)
        .attr('y', d => yLinearScale(d[chosenYAxis])+5)
        .text(d => d.abbr);

    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", -200)
        .attr("y", -30)
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("x", -200)
        .attr("y", -50)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var obeseLabel = ylabelsGroup.append("text")
        .attr("x", -200)
        .attr("y", -70)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    xlabelsGroup.selectAll("text")
        .on("click", function () {

            var xvalue = d3.select(this).attr("value");

            if (xvalue !== chosenXAxis) {
                chosenXAxis = xvalue;
                console.log(chosenXAxis)

                xLinearScale = xScale(healthData, chosenXAxis);
                console.log(xLinearScale);
                xAxis = renderXAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                // d3.selectAll('.stateText').transition()
                // .duration(1000)
                // .attr('x', d => xScale(d[chosenXAxis]));
                console.log(d => xScale(d[chosenXAxis]));
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);


                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "poverty") {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    ylabelsGroup.selectAll("text")
        .on("click", function () {

            var yvalue = d3.select(this).attr("value");

            if (yvalue !== chosenYAxis) {
                chosenYAxis = yvalue;
                console.log(chosenYAxis)
                yLinearScale = yScale(healthData, chosenYAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                // d3.selectAll('.stateText').transition()
                // .duration(1000)
                // .attr('y', d => yScale(d[chosenYAxis]+5));

                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
});