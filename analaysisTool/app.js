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

// Setup event listeners for topBar (for loading files in)
window.addEventListener('DOMContentLoaded', () => {
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
});

// Ensure Chart.js is loaded before using it.
function loadChartJs(callback) {
    if (window.Chart) return callback();
    const script = document.createElement('script');
    script.src = 'Chart.js';
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

    const innerDiv = document.getElementById('innerDiv') || Object.assign(
        document.body.appendChild(document.createElement('div')),
        { id: 'innerDiv' }
    );
    innerDiv.innerHTML = ''; // clear previous
    const canvas = Object.assign(document.createElement('canvas'), { id: 'wordcountScoreChart' });
    innerDiv.appendChild(canvas);

    if (points.length === 0) {
        innerDiv.appendChild(document.createTextNode('No valid Word Count / Score pairs to plot.'));
        return;
    }

    loadChartJs(() => {
        new Chart(canvas, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Word Count vs Score',
                    data: points,
                    backgroundColor: 'rgba(54, 162, 235, 0.9)',
                    borderColor: 'rgba(0,0,0,0.6)',
                    pointRadius: 6
                }]
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Word Count' },
                        beginAtZero: true
                    },
                    y: {
                        title: { display: true, text: 'Score' },
                        beginAtZero: true
                    }
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