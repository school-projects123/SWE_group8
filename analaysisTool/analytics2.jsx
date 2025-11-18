import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Assuming Chart.js is installed or loaded globally
import * as XLSX from 'xlsx'; // Assuming XLSX is installed or loaded globally

const defaultFilename = '21755561_Pretend_Essay_Assignment.xls';

export default function Analytics() {
    const pie1Ref = useRef(null);
    const pie2Ref = useRef(null);
    const uploadInputRef = useRef(null);
    const barChartRef = useRef(null);
    const scatterChartRef = useRef(null);

    const [data, setData] = useState([]);
    const [filename, setFilename] = useState(defaultFilename);
    const [chartData, setChartData] = useState({ labels: [], scores: [], colors: [] });

    // Load default data on mount
    useEffect(() => {
        loadData(defaultFilename);
    }, []);

    // Create bar chart when data changes
    useEffect(() => {
        if (chartData.labels.length > 0 && barChartRef.current) {
            new Chart(barChartRef.current, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'User Scores',
                        data: chartData.scores,
                        backgroundColor: chartData.colors,
                        borderColor: 'black',
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: { y: { beginAtZero: true } },
                    plugins: { legend: { display: false } }
                }
            });
        }
    }, [chartData]);

    // Create scatter plot when bar chart is ready (simplified trigger)
    useEffect(() => {
        if (data.length > 0 && scatterChartRef.current) {
            plotWordCountVsScore();
        }
    }, [data]);

    const processExcelData = (arrayBuffer) => {
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        setData(jsonData);

        // Prepare bar chart data
        const users = jsonData.filter(u => typeof u.Grade === 'number' || !isNaN(parseFloat(u.Grade)));
        const labels = users.map(u => `${u['First Name'] || ''} ${u['Last Name'] || ''}`.trim());
        const scores = users.map(u => Number(u.Grade));
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        const colors = scores.map(score => {
            if (score === maxScore) return 'green';
            if (score === minScore) return 'red';
            return 'yellow';
        });
        setChartData({ labels, scores, colors });
    };

    const loadData = (filename) => {
        fetch(filename)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.arrayBuffer();
            })
            .then(processExcelData)
            .catch(error => console.error('Error fetching user data:', error));
    };

    const handleBrowse = () => {
        const input = document.getElementById('fileInput');
        const filename = (input && input.value.trim()) ? input.value.trim() : defaultFilename;
        setFilename(filename);
        loadData(filename);
    };

    const handleLoad = () => {
        if (uploadInputRef.current && uploadInputRef.current.files.length > 0) {
            const file = uploadInputRef.current.files[0];
            const reader = new FileReader();
            reader.onload = (e) => processExcelData(e.target.result);
            reader.readAsArrayBuffer(file);
        } else {
            loadData(filename);
        }
    };

    const plotWordCountVsScore = () => {
        const points = [];
        const labels = [];
        data.forEach(user => {
            const wordNum = parseFloat((user['Word Count'] || '').toString().replace(/,/g, ''));
            const gradeNum = parseFloat((user.Grade || '').toString().replace(/,/g, ''));
            if (!isNaN(wordNum) && !isNaN(gradeNum)) {
                points.push({ x: wordNum, y: gradeNum });
                labels.push(`${user['First Name'] || ''} ${user['Last Name'] || ''}`.trim());
            }
        });

        if (points.length === 0) return;

        new Chart(scatterChartRef.current, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Word Count vs Score',
                    data: points,
                    backgroundColor: 'rgba(78, 78, 78, 0.9)',
                    borderColor: 'rgba(0,0,0,0.6)',
                    pointRadius: 6
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Word Count' }, beginAtZero: true },
                    y: { title: { display: true, text: 'Score' }, beginAtZero: true }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const idx = context.dataIndex;
                                const lbl = labels[idx] || '';
                                const x = context.raw.x;
                                const y = context.raw.y;
                                return lbl ? `${lbl}: (${x}, ${y})` : `(${x}, ${y})`;
                            }
                        }
                    }
                }
            }
        });
    };

    return (
        <div>
            {/* Header */}
            <header>
                <h1>Analysis Tool</h1>
            </header>

            {/* Top Bar */}
            <div className="top-bar">
                <input type="text" id="fileInput" placeholder="Enter filename" />
                <button onClick={handleBrowse}>Browse</button>
                <input type="file" ref={uploadInputRef} accept=".xls,.xlsx" onChange={handleLoad} />
                <button onClick={handleLoad}>Load</button>
            </div>

            {/* Sidebar */}
            <aside className="sidebar">
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="analytics.html">Analytics</a></li>
                    <li><a href="about.html">About</a></li>
                </ul>
            </aside>

            {/* Main Content */}
            <main>
                {/* Pie Charts */}
                <div className="charts">
                    <canvas ref={pie1Ref}></canvas>
                    <canvas ref={pie2Ref}></canvas>
                </div>

                {/* User Data Table */}
                <div id="userDiv">
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Last Name</th>
                                <th>First Name</th>
                                <th>e-mail</th>
                                <th>Turnitin User ID</th>
                                <th>Title</th>
                                <th>Word Count</th>
                                <th>Date Uploaded</th>
                                <th>Grade</th>
                                <th>Similarity Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((user, index) => (
                                <tr key={index}>
                                    <td>{user['Last Name'] || ''}</td>
                                    <td>{user['First Name'] || ''}</td>
                                    <td>{user.Email || ''}</td>
                                    <td>{user['Turnitin User ID'] || ''}</td>
                                    <td>{user.Title || ''}</td>
                                    <td>{user['Word Count'] || ''}</td>
                                    <td>{user['Date Uploaded'] || ''}</td>
                                    <td>{user.Grade || ''}</td>
                                    <td>{user['Similarity Score'] || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bar Chart */}
                <div id="chartDiv">
                    <canvas ref={barChartRef}></canvas>
                </div>

                {/* Scatter Plot */}
                <div id="scatterDiv">
                    <canvas ref={scatterChartRef}></canvas>
                </div>
            </main>

            {/* Footer */}
            <footer>
                <p>&copy; 2023 Analysis Tool</p>
            </footer>
        </div>
    );
}