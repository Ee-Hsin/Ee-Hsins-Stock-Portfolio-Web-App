let ctx = document.getElementById('stockCategoryChart').getContext('2d');

let labels =['Large Cap Growth','Large Cap Predictable','Cyclical','Speculative Growth','Turnaround','ETF'];
let colorHex= ['#ed0909','#3c82c4', '#43AA8B', "#253D5B", '#FD3690','#ffd500'];

let myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        datasets: [{
            data: [38,35,5,3,5,14],
            backgroundColor: colorHex
        }],
        labels: labels
    },
    options: {
        responsive: true,
        legend: {
            position: 'bottom'
        }
    }
})