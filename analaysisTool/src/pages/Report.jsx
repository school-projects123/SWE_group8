import { useEffect, useRef, useState } from 'react';
// IMPROVEMENTS FOR JAN-APRIL:
// need to improve in next term so that large files arent trunicated in the report page output
// currently maxes out at about 15 (excluding bar chart) -> see 'setJsonData'
// also adding more visualisation graphics for the data next term
// get rid of XLSX dependency as its now using csv
export default function Upload() {
    const [jsonData, setJsonData] = useState([]);
    const FIELDS = ['First Name','Last Name','Username','Student ID','Grades (%)','Course Grade (%)','Exam Score (Raw)','Essay Score (Raw)','Hours in Course']; // these are the columns of the excel sheet
    // these fields must be identical to the ones in the json for the data to show up correctly

    // Utility to load external scripts
    function loadScript(src, callback) {
        if (document.querySelector(`script[src="${src}"]`)) return callback();
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        document.head.appendChild(script);
    }

    // XLSX and Chart.js are required for this page, xlsx as this entire file is geared around excel files (not csv or json)
    function loadXlsxJs(callback) { loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', callback); }
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

    // load file data and process Excel in one function, much better
    function loadData() {
        loadXlsxJs(async () => {
            try {
                // fetch processed JSON data from the backend
                const res = await fetch("/master");
                if (!res.ok) throw new Error("Network error, couldn't fetch data from backend.");
                const data = await res.json(); // parse JSON response
                const sheetData = data.masterRows || []; // get rows
                setJsonData(sheetData.slice(0, 15)); // particular subset for display (table only). LIMITED TO 15, CHANGE THIS WHEN NEEDED
                renderBarChart(sheetData);
                plotEssayVsExamFromTable(sheetData);
            } catch (err) {
                console.error("Error fetching or processing backend data:", err);
            }
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

        const users = data.map(u => ({ name: `${u['First Name'] || ''} ${u['Last Name'] || ''}`.trim(), grade: parseFloat(u['Essay Score (Raw)'] || '') }))
            .filter(u => !isNaN(u.grade));
        const labels = users.map(u => u.name);
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
    function plotEssayVsExamFromTable(data) {
        const points = data
            .map(u => {
                const wordNum = parseFloat(u['Essay Score (Raw)'] || '');
                const gradeNum = parseFloat(u['Exam Score (Raw)'] || '');
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
            scatterDiv.appendChild(document.createTextNode('No valid data for essay vs exam score scatter plot.'));
            return;
        }

        loadChartJs(() => {
            new Chart(canvas.getContext('2d'), {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Essay Scores vs Exam Scores',
                        data: points,
                        backgroundColor: 'rgba(78,78,78,0.9)',
                        borderColor: 'rgba(0,0,0,0.6)',
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: 'Essay Score' }, beginAtZero: true },
                        y: { title: { display: true, text: 'Exam Score' }, beginAtZero: true }
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
        loadData(); // should just work

        // for some reason the scatter plot doesn't load without this call
        loadChartJs(() => {
        });
    }, []);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // ensure selectedIndex is valid when jsonData changes
    useEffect(() => {
        if (!jsonData || !jsonData.length) {
            setSelectedIndex(0);
            return;
        }
        if (selectedIndex >= jsonData.length) setSelectedIndex(0);
    }, [jsonData, selectedIndex]);

    const studentNames = jsonData.map((u, i) => {
        const name = `${u['First Name'] || ''} ${u['Last Name'] || ''}`.trim();
        return name || `Student ${i + 1}`;
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden" }}>
            <noscript>Please enable Javascript to run this app.</noscript>
            <div id="topBar" style={{ display: "flex", width: "100%", backgroundColor: "#2563eb", maxWidth: "100%", textAlign: "center", boxSizing: "border-box" }}>
                <p>Welcome to the report page.</p>
            </div>
            <div className="display" style={{ height: "100%", flex: 1, backgroundColor: "lightblue", maxWidth: "100%" }}>
                <div style={{ display: "flex", width: "100%", height: "100%", boxSizing: "border-box" }}>
                    <div style={{ width: "20%", backgroundColor: "#19306a", padding: "10px", color: "#fff" }}>
                        <h2>Report Page/ Data Analytics</h2>
                        <p>Please select the student you wish to see analytics for.</p>

                        {/* dropdown select for student list */}
                        <div className="studentList">
                            <label htmlFor="studentSelect" style={{ color: "#fff", display: "block", marginBottom: 8 }}>Students</label>
                            <select
                                id="studentSelect"
                                value={selectedIndex}
                                onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
                                style={{ width: "100%", padding: "6px", borderRadius: 4 }}
                            >
                                {/* more error handing for nearly impossible cases, but necesary for edge cases */}
                                {studentNames.length === 0 ? ( 
                                    <option value={0} disabled>No students loaded</option>
                                ) : (
                                    studentNames.map((n, i) => <option key={i} value={i}>{n}</option>)
                                )}
                            </select>
                        </div>

                    </div>
                    <div style={{ width: "100%", backgroundColor: "lightyellow" }}>
                        <div style={{ display: "flex", width: "100%", height: "100%", boxSizing: "border-box" }}>
                            <div style={{ width: "20%", backgroundColor: "#fbfbfbff", color: "#000", padding: "10px", boxSizing: "border-box" }}>
                                <h2 style={{ margin: 0 }}>Student View</h2>
                                <p>Here you can see the details for the selected student.</p>

                                {/* table flipping, every field is displayed*/}
                                <div className="studentDetails">
                                    {jsonData.length === 0 ? (
                                        <div>No student data loaded yet.</div>
                                    ) : (
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                            <tbody>
                                                {FIELDS.map(field => (
                                                    <tr key={field} style={{ borderBottom: "1px solid #ccc" }}>
                                                        <th style={{ textAlign: "left", padding: "6px", verticalAlign: "top", width: "45%", background: "#e9e9e9", color: "#000" }}>{field}</th>
                                                        <td style={{ padding: "6px" }}>
                                                            {(() => {
                                                                const student = jsonData[selectedIndex] || {};
                                                                const val = student[field];
                                                                if (val === undefined || val === null) return '';
                                                                return typeof val === 'object' ? JSON.stringify(val) : String(val);
                                                            })()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                            </div>
                            <div style={{ width: "80%", backgroundColor: "#ffffff", padding: "20px", boxSizing: "border-box" }}>
                                <h2>Charts Showing Data</h2>
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
                        <li><a href="https://example.com/">Example</a></li>
                    </ul>
                    <div style={{ marginTop: "8px", fontSize: "0.9em", color: "#333" }}>
                        All rights reserved. By who, I do not know.
                    </div>
                </div>
            </div>
        </div>
    );
}
