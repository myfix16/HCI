import React from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({
    config: {
        colorScale,
        containerWidth,
        containerHeight,
        margin,
        tooltipPadding,
    },
    data
}) => {

    // I have to use this dirty trick to make sure initialize works properly
    const initialize = React.useRef(0);

    const svgRef = React.useRef();
    const chart = React.useRef();
    const xAxisG = React.useRef();
    const yAxisG = React.useRef();
    const bars = React.useRef();

    // These calculated intermediate data should be
    // cleaned up to React-styled code.
    // that is, to combine all below refs and the "initialized" state into a single state
    const _colorScale = React.useRef(colorScale || d3.scaleOrdinal()
        .range(['#a0a1e2', '#6495ed', '#04ea17'])
        .domain(['Easy', 'Intermediate', 'Difficult']));
    const _containerWidth = React.useRef(containerWidth || 500);
    const _containerHeight = React.useRef(containerHeight || 300);
    const _tooltipPadding = React.useRef(tooltipPadding || 15);
    const _margin = React.useRef(margin || {top: 25, right: 20, bottom: 20, left: 40});
    const width = React.useRef(_containerWidth.current - _margin.current.left - _margin.current.right);
    const height = React.useRef(_containerHeight.current - _margin.current.top - _margin.current.bottom);

    const xScale = React.useRef(d3.scaleLinear().range([0, width.current]));
    const yScale = React.useRef(d3.scaleLinear().range([height.current, 0]));
    const xAxis = React.useRef(
        d3.axisBottom(xScale.current)
            .ticks(6)
            .tickSize(-height.current - 10)
            .tickPadding(10)
            .tickFormat(d => d + ' km'));
    const yAxis = React.useRef(
        d3.axisLeft(yScale.current)
            .ticks(6)
            .tickSize(-width.current - 10)
            .tickPadding(10)
    );

    const initVis = () => {
        if (initialize.current >= 2) return;

        let svg = d3.select(svgRef.current);
        svg.attr('width', _containerWidth.current)
            .attr('height', _containerHeight.current);

        svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0).attr('y', 0)
            .attr('dy', '.71em')
            .text('Hours');
        svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', width.current - 10)
            .attr('y', height.current + 10)
            .attr('dy', '.71em')
            .text('Distance');

        xAxis.current = d3.axisBottom(xScale.current)
            .ticks(6)
            .tickSize(-height.current - 10)
            .tickPadding(10)
            .tickFormat(d => d + ' km');
        yAxis.current = d3.axisLeft(yScale.current)
            .ticks(6)
            .tickSize(-width.current - 10)
            .tickPadding(10);

        chart.current = svg.append('g')
            .attr('transform', `translate(${_margin.current.left},${_margin.current.top})`);
        xAxisG.current = chart.current.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${height.current})`);
        yAxisG.current = chart.current.append('g')
            .attr('class', 'axis y-axis');

        initialize.current++;
    }

    const updateVis = () => {
        let colorValue = d => d.difficulty;
        let xValue = d => d.time;
        let yValue = d => d.distance;

        xScale.current.domain([0, d3.max(data, xValue)]);
        yScale.current.domain([0, d3.max(data, yValue)]);

        // renderVis()
        bars.current = chart.current.selectAll('.point')
            .data(data, d => d.trail)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cy', d => yScale.current(yValue(d)))
            .attr('cx', d => xScale.current(xValue(d)))
            .attr('fill', d => _colorScale.current(colorValue(d)))
            .on('mouseover', (event, d) => {
                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + _tooltipPadding.current) + 'px')
                    .style('top', (event.pageY + _tooltipPadding.current) + 'px')
                    .html(`
                <div class="tooltip-title">${d.trail}</div>
                <div><i>${d.region}</i></div>
                <ul>
                <li>${d.distance} km, ~${d.time} hours</li>
                <li>${d.difficulty}</li>
                <li>${d.season}</li>
                </ul>
            `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });

        xAxisG.current.call(xAxis.current);
        yAxisG.current.call(yAxis.current);
    }

    // Initialize the scatter plot (5pts)
    initVis();

    // Update rendering result (5pts)
    updateVis();

    return (
        <svg ref={svgRef}></svg>
    );
}

export default ScatterPlot;