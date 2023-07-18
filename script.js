document.addEventListener('DOMContentLoaded', function () {
    fetch('speed_test_results.json')
        .then(response => response.json())
        .then(data => {
            createTable(data);
            createLineGraph(data);
            createSpeedsLineGraph(data);
            displayFileSize();
            const outageCount = countInternetOutages(data);
            displayOutageCount(outageCount);
            const dailyOutageAverage = calculateDailyOutageAverage(data);
            displayDailyOutageAverage(dailyOutageAverage);
            const downloadSpeedAverage = calculateAverageSpeed(data, 'download_speed');
            const uploadSpeedAverage = calculateAverageSpeed(data, 'upload_speed');
            displayAverageSpeeds(downloadSpeedAverage, uploadSpeedAverage);
        })
        .catch(error => console.error('Error fetching data:', error));
});

function createTable(data) {
    const table = $('#resultsTable').DataTable({
        data: data,
        columns: [
            { data: 'timestamp' },
            { data: 'download_speed', render: data => (data !== null ? data.toFixed(2) : '-') },
            { data: 'upload_speed', render: data => (data !== null ? data.toFixed(2) : '-') },
            { data: 'internet_status' }
        ],
        lengthMenu: [5, 10, 15, 25, 50, 100],
        pageLength: 25,
        order: [[0, 'desc']],
        searching: true,
    });
};

function createLineGraph(data) {
    const timestamps = data.map(item => item.timestamp);
    const availability = data.map(item => item.internet_status === 'Available');

    const ctx = document.getElementById('line-chart').getContext('2d');
    const lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Internet Availability',
                data: availability,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHitRadius: 10,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointHoverBorderColor: 'rgba(220, 220, 220, 1)',
                pointHoverBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        displayFormats: {
                            minute: 'HH:mm'
                        }
                    },
                    ticks: {
                        source: 'auto',
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                y: {
                    display: true,
                    ticks: {
                        stepSize: 1,
                        callback: (value) => value ? 'Available' : 'Unavailable'
                    }
                }
            }
        }
    });
}

function createSpeedsLineGraph(data) {
    const timestamps = data.map(item => item.timestamp);
    const downloadSpeeds = data.map(item => item.download_speed);
    const uploadSpeeds = data.map(item => item.upload_speed);

    const ctx = document.getElementById('speeds-chart').getContext('2d');
    const lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Download Speed (Mbps)',
                data: downloadSpeeds,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHitRadius: 10,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointHoverBorderColor: 'rgba(220, 220, 220, 1)',
                pointHoverBorderWidth: 2,
            }, {
                label: 'Upload Speed (Mbps)',
                data: uploadSpeeds,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHitRadius: 10,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointHoverBorderColor: 'rgba(220, 220, 220, 1)',
                pointHoverBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        displayFormats: {
                            minute: 'HH:mm'
                        }
                    },
                    ticks: {
                        source: 'auto',
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                y: {
                    display: true,
                    ticks: {
                        beginAtZero: true
                    }
                }
            }
        }
    });
}

function formatFileSize(sizeInBytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;
    while (sizeInBytes >= 1024 && index < sizes.length - 1) {
        sizeInBytes /= 1024;
        index++;
    }
    return `${sizeInBytes.toFixed(2)} ${sizes[index]}`;
}

function displayFileSize() {
    fetch('speed_test_results.json')
        .then(response => response.blob())
        .then(blob => {
            const fileSizeInBytes = blob.size;
            const formattedFileSize = formatFileSize(fileSizeInBytes);
            const fileSizeContainer = document.getElementById('file-size-container');
            fileSizeContainer.innerText = `Log File Size: ${formattedFileSize}`;
        })
        .catch(error => console.error('Error fetching file size:', error));
}

function countInternetOutages(data) {
    let outageCount = 0;
    for (const item of data) {
        if (item.internet_status === 'Unavailable') {
            outageCount++;
        }
    }
    return outageCount;
}

function calculateDailyOutageAverage(data) {
    const dailyCounts = {};

    for (const item of data) {
        const date = new Date(item.timestamp).toLocaleDateString();
        if (!dailyCounts[date]) {
            dailyCounts[date] = 0;
        }

        if (item.internet_status === 'Unavailable') {
            dailyCounts[date]++;
        }
    }

    const daysWithOutages = Object.keys(dailyCounts).length;
    const totalOutages = Object.values(dailyCounts).reduce((acc, count) => acc + count, 0);
    const dailyOutageAverage = totalOutages / daysWithOutages;

    return dailyOutageAverage;
}

function displayOutageCount(outageCount) {
    const outageCountContainer = document.getElementById('outage-count-container');
    outageCountContainer.innerText = `Internet Outages: ${outageCount}`;
}

function displayDailyOutageAverage(dailyOutageAverage) {
    const dailyOutageAverageContainer = document.getElementById('daily-outage-average-container');
    dailyOutageAverageContainer.innerText = `Daily Average Outages: ${dailyOutageAverage.toFixed(2)}`;
}

function calculateAverageSpeed(data, field) {
    const speeds = data.map(item => item[field]);
    const totalSpeed = speeds.reduce((total, speed) => total + speed, 0);
    const averageSpeed = totalSpeed / speeds.length;
    return averageSpeed;
}

function displayAverageSpeeds(downloadSpeedAverage, uploadSpeedAverage) {
    const averageSpeedsContainer = document.getElementById('average-speeds-container');
    averageSpeedsContainer.innerHTML = `<p>Average Download Speed: ${downloadSpeedAverage.toFixed(2)} Mbps</p>
    <p>Average Upload Speed: ${uploadSpeedAverage.toFixed(2)} Mbps</p>
    `;
}