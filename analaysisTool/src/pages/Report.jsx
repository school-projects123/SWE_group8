import { useEffect, useRef, useState } from 'react';

export default function Upload() {
    const pieChart1Ref = useRef(null);
    const pieChart2Ref = useRef(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    let defaultFilename = '21755561_Pretend_Essay_Assignment.xls';

    function processExcelData(arrayBuffer) {
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, {type: 'array'});
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        // Show the Excel data in a table in the html.
        let userDiv = document.getElementById('userDiv');
        if (!userDiv) {
            userDiv = document.createElement('div');
            userDiv.id = 'userDiv';
            document.body.appendChild(userDiv);
        }
        let table = '<table border="1"><tr><th>Last Name</th><th>First Name</th><th>e-mail</th><th>Turnitin User ID</th><th>Title</th><th>Word Count</th><th>Date Uploaded</th><th>Grade</th><th>Similarity Score</th></tr>';
        jsonData.forEach(user => {
            table += `<tr>
                <td>${user['Last Name'] || ''}</td>
                <td>${user['First Name'] || ''}</td>
                <td>${user.Email || ''}</td>
                <td>${user['Turnitin User ID'] || ''}</td>
                <td>${user.Title || ''}</td>
                <td>${user['Word Count'] || ''}</td>
                <td>${user['Date Uploaded'] || ''}</td>
                <td>${user.Grade || ''}</td>
                <td>${user['Similarity Score'] || ''}</td>
            </tr>`;
        });
        table += '</table>';
        userDiv.innerHTML = table;

        // Show a bar chart to plot each user and their score, colour top scorers green, and worst red.
        const chartDiv = document.getElementById('chartDiv') || Object.assign(
            document.body.appendChild(document.createElement('div')),
            {id: 'chartDiv'}
        );
        chartDiv.innerHTML = ''; // Clear previous chart
        const canvas = Object.assign(document.createElement('canvas'), {id:'userScoreChart'});
        chartDiv.appendChild(canvas);

        // Prepare data for chart
        const users = jsonData.filter(u => typeof u.Grade === 'number' || !isNaN(parseFloat(u.Grade)));
        const labels = users.map(u => `${u['First Name'] || ''} ${u['Last Name'] || ''}`.trim());
        const scores = users.map(u => Number(u.Grade));
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        const backgroundColours = scores.map(score => {
            if (score === maxScore) return 'green';
            if (score === minScore) return 'red';
            return 'yellow';
        });

        loadChartJs(() => {
            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'User Scores',
                        data: scores,
                        backgroundColor: backgroundColours,
                        borderColor: 'black',
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {y:{beginAtZero:true}},
                    plugins: {
                        legend: {display: false}
                    }
                }
            });
        });
    }

    function getFilenameFromTopBarName() {
        const input = document.getElementById('fileInput');
        return (input && input.value.trim()) ? input.value.trim() : defaultFilename;
    }

    function getFilenameFromTopBarSelect() {
        const uploadInput = document.getElementById('uploadInput');
        if (uploadInput && uploadInput.files && uploadInput.files.length > 0) {
            const file = uploadInput.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                loadXlsxJs(() => processExcelData(e.target.result));
            };
            reader.readAsArrayBuffer(file);
            return null;
        }
        return defaultFilename;
    }

    function loadData(filename) {
        loadXlsxJs(() => {
            fetch(filename)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => processExcelData(arrayBuffer))
                .catch(error => console.error('Error fetching user data:', error));
        });
    }

    // Ensure Chart.js is loaded before using it.
    function loadChartJs(callback) {
        if (window.Chart) return callback();
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    function loadXlsxJs(callback) {
        if (window.XLSX) return callback();
        const script = document.createElement('script');
        script.src = 'xlsx.full.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    function plotWordCountVsScoreFromTable() {
        const table = document.querySelector('#userDiv table');
        if (!table) return;

        const rows = Array.from(table.rows).slice(1); // skip header
        const points = [];
        const labels = [];

        rows.forEach(row => {
            const wordCell = row.cells[5];
            const gradeCell = row.cells[7];
            const firstCell = row.cells[1];
            const lastCell = row.cells[0];

            if (!wordCell || !gradeCell) return;

            const wordText = wordCell.textContent.trim().replace(/,/g, '');
            const gradeText = gradeCell.textContent.trim().replace(/,/g, '');

            const wordNum = parseFloat(wordText);
            const gradeNum = parseFloat(gradeText);

            if (!isNaN(wordNum) && !isNaN(gradeNum)) {
                points.push({ x: wordNum, y: gradeNum });
                labels.push(`${firstCell ? firstCell.textContent.trim() : ''} ${lastCell ? lastCell.textContent.trim() : ''}`.trim());
            }
        });

        const scatterDiv = document.getElementById('scatterDiv') || Object.assign(
            document.body.appendChild(document.createElement('div')),
            { id: 'scatterDiv' }
        );
        scatterDiv.innerHTML = ''; // clear previous
        const canvas = Object.assign(document.createElement('canvas'), { id: 'wordcountScoreChart' });
        scatterDiv.appendChild(canvas);

        if (points.length === 0) {
            scatterDiv.appendChild(document.createTextNode('No valid Word Count / Score pairs to plot.'));
            return;
        }

        loadChartJs(() => {
            new Chart(canvas, {
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
                        x: { title: {display: true, text: 'Word Count'}, beginAtZero: true },
                        y: { title: {display: true, text: 'Score'},beginAtZero: true }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
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
        });
    }

    useEffect(() => {
        loadChartJs(() => {
            const Chart = window.Chart;
            const ctx1 = pieChart1Ref.current && pieChart1Ref.current.getContext('2d');
            if (ctx1 && Chart) {
                new Chart(ctx1, {
                    type: 'pie',
                    data: {
                        labels: ['Grade A', 'Grade B', 'Grade C'],
                        datasets: [{
                            data: [50, 20, 40],
                            backgroundColor: ['#ff6384', '#36a2eb', '#58ff56'],
                        }]
                    }
                });
            }
            const ctx2 = pieChart2Ref.current && pieChart2Ref.current.getContext('2d');
            if (ctx2 && Chart) {
                new Chart(ctx2, {
                    type: 'pie',
                    data: {
                        labels: ['Grade A', 'Grade B', 'Grade C'],
                        datasets: [{
                            data: [30, 100, 20],
                            backgroundColor: ['#ff6384', '#36a2eb', '#58ff56'],
                        }]
                    }
                });
            }
        });

        // Setup event listeners for topBar (for loading files in)
        const loadButton = document.getElementById('loadButton');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                const filename = getFilenameFromTopBarName();
                loadData(filename);
            });
        }
        const uploadInput = document.getElementById('uploadInput');
        if (uploadInput) {
            uploadInput.addEventListener('change', () => {
                const filename = getFilenameFromTopBarSelect();
                if (filename) loadData(filename);
            });
        }
        loadData(defaultFilename); // either way this loads the default data on first load

        // Watch for the main user-score chart being created and trigger the wordcount vs score plot.
        // Use a dataset flag on the main canvas so we re-create the plot each time the main chart is rebuilt.
        const userChartObserver = new MutationObserver(() => {
            const mainCanvas = document.getElementById('userScoreChart');
            if (mainCanvas && !mainCanvas.dataset.wordcountPlotted) {
                plotWordCountVsScoreFromTable();
                mainCanvas.dataset.wordcountPlotted = '1';
            }
        });

        userChartObserver.observe(document.body, { childList: true, subtree: true });

        // If the chart already exists at script load (e.g. on a late include), plot immediately.
        const existing = document.getElementById('userScoreChart');
        if (existing && !existing.dataset.wordcountPlotted) {
            plotWordCountVsScoreFromTable();
            existing.dataset.wordcountPlotted = '1';
        }
    }, []);

    return (
        <div>
            {/* Note: meta/title elements belong in the document head; use react-helmet if needed */}
            <div id="header" style={{ textAlign: "center", backgroundColor: "blue", padding: "2px" }}>
                <h1>Report Branch - Data Analytics</h1>
            </div>
            <noscript>Please enable Javascript to run this app.</noscript>
            <div id="topBar" style={{ display: "flex", width: "100%", backgroundColor: "darkgrey" }}>
                <div style={{ flex: 1, textAlign: "center", padding: "5px" }}>
                    <label htmlFor="fileInput">Enter filename (or leave blank for default): </label>
                    <input type="text" id="fileInput" placeholder="21755561_Pretend_Essay_Assignment.xls" />
                    <button id="loadButton">Load Data</button>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "5px" }}>
                    <label htmlFor="uploadInput">Or select a file: </label>
                    <input type="file" id="uploadInput" style={{ display: "none" }} />
                    <button id="browseButton" onClick={() => document.getElementById('uploadInput').click()}>Browse...</button>
                </div>
            </div>
            <div className="display" style={{ height: "100%", flex: 1, backgroundColor: "lightblue" }}>
                <div style={{ display: "flex", width: "100%", height: "100%" }}>
                    <div style={{ width: "20%", backgroundColor: "black", padding: "10px", boxSizing: "border-box" }}>
                        <h2>Sidebar Menu</h2>
                        <p>As this is jsx, that means .html still doesn't work, so there is no point leaving that here, plus the links show up at the top, or at least they do for me.</p>
                        <h3>Explanatory Text</h3>
                        <p>There is different text on the version of this file found on the <a href="https://github.com/school-projects123/SWE_group8/tree/Special-Branch">special branch</a>, which can be viewed there.</p>
                        <p>The data from the xls(x) files can be read in by the javascript, which creates a table, a bar chart from the data (where the scores are shown with bars, the highest score in green, lowest in red, and the rest in yellow), and a plot (where the word counts are plotted against the scores) (all shown in this web-page).</p> 
                        <p>The plan is to gradually align this file (analytics.html) with the design of the file upload file from the other branch (in the process making it look decent).</p>
                        <p>Note: if you typed a file name into the prompt and it is now showing nothing, press enter with the text box blank (so it uses the default) or copy and paste '21755561_Pretend_Essay_Assignment.xls' into the prompt. You can also try 'gc_PS5906_25_SANDPIT_fullgc_2025-10-07-13-12-38.xls' to compare.</p>
                    </div>
                    <div style={{ width: "80%", backgroundColor: "lightyellow", boxSizing: "border-box" }}>
                        <h2 style={{ margin: 1, textAlign: "center", padding: 0, lineHeight: 1 }}>Report</h2>
                        <div style={{ display: "flex", width: "100%", height: "80%" }}>
                            <div style={{ width: "20%", backgroundColor: "coral", padding: "10px", boxSizing: "border-box" }}>
                                <h2 style={{ margin: 0 }}>Grades</h2>
                                <h3>Course 1</h3>
                                <canvas ref={pieChart1Ref} id="pieChart1" width="200" height="200"></canvas>
                                <h3>Course 2</h3>
                                <canvas ref={pieChart2Ref} id="pieChart2" width="200" height="200"></canvas>
                            </div>
                            <div style={{ width: "80%", backgroundColor: "coral", padding: "20px", boxSizing: "border-box" }}>
                                <h2>Actual Charts</h2>
                                <div id="chartDiv"></div>
                                <div id="userDiv"></div>
                                <div id="scatterDiv"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="bottomBar" style={{ display: "flex", width: "100%", backgroundColor: "lightgray" }}>
                <div style={{ flex: 1, textAlign: "center", padding: "10px" }}>
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
    )
}