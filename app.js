let userId = parseInt(prompt("Please enter your User ID number (1-11):")) || 1; // Get userID, default to 1
if (userId < 1 || userId > 11) userId = 1;

// Fetch userdata.json just once to make things efficient.
fetch('userdata.json')
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        // Show greeting for user.
        const user = data.find(u => u.id === userId);
        if (user) {
            let topBar = document.getElementById('topBar');
            if (!topBar) {
                topBar = document.createElement('div');
                topBar.id = 'topBar';
                document.body.prepend(topBar);
            }
            topBar.innerHTML = `<h2>Hello, ${user.name}!</h2>`;
        }

        // Show the userdata.json in a table in the html.
        let userDiv = document.getElementById('userDiv');
        if (!userDiv) {
            userDiv = document.createElement('div');
            userDiv.id = 'userDiv';
            document.body.appendChild(userDiv);
        }
        let table = '<table border="1"><tr><th>ID</th><th>Name</th><th>Department</th><th>Email</th><th>Phone</th></tr>';
        data.forEach(user => {
            table += `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.department}</td><td>${user.email}</td><td>${user.phone}</td></tr>`;
        });
        table += '</table>';
        userDiv.innerHTML = table;

        // Show a bar chart to plot their favourite colours as example data.
        const colourCounts = {};
        const colourBarMap = {};
        for (const {favColour:colour} of data) {
            if (!colour) continue;
            colourCounts[colour] = (colourCounts[colour] || 0) + 1;
            colourBarMap[colour] = colour;
        }
        const labels = Object.keys(colourCounts);
        const counts = Object.values(colourCounts);
        const chartDiv = document.getElementById('chartDiv') || Object.assign(
            document.body.appendChild(document.createElement('div')),
            {id: 'chartDiv'}
        );
        const canvas = Object.assign(document.createElement('canvas'), {id:'favColourChart'});
        chartDiv.appendChild(canvas);
        loadChartJs(() => {
            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Favourite Colours',
                        data: counts,
                        backgroundColor: labels.map(c => colourBarMap[c]),
                        borderColor: 'black',
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {y:{beginAtZero:true}}
                }
            });
        });
    })
    .catch(error => console.error('Error fetching user data:', error));

// Ensure Chart.js is loaded before using it.
function loadChartJs(callback) {
    if (window.Chart) return callback();
    const script = document.createElement('script');
    script.src = 'Chart.js';
    script.onload = callback;
    document.head.appendChild(script);
}
