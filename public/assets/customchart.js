var chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

function newDate(ms) {
    return moment().add(ms, 'ms');
}

function randomScalingFactor() {
    return Math.round(Math.random() * 100);
}

function onRefresh() {
    config.data.datasets.forEach(function (dataset) {
        dataset.data.push({
            x: moment(),
            y: randomScalingFactor()
        });
    });
}

var color = Chart.helpers.color;
var config = {
    type: 'line',
    data: {
        datasets: [{
            label: 'Sell',
            backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
            borderColor: chartColors.red,
            fill: false,
            lineTension: 0,
            // borderDash: [8, 4],
            data: []
        }, {
            label: 'Buy',
            backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
            borderColor: chartColors.blue,
            fill: false,
            cubicInterpolationMode: 'monotone',
            data: []
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'BTC/USD'
        },
        scales: {
            xAxes: [{
                type: 'realtime',
                display: true,
            }],
            yAxes: [{
                type: 'linear',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'USD'
                }
            }]
        },
        tooltips: {
            intersect: false
        },
        hover: {
            mode: 'nearest',
            intersect: false
        },
        plugins: {
            streaming: {
                duration: 20000,
                refresh: 1000,
                delay: 2000,
                onRefresh: onRefresh
            }
        }
    }
};

window.onload = function () {
    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);
};