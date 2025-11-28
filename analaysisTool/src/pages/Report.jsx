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

        const MAX_ROWS = 15; // show only the first 15 rows, just in case this is a large file
        // plus all this is displayed on the spreadsheet page anyway

        let userDiv = document.getElementById('userDiv');
        if (!userDiv) {
            userDiv = document.createElement('div');
            userDiv.id = 'userDiv';
            document.body.appendChild(userDiv);
        }
        // create a compact container for the table
        const tableContainer = document.createElement('div');
        tableContainer.style.maxHeight = '220px';
        tableContainer.style.maxWidth = '100%';
        tableContainer.style.overflow = 'auto';
        tableContainer.style.fontSize = '12px';
        tableContainer.style.lineHeight = '1.2';
        tableContainer.style.marginBottom = '8px';

        let table = '<table style="border-collapse:collapse;font-size:12px" border="1"><tr>'
            + '<th>Last</th><th>First</th><th>Email</th><th>Turnitin ID</th><th>Title</th><th>Words</th><th>Date</th><th>Grade</th><th>Sim</th>'
            + '</tr>';

        jsonData.slice(0, MAX_ROWS).forEach(user => {
            table += `<tr>
                <td>${user['Last Name'] || ''}</td>
                <td>${user['First Name'] || ''}</td>
                <td>${user.Email || ''}</td>
                <td>${user['Turnitin User ID'] || ''}</td>
                <td>${(user.Title || '').toString().slice(0, 30)}</td>
                <td>${user['Word Count'] || ''}</td>
                <td>${user['Date Uploaded'] || ''}</td>
                <td>${user.Grade || ''}</td>
                <td>${user['Similarity Score'] || ''}</td>
            </tr>`;
        });
        table += '</table>';
        tableContainer.innerHTML = table;

        if (jsonData.length > MAX_ROWS) { // if there are more rows, add 'show all'
            const more = document.createElement('div');
            more.style.fontSize = '12px';
            more.style.marginTop = '4px';
            const btn = document.createElement('button');
            btn.textContent = `Show all (${jsonData.length})`;
            btn.style.fontSize = '12px';
            btn.onclick = () => {
                tableContainer.innerHTML = '<table style="border-collapse:collapse;font-size:12px" border="1"><tr>'
                    + '<th>Last</th><th>First</th><th>Email</th><th>Turnitin ID</th><th>Title</th><th>Words</th><th>Date</th><th>Grade</th><th>Sim</th>'
                    + '</tr>' + jsonData.map(user => `<tr>
                        <td>${user['Last Name'] || ''}</td>
                        <td>${user['First Name'] || ''}</td>
                        <td>${user.Email || ''}</td>
                        <td>${user['Turnitin User ID'] || ''}</td>
                        <td>${(user.Title || '').toString().slice(0, 60)}</td>
                        <td>${user['Word Count'] || ''}</td>
                        <td>${user['Date Uploaded'] || ''}</td>
                        <td>${user.Grade || ''}</td>
                        <td>${user['Similarity Score'] || ''}</td>
                    </tr>`).join('') + '</table>';
                more.remove();
            };
            more.appendChild(btn);
            tableContainer.appendChild(more);
        }

        userDiv.innerHTML = ''; // replace previous content, clear it
        userDiv.appendChild(tableContainer);

        // compact chart area
        const chartDiv = document.getElementById('chartDiv') || Object.assign(
            document.body.appendChild(document.createElement('div')),
            {id: 'chartDiv'}
        );
        chartDiv.innerHTML = ''; // clear previous chart, this used to cause issues

        // create a smaller canvas
        const canvas = Object.assign(document.createElement('canvas'), { id: 'userScoreChart' });
        canvas.style.width = '480px';
        canvas.style.maxWidth = '80%'; // WIDTH FOR THE BAR CHART!
        canvas.style.height = '240px';
        canvas.width = 480;
        canvas.height = 240;
        chartDiv.appendChild(canvas);

        // prepare data for chart (robust parsing!)
        const users = jsonData
            .map(u => ({ name: `${u['First Name'] || ''} ${u['Last Name'] || ''}`.trim(), grade: parseFloat(u.Grade) }))
            .filter(u => !isNaN(u.grade));

        const labels = users.map(u => u.name || 'Unknown');
        const scores = users.map(u => u.grade);
        const maxScore = scores.length ? Math.max(...scores) : 0;
        const minScore = scores.length ? Math.min(...scores) : 0;

        const backgroundColours = scores.map(score => {
            if (score === maxScore) return 'green';
            if (score === minScore) return 'red';
            return 'rgba(255, 206, 86, 0.9)'; // muted yellow, ie middling scores
        });

        loadChartJs(() => {
            // ensure the chart canvas uses 80% of its container width
            canvas.style.width = '30%';
            canvas.style.maxWidth = '30%';

            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'User Scores',
                        data: scores,
                        backgroundColor: backgroundColours,
                        borderColor: 'black',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'x',
                    responsive: true, // allow chart to scale to canvas style width
                    maintainAspectRatio: false, // use the canvas height/width as-is
                    scales: {
                        x: { ticks: { maxRotation: 45, minRotation: 0 }, grid: { display: false } },
                        y: { beginAtZero: true, ticks: { stepSize: 10 } }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { bodyFont: { size: 12 } }
                    }
                }
            });
        });
    }

    function getFilenameFromTopBarName() {
        const input = document.getElementById('fileInput');
        return (input && input.value.trim()) ? input.value.trim() : defaultFilename; // returns the default if blank
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
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js'; // its easier to load it from CDN because if you try loading it locally while its hosted then it can't access it
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

        // container to control the visual width of the chart, this helps somewhat
        const container = document.createElement('div');
        container.style.width = '150%';
        container.style.margin = '0 auto';
        // Cap the width here:
        container.style.maxWidth = '480px';   // <-- cap to 480px
        // container.style.maxWidth = '60%';  // <-- or cap to 60% of parent (uncomment preferred)
        scatterDiv.appendChild(container);

        const canvas = Object.assign(document.createElement('canvas'), { id: 'wordcountScoreChart' });
        // make the canvas fill the container; Chart.js will size to the parent when responsive:true
        canvas.style.width = '80%';
        canvas.style.height = '320px'; // visual height; Chart will respect this when maintainAspectRatio:false
        container.appendChild(canvas);

        if (points.length === 0) { // no (valid) data
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

    useEffect(() => { // this does't read data, YET, TO DO
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
                            data: [30, 99, 20],
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
        <div style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden" }}>
            {/* Note: meta/title elements belong in the document head; use react-helmet if needed */}
            <noscript>Please enable Javascript to run this app.</noscript>
            <div id="topBar" style={{ display: "flex", width: "100%", backgroundColor: "darkgrey", maxWidth: "100%" }}>
                <div style={{ flex: 1, textAlign: "center", padding: "5px" }}>
                    <label htmlFor="fileInput">Enter filename (or leave blank for default): </label>
                    <input type="text" id="fileInput" placeholder="21755561_Pretend_Essay_Assignment.xls" />
                    <button id="loadButton" style={{ marginLeft: "5px" }}>Load Data</button>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "5px" }}>
                    <label htmlFor="uploadInput">Or select a file: </label>
                    <input type="file" id="uploadInput" style={{ display: "none" }} />
                    <button id="browseButton" onClick={() => document.getElementById('uploadInput').click()}>Browse...</button>
                </div>
            </div>
            <div className="display" style={{ height: "100%", flex: 1, backgroundColor: "lightblue", maxWidth: "100%" }}>
                <div style={{ display: "flex", width: "100%", height: "100%", boxSizing: "border-box" }}>
                    <div style={{ width: "20%", backgroundColor: "#2563eb", padding: "10px" }}>
                        <h2>Report Page/ Data Analytics</h2>
                        <p>As this is jsx, that means .html still doesn't work, so there is no point leaving that here, plus the links show up at the top, or at least they do for me.</p>
                        <h3>Explanatory Text</h3>
                        <p>There is different text on the version of this file found on the <a href="https://github.com/school-projects123/SWE_group8/tree/Special-Branch">Special-Branch</a>, which can be viewed there. This version is being worked on in the <a href="https://github.com/school-projects123/SWE_group8/tree/Report_branch">Report_branch</a>.</p>
                        <p>The data from the xls(x) files can be read in by the javascript, which creates a table, a bar chart from the data (where the scores are shown with bars, the highest score in green, lowest in red, and the rest in yellow), and a plot (where the word counts are plotted against the scores) (all shown in this web-page).</p> 
                        <p>The plan is to gradually align this file (analytics.html) with the design of the file upload file from the other branch (in the process making it look decent).</p>
                        <p>Note: if you typed a file name into the prompt and it is now showing nothing, press enter with the text box blank (so it uses the default) or copy and paste '21755561_Pretend_Essay_Assignment.xls' into the prompt. You can also try 'gc_PS5906_25_SANDPIT_fullgc_2025-10-07-13-12-38.xls' to compare.</p>
                    </div>
                    <div style={{ width: "100%", backgroundColor: "lightyellow" }}>
                        <div style={{ display: "flex", width: "100%", height: "100%", boxSizing: "border-box" }}>
                            <div style={{ width: "20%", backgroundColor: "#19306a", padding: "10px", boxSizing: "border-box" }}>
                                <h2 style={{ margin: 0 }}>Grades</h2>
                                <h3>Course 1</h3>
                                <canvas ref={pieChart1Ref} id="pieChart1" width="200" height="200"></canvas>
                                <h3>Course 2</h3>
                                <canvas ref={pieChart2Ref} id="pieChart2" width="200" height="200"></canvas>
                            </div>
                            <div style={{ width: "80%", backgroundColor: "#19306a", padding: "20px", boxSizing: "border-box" }}>
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
    )
}