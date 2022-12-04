import React from 'react';
import * as d3 from 'd3';

const BarChart = ({
    config: {
        colorScale,
        containerWidth,
        containerHeight,
        margin
    },
    data,
    filterCategory,
    setFilterCategory,
}) => {

    const orderedKeys = ['Easy', 'Intermediate', 'Difficult'];

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
        .range(['#a0a1e2', '#6495ed', '#04ea17']) // light green to dark green
        .domain(['Easy', 'Intermediate', 'Difficult']));
    const _containerWidth = React.useRef(containerWidth || 260);
    const _containerHeight = React.useRef(containerHeight || 300);
    const _margin = React.useRef(margin || {top: 25, right: 20, bottom: 20, left: 40});
    const width = React.useRef(_containerWidth.current - _margin.current.left - _margin.current.right);
    const height = React.useRef(_containerHeight.current - _margin.current.top - _margin.current.bottom);
    const xScale = React.useRef(d3.scaleBand().range([0, width.current]).paddingInner(0.2));
    const yScale = React.useRef(d3.scaleLinear().range([height.current, 0]));
    const xAxis = React.useRef(
        d3.axisBottom(xScale.current)
            .ticks(['Easy', 'Intermediate', 'Difficult'])
            .tickSizeOuter(0)
    );
    const yAxis = React.useRef(
        d3.axisLeft(yScale.current)
            .ticks(6)
            .tickSizeOuter(0)
    );

    function initVis() {
        if (initialize.current >= 2) return;

        let svg = d3.select(svgRef.current);
        svg.attr('width', _containerWidth.current)
            .attr('height', _containerHeight.current);
        svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0).attr('y', 0)
            .attr('dy', '.71em')
            .text('Trails');

        chart.current = svg.append('g')
            .attr('transform', `translate(${_margin.current.left},${_margin.current.top})`);
        xAxisG.current = chart.current.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${height.current})`);
        yAxisG.current = chart.current.append('g')
            .attr('class', 'axis y-axis');

        initialize.current++;
    }

    function updateVis() {
        const aggregatedDataMap = d3.rollups(data, v => v.length, d => d.difficulty);
        let aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({key, count}));
        aggregatedData = aggregatedData.sort((a, b) => {
            return orderedKeys.indexOf(a.key) - orderedKeys.indexOf(b.key);
        });
        let colorValue = d => d.key;
        let xValue = d => d.key;
        let yValue = d => d.count;

        xScale.current.domain(aggregatedData.map(xValue))
        yScale.current.domain([0, d3.max(aggregatedData, yValue)]);

        // renderVis()
        bars.current = chart.current.selectAll('.bar')
            .data(aggregatedData, xValue)
            .join('rect')
            .attr('class', d => filterCategory[d.key] ? 'bar selected' : 'bar')
            .attr('x', d => xScale.current(xValue(d)))
            .attr('width', xScale.current.bandwidth())
            .attr('height', d => height.current - yScale.current(yValue(d)))
            .attr('y', d => yScale.current(yValue(d)))
            .attr('fill', d => _colorScale.current(colorValue(d)))
            .on('click', function (event, d) {
                // Change parent node's React State with the selected category names (5pts)
                setFilterCategory({...filterCategory, [d.key]: !filterCategory[d.key]})
            });

        xAxisG.current.call(xAxis.current);
        yAxisG.current.call(yAxis.current);
    }

    // Initialize the bar plot (5pts)
    initVis();

    // Update rendering result (5pts)
    updateVis();

    return (
        <svg ref={svgRef}></svg>
    );
}

export default BarChart;