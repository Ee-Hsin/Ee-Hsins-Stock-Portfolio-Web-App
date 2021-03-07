const {prices, dates} = chartData;
function chartIt(){

    console.log(prices);
    console.log(dates);
    const ctx = document.getElementById('chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Close Price',
                data: prices,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)',
                ],
                borderWidth: 1
            }]
        },
    });
} 
console.log("Prices:", prices);
console.log("Dates:", dates);
if (prices && dates){
    chartIt();
}