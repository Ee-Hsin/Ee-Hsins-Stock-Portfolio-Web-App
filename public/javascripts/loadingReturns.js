const getReturns = async function(id){
    const res = await axios.get(`/portfolio/${id}/getReturns`);
    return res.data;
}

//Select ALL card bodies, then loop through them, take their id, and then add the returns to the child elements.

async function addReturns(){
    const cardBodies = document.querySelectorAll('.card-body');
    console.log(cardBodies);

    for (let cardBody of cardBodies){
        const returns = await getReturns(cardBody.id);
        // console.log(cardBody.id, returns)
        const returnsString = returns + '%';
        cardBody.children[4].children[0].innerText = returnsString;

        if (returns >0){
            cardBody.children[4].children[0].style.color = "#4ca54c"
        } else {
            cardBody.children[4].children[0].style.color = "#b51a28"
        }
    }
}

addReturns();