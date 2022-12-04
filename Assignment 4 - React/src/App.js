import './App.css';
import * as d3 from 'd3';
import React, {useEffect} from 'react';
import BarChart from './components/BarChart';
import ScatterPlot from './components/ScatterPlot';


function App() {
    // Create three states, i.e., data, selectedData, and filterCategory
    const [data, setData] = React.useState([]);
    const [selectedData, setSelectedData] = React.useState([]);
    const [filterCategory, setFilterCategory] = React.useState({
        'Easy': false,
        'Intermediate': false,
        'Difficult': false,
    });

    function loadData() {
        d3.csv('./vancouver_trails.csv')
            .then(_data => setData(_data.map(d => {
                d.time = +d.time;
                d.distance = +d.distance;
                return d
            })));
    }

    useEffect(() => {
        loadData();
    }, [])

    // Use useEffect to render and update visual results when dependency/dependencies change (30pts)
    useEffect(() => {
        if (filterCategory['Easy'] || filterCategory['Intermediate'] || filterCategory['Difficult'])
            setSelectedData(data.filter(d => filterCategory[d.difficulty]));
        else setSelectedData(data);
    }, [data, filterCategory])

    // update document title
    useEffect(() => {
        document.title = 'Multiple-View Interaction';
    }, []);

    const colorScale = d3.scaleOrdinal()
        .range(['#d3eecd', '#7bc77e', '#2a8d46'])
        .domain(['Easy', 'Intermediate', 'Difficult']);

    return (
        <div className='Container'>
            <h1 className='head'> Multiple-View Interaction </h1>
            <div className="App">
                <ScatterPlot config={colorScale} data={selectedData}/>
                <BarChart config={colorScale} data={data} filterCategory={filterCategory}
                          setFilterCategory={setFilterCategory}/>
            </div>
        </div>
    );
}

export default App;
