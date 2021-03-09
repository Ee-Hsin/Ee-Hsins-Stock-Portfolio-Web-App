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

async function getPriceChartData() {
    const pathArray = window.location.pathname.split('/');
    const id = pathArray[2];
    const res = await axios.get(`/portfolio/${id}/getChartData`);
    chartPrices(res.data.prices,res.data.dates);
}


getPriceChartData();
chartEps([1,2,3,4,5],[5,6,7,8,9]);

