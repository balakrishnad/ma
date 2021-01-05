import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './BarChart.css';


export default ({ id, data, xlabel, width, height }) => {

  // remove when API data is retrieved
  const svgRef = useRef();
  const plot = (chart, width, height) => {
    // create scales!
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.Name))
      .range([0, width])
      .padding(0.5);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Value) === 0 ? 100 : d3.max(data, d => d.Value) * 1.25])
      .range([height, 0]);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    chart.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .classed('bar', true)
      .attr('x', d => xScale(d.Name))
      .attr('y', d => yScale(d.Value))
      .attr('height', d => (height - yScale(d.Value)))
      .attr('width', d => xScale.bandwidth())
      .style('fill', (d, i) => colorScale(i));

    chart.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .classed('bar-label', true)
      .attr("transform", d => {
        if (d.Value) {
          return "translate(" + (xScale(d.Name) + xScale.bandwidth() / 2) + "," + yScale(d.Value) + ") rotate(-60)"
        } else {
          return "translate(" + (xScale(d.Name) + xScale.bandwidth() / 2) + "," + yScale(d.Value) + ")"
        }
      })
      .attr('dx', d => (d.Value === 0 ? 0 : 20))
      .attr('dy', d => (d.Value === 0 ? -3 : -6))
      .text(d => d.Value);

    const xAxis = d3.axisBottom()
      .scale(xScale);

    chart.append('g')
      .classed('x axis', true)
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    const yAxis = d3.axisLeft()
      .ticks(5)
      .scale(yScale);

    chart.append('g')
      .classed('y axis', true)
      .attr('transform', 'translate(0,0)')
      .call(yAxis);

    chart.select('.x.axis')
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', '#000')
      .attr('class', 'xlabel')
      .text(xlabel);

    chart.select('.y.axis')
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('class', 'ylabel')
      .attr('transform', `translate(-50, ${height / 2}) rotate(-90)`)
      .attr('fill', '#000')
      .text('Estimated Value ($)');
  };

  const drawChart = (x, y) => {
    const width = x;
    const height = y;
    const svg = d3.select(svgRef.current)
      .append('svg')
      .attr('id', 'chart')
      .attr('width', width)
      .attr('height', height);

    const margin = {
      top: 30,
      bottom: 70,
      left: 75,
      right: 20
    };

    const chart = svg.append('g')
      .classed('display', true)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom
    plot(chart, chartWidth, chartHeight);
  }

  useEffect(() => {
    d3.select(svgRef.current).selectAll('*').remove();
    drawChart(width, height);
  }, [data]);
  return (
    <div ref={svgRef} id={id}>
    </div>
  );
}
