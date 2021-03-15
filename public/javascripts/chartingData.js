function chartPrices(prices,dates){

    const ctx = document.getElementById('priceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Close Price',
                data: prices,
                backgroundColor: [
                    'rgba(0, 0, 0, 0)',
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    fontColor: 'black',
                    fontFamily: "'Economica', sans-serif"
                }
            }
        }
    });
} 

function chartEps(eps,dates){

    const ctx = document.getElementById('epsChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Earnings Per Share',
                data: eps,
                backgroundColor: [
                    'rgba(0, 0, 0, 0.1)',
                ],
                borderColor: [
                    'rgba(0, 0, 0, 0.1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    fontColor: 'black'
                }
            },
            scales :{
                yAxes:[{
                    ticks:{
                        beginAtZero: true
                    }
                }]
            }
        }
    });
} 

async function getPriceChartData() {
    const pathArray = window.location.pathname.split('/');
    const id = pathArray[2];
    const res = await axios.get(`/portfolio/${id}/getChartData`);
    chartPrices(res.data.prices,res.data.dates);
}


getPriceChartData();
