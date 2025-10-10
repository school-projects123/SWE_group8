// request User ID number first via prompt
let userId = prompt("Please enter your User ID number (1-5):");
if (userId === null) {
    userId = 1; // Default to 1 if cancelled
} else {
    userId = parseInt(userId);
    if (isNaN(userId) || userId < 1 || userId > 5) {
        userId = 1; // Default to 1 if invalid input
    }
}

// fetch user with ID from userdata.json
fetch('userdata.json')
    .then(response => response.json())
    .then(data => {
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
    })
    .catch(error => console.error('Error fetching user data:', error));

// show the userdata.json in a table in the html
fetch('userdata.json')
    .then(response => response.json())
    .then(data => {
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
    })
    .catch(error => console.error('Error fetching user data:', error));

// Ensure Chart.js is loaded before using it
function loadChartJs(callback) {
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'Chart.js';
        script.onload = callback;
        document.head.appendChild(script);
    } else {
        callback();
    }
}

// Show a bar chart to plot their favourite colours as example data
fetch('userdata.json')
    .then(response => response.json())
    .then(data => {
        // Count occurrences of each favourite colour
        const colourCounts = {};
        const colourBarMap = {};
        data.forEach(user => {
            const colour = user.favColour;
            if (colour) {
            colourCounts[colour] = (colourCounts[colour] || 0) + 1;
            colourBarMap[colour] = colour; // Map label to its colour
            }
        });
        // Prepare data for Chart.js
        const labels = Object.keys(colourCounts);
        const counts = Object.values(colourCounts);
        // Create a canvas element for the chart inside the div
        let chartDiv = document.getElementById('chartDiv');
        if (!chartDiv) {
            chartDiv = document.createElement('div');
            chartDiv.id = 'chartDiv';
            document.body.appendChild(chartDiv);
        }
        const canvas = document.createElement('canvas');
        canvas.id = 'favColourChart';
        chartDiv.appendChild(canvas);

        // Load Chart.js and render the bar chart
        loadChartJs(() => {
            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Favourite Colours',
                        data: counts,
                        backgroundColor: labels.map(colour => colourBarMap[colour]),
                        borderColor: labels.map(colour => colourBarMap[colour]+'6'), // Slightly transparent border
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        });
    })
    .catch(error => console.error('Error fetching user data:', error));
