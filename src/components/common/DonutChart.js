import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import './DonutChart.css';

const DonutChart = props => {

    const position = (d, i) => {
        var c = 3;   // number of columns
        var h = 30;  // height of each entry
        var w = 200; // width of each entry (so you can position the next column)
        var tx = 10; // tx/ty are essentially margin values
        var ty = 10;
        var x = i % c * w + tx;
        var y = Math.floor(i / c) * h + ty;
        return "translate(" + x + "," + y + ")";
    }

    const groupRef = useRef(null);
    const legendRef = useRef(null);
    const createPie = d3
        .pie()
        .value(d => d.value)
        .sort(null);

    const createArc = d3
        .arc()
        .innerRadius(props.innerRadius)
        .outerRadius(props.outerRadius);

    useEffect(() => {
        const data = createPie(props.data);
        const group = d3.select(groupRef.current);
        const legendGroupContainer = d3.select(legendRef.current);

        group.selectAll("*").remove();
        legendGroupContainer.selectAll("*").remove();
        legendGroupContainer
            .attr("width", data.length > 2 ? 200 * 3 : 200 * data.length)
            .attr("height", 37 * Math.ceil(data.length / 3))
            .append("g");
        legendGroupContainer.selectAll("*").remove();

        const legendGroupWithData = legendGroupContainer.selectAll(".legend").data(data);
        const dounutContainer = group.append("g");;
        const groupWithData = dounutContainer.selectAll("g.arc").data(data);

        legendGroupWithData.exit().remove();
        groupWithData.exit().remove();

        dounutContainer
            .attr("transform", `translate(${props.outerRadius + (props.outerRadius / 100) * 35} ${props.outerRadius + (props.outerRadius / 100) * 35})`);

        // legendGroupContainer
        //     .attr("transform", `translate(0 ${props.outerRadius * 2 + 50})`);

        const groupWithUpdate = groupWithData
            .enter()
            .append("g")
            .attr("class", "arc");

        const path = groupWithUpdate
            .append("path")
            .merge(groupWithData.select("path.arc"));

        path
            .attr("class", "arc")
            .attr("d", createArc)
            .attr("fill", (d, i) => d.data.color)
            .on("mousemove", (d, i, nodes) => {
                d3.select(nodes[i])
                    .attr("stroke", "#fff")
                    .attr("stroke-width", "2px");
                d3.select(nodes[i])
                    .transition()
                    .duration(5000)
                    .ease(d3.easeElastic)
                    .attr('transform', (d) => {
                        var dist = 1;
                        var a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
                        var x = Math.cos(a) * 20;
                        var y = Math.sin(a) * 20;
                        return 'translate(' + x + ',' + y + ')';
                    });
                var mousePos = d3.mouse(d3.select("#donutDiv-" + props.id).node());
                d3.select("#mainTooltip-" + props.id)
                    .style("left", mousePos[0] - 30 + "px")
                    .style("top", mousePos[1] - 40 + "px")
                    .style("display", "block")
                    .select("#value")
                    .attr("text-anchor", "middle")
                    .html(d.data.label + "<br />" + d.value);
            })
            .on("mouseout", (d, i, nodes) => {
                d3.select(nodes[i])
                    .attr("stroke", "none")
                    .style("filter", "none");
                d3.select(nodes[i])
                    .transition()
                    .duration(500)
                    .ease(d3.easeBounce)
                    .attr('transform', 'translate(0,0)');

                d3.select("#mainTooltip-" + props.id)
                    .style("display", "none")
            });

        const legendGroupWithUpdate = legendGroupWithData
            .enter().append("g")
            .attr("transform", position)
            .attr("class", "legend");

        const legendRect = legendGroupWithUpdate.append("rect")
            .attr("width", (props.outerRadius / 100) * 10)
            .attr("height", (props.outerRadius / 100) * 10)
            .attr("fill", (d, i) => d.data.color);

        const legendText = legendGroupWithUpdate
            .append("text")
            .merge(legendGroupWithData.select("text"));

        const rectBound = legendRect.node().getBoundingClientRect();

        const textBound = legendRect.node().getBoundingClientRect();

        legendText
            .style("font-size", 12)
            .attr("y", textBound.width <= 30 ? rectBound.width - 4 : rectBound.width / 2)
            .attr("x", rectBound.width + 4)
            .text(d => d.data.label);

    }, [props.data]);

    return (
        <div id={"donut-container-" + props.id} className='donut-container'>
            <div id={"donutDiv-" + props.id} className='donutDiv'>
                <svg width={(props.outerRadius * 2) + (props.outerRadius / 100) * 70}
                    height={(props.outerRadius * 2) + (props.outerRadius / 100) * 70}
                    ref={groupRef}>
                </svg>
            </div>
            <div id={"legendDiv-" + props.id} className='legendDiv'>
                <svg ref={legendRef}>
                </svg>
            </div>
            <div id={"mainTooltip-" + props.id} className="mainTooltip">
                <p><span id="value"></span>%</p>
            </div>
        </div>
    );
};

export default DonutChart;