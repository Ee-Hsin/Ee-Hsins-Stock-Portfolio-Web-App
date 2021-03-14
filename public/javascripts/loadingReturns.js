const getCurrentPriceAndReturns = async function(id){
    const res = await axios.get(`/portfolio/${id}/getCurrentPriceAndReturns`);
    return res.data;
}

const getTotalReturns = async function(){
    const res = await axios.get(`/portfolio/getTotalReturns`);
    console.log(res.data);
    return res.data;
}
//Select ALL card bodies, then loop through them, take their id, and then add the returns to the child elements.

async function addReturns(){
    const cardBodies = document.querySelectorAll('.card-body');
    let count = 0;
    for (let cardBody of cardBodies){
        if (count === 0){
            count += 1;
        } else{
            const {stockReturns} = await getCurrentPriceAndReturns(cardBody.id);
            // console.log(cardBody.id, returns)
            const returnsString = stockReturns + '%';
            cardBody.children[4].children[0].innerText = returnsString;
            cardBody.children[4].children[0].classList.remove('loading');
    
            if (stockReturns >0){
                cardBody.children[4].children[0].classList.add('returns-positive');
            } else {
                cardBody.children[4].children[0].style.color.add('returns-negative');
            }
        }
    }
}

async function addTotalReturns(){
    const selectedTotalReturns = document.querySelector('#totalReturns');
    const {totalReturns} = await getTotalReturns();
    const returnsString = totalReturns + '%';
    selectedTotalReturns.classList.remove('loading');
    selectedTotalReturns.innerText = returnsString;

    if (totalReturns >0){
        selectedTotalReturns.classList.add('returns-positive');
    } else {
        selectedTotalReturns.classList.add('returns-negative');
    }

}

addTotalReturns();
addReturns();