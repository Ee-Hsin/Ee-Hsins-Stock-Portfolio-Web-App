function chartIt(prices,dates){

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

async function getChartData() {
    console.log(window.location.pathname);
    const pathArray = window.location.pathname.split('/');
    const id = pathArray[2];
    console.log(id);
    console.log(`/${id}/getChartData`);
    const res = await axios.get(`/portfolio/${id}/getChartData`);
    chartIt(res.data.prices,res.data.dates);
}


getChartData();

