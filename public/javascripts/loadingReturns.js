const getCurrentPriceAndReturns = async function(id){
    const res = await axios.get(`/portfolio/${id}/getCurrentPriceAndReturns`);
    return res.data;
}

//Select ALL card bodies, then loop through them, take their id, and then add the returns to the child elements.

async function addReturns(){
    const cardBodies = document.querySelectorAll('.card-body');

    for (let cardBody of cardBodies){
        const {stockReturns} = await getCurrentPriceAndReturns(cardBody.id);
        // console.log(cardBody.id, returns)
        const returnsString = stockReturns + '%';
        cardBody.children[4].children[0].innerText = returnsString;

        if (stockReturns >0){
            cardBody.children[4].children[0].style.color = "#4ca54c"
        } else {
            cardBody.children[4].children[0].style.color = "#b51a28"
        }
    }
}

addReturns();