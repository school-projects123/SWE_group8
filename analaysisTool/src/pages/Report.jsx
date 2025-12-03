import { useEffect, useRef, useState } from 'react';

export default function Upload() {
    const pieChart1Ref = useRef(null);
    const pieChart2Ref = useRef(null);
    const [jsonData, setJsonData] = useState([]);
    const defaultFilename = '21755561_Pretend_Essay_Assignment.xls';
    //const defaultFilename = 'Master_Spreadsheet.xlsx'; // need this to work later

    const FIELDS = ['Last Name','First Name','Email','Turnitin User ID','Title','Word Count','Date Uploaded','Grade','Similarity Score'];
    const MAX_ROWS = 15;

    // Utility to load external scripts
    function loadScript(src, callback) {
        if (document.querySelector(`script[src="${src}"]`)) return callback();
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Load XLSX and Chart.js
    function loadXlsxJs(callback) { loadScript('xlsx.full.min.js', callback); }
    function loadChartJs(callback) { loadScript('https://cdn.jsdelivr.net/npm/chart.js', callback); }

    // Helper to create a chart
    function createChart(ctx, type, labels, data, options = {}) {
        if (!ctx || !window.Chart) return;
        new Chart(ctx, {
            type,
            data: { labels, datasets: [{ data, ...options.datasetOptions }] },
            options
        });
    }

    // Process Excel data
    function processExcelData(arrayBuffer) {
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        setJsonData(sheetData.slice(0, MAX_ROWS)); // only first 15 rows for display

        renderBarChart(sheetData);
        plotWordCountVsScoreFromTable(sheetData);
    }

    // Load file data
    function loadData(filename) {
        loadXlsxJs(() => {
            fetch(filename)
                .then(res => { if (!res.ok) throw new Error('Network error'); return res.arrayBuffer(); })
                .then(arrayBuffer => processExcelData(arrayBuffer))
                .catch(err => console.error('Error fetching user data:', err));
        });
    }

    // Render user score bar chart
    function renderBarChart(data) {
        const chartDiv = document.getElementById('chartDiv') || Object.assign(document.body.appendChild(document.createElement('div')), {id: 'chartDiv'});
        chartDiv.innerHTML = '';
        const canvas = Object.assign(document.createElement('canvas'), { id: 'userScoreChart', width: 480, height: 240 });
        canvas.style.width = '30%';
        canvas.style.height = '240px';
        chartDiv.appendChild(canvas);

        const users = data.map(u => ({ name: `${u['First Name'] || ''} ${u['Last Name'] || ''}`.trim(), grade: parseFloat(u.Grade) }))
            .filter(u => !isNaN(u.grade));
        const labels = users.map(u => u.name || 'Unknown');
        const scores = users.map(u => u.grade);
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        const backgroundColours = scores.map(score => {
            if (score === maxScore) return 'green';
            if (score === minScore) return 'red';
            return 'rgba(255, 206, 86, 0.9)';
        });

        loadChartJs(() => {
            createChart(canvas.getContext('2d'), 'bar', labels, scores, { // this is for: the bar chart
                datasetOptions: { backgroundColor: backgroundColours, borderColor: 'black', borderWidth: 1 },
                options: {
                    indexAxis: 'x',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { maxRotation: 45, minRotation: 0 }, grid: { display: false } },
                        y: { beginAtZero: true, ticks: { stepSize: 10 } }
                    },
                    plugins: { legend: { display: false }, tooltip: { bodyFont: { size: 12 } } }
                }
            });
        });
    }

    // Render scatter plot of Word Count vs Score

    function plotWordCountVsScoreFromTable(data) {
        const points = data
            .map(u => {
                const wordNum = parseFloat(u['Word Count'] || '');
                const gradeNum = parseFloat(u.Grade || '');
                if (!isNaN(wordNum) && !isNaN(gradeNum)) {
                    return {
                        x: wordNum,
                        y: gradeNum,
                        label: `${u['First Name'] || ''} ${u['Last Name'] || ''}`.trim() || 'Unknown'
                    };
                }
                return null;
            })
            .filter(Boolean);

        const scatterDiv = document.getElementById('scatterDiv') || Object.assign(
            document.body.appendChild(document.createElement('div')),
            { id: 'scatterDiv' }
        );
        scatterDiv.innerHTML = ''; // clear previous

        const container = document.createElement('div');
        container.style.width = '150%';
        container.style.margin = '0 auto';
        container.style.maxWidth = '480px';
        scatterDiv.appendChild(container);

        const canvas = Object.assign(document.createElement('canvas'), { id: 'wordcountScoreChart' });
        canvas.style.width = '80%';
        canvas.style.height = '320px'; // visual height
        container.appendChild(canvas);

        if (!points.length) { // no (valid) data
            scatterDiv.appendChild(document.createTextNode('No valid Word Count / Score pairs to plot.'));
            return;
        }

        loadChartJs(() => {
            new Chart(canvas.getContext('2d'), {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Word Count vs Score',
                        data: points,
                        backgroundColor: 'rgba(78,78,78,0.9)',
                        borderColor: 'rgba(0,0,0,0.6)',
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: 'Word Count' }, beginAtZero: true },
                        y: { title: { display: true, text: 'Score' }, beginAtZero: true }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const point = context.raw;
                                    return `${point.label}: (${point.x}, ${point.y})`;
                                }
                            }
                        }
                    }
                }
            });
        });
    }

    // Render table in JSX
    const renderTableJSX = () => (
        <table border="1" style={{ borderCollapse: 'collapse', fontSize: 12, lineHeight: 1.2 }}>
            <thead>
                <tr>{FIELDS.map(f => <th key={f}>{f}</th>)}</tr>
            </thead>
            <tbody>
                {jsonData.map((user, i) => (
                    <tr key={i}>
                        {FIELDS.map(f => <td key={f}>{f === 'Title' ? (user[f] || '').toString().slice(0,30) : user[f] || ''}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // Initial load
    useEffect(() => {
        loadData(defaultFilename);

        // Setup pie charts
        loadChartJs(() => {
            createChart(pieChart1Ref.current?.getContext('2d'), 'pie', ['Grade A','Grade B','Grade C'], [50,20,40], {
                datasetOptions: { backgroundColor: ['#ff6384','#36a2eb','#58ff56'] }
            });
            createChart(pieChart2Ref.current?.getContext('2d'), 'pie', ['Grade A','Grade B','Grade C'], [30,99,20], {
                datasetOptions: { backgroundColor: ['#ff6384','#36a2eb','#58ff56'] }
            });
        });
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden" }}>
            <noscript>Please enable Javascript to run this app.</noscript>
            <div id="topBar" style={{ display: "flex", width: "100%", backgroundColor: "#2563eb", maxWidth: "100%", textAlign: "center", boxSizing: "border-box" }}>
                <p>Welcome to the report page.</p>
            </div>
            <div className="display" style={{ height: "100%", flex: 1, backgroundColor: "lightblue", maxWidth: "100%" }}>
                <div style={{ display: "flex", width: "100%", height: "100%", boxSizing: "border-box" }}>
                    <div style={{ width: "20%", backgroundColor: "#19306a", padding: "10px" }}>
                        <h2>Report Page/ Data Analytics</h2>
                        <p>As this is jsx, that means .html still doesn't work, so there is no point leaving that here, plus the links show up at the top, or at least they do for me.</p>
                        <p>I think this section would serve well to list students, which you can click to view specific data for them.</p>
                        <div className="studentList"></div> {/* a table or list, or something else? */}

                    </div>
                    <div style={{ width: "100%", backgroundColor: "lightyellow" }}>
                        <div style={{ display: "flex", width: "100%", height: "100%", boxSizing: "border-box" }}>
                            <div style={{ width: "20%", backgroundColor: "#b6b6b6", padding: "10px", boxSizing: "border-box" }}>
                                <h2 style={{ margin: 0 }}>Grades</h2>
                                <h3>Course 1</h3>
                                <canvas ref={pieChart1Ref} id="pieChart1" width="200" height="200"></canvas>
                                <h3>Course 2</h3>
                                <canvas ref={pieChart2Ref} id="pieChart2" width="200" height="200"></canvas>
                            </div>
                            <div style={{ width: "80%", backgroundColor: "#b6b6b6", padding: "20px", boxSizing: "border-box" }}>
                                <h2>Actual Charts</h2>
                                <div id="chartDiv"></div>
                                <div id="userDiv">{renderTableJSX()}</div>
                                <div id="scatterDiv"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="bottomBar" style={{ display: "flex", width: "100%", backgroundColor: "lightgray" }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", justifyContent: "center", gap: "20px" }}>
                        <li><a href="https://github.com/school-projects123/SWE_group8">GitHub Repository</a></li>
                        <li><a href="https://github.com/school-projects123/SWE_group8/tree/Special-Branch">(Special Branch)</a></li>
                        <li><a href="https://github.com/school-projects123/SWE_group8/tree/Report_branch">(Report Branch)</a></li>
                    </ul>
                    <div style={{ marginTop: "8px", fontSize: "0.9em", color: "#333" }}>
                        All rights reserved. By who, I do not know.
                    </div>
                </div>
            </div>
        </div>
    );
}