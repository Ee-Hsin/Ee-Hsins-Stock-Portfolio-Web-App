const getCurrentPriceAndReturns = async function(){
    const pathArray = window.location.pathname.split('/');
    const id = pathArray[2];
    const res = await axios.get(`/portfolio/${id}/getCurrentPriceAndReturns`);
    return res.data;
}

const getReturnsYTD = async function(){
    const pathArray = window.location.pathname.split('/');
    const id = pathArray[2];
    const res = await axios.get(`/portfolio/${id}/getReturnsYTD`);
    return res.data;
}

const getIV = async function(){
    //ASk the backend for the IV so we can calculate discount, if the backend responds with "notLoggedIn", that means user is not logged in, no need to calculate IV.
    const pathArray = window.location.pathname.split('/');
    const id = pathArray[2];
    const res = await axios.get(`/portfolio/${id}/getIV`);
    return res.data;
}

//Select ALL card bodies, then loop through them, take their id, and then add the returns to the child elements.

async function addReturnsPriceAndDiscount() {
    const performanceSection = document.querySelector('.row .performance-section');
    const selectedCurrPrice = document.querySelector('#currentPrice');
    const selectedIV = document.querySelector('#IV');


    const {currPrice, stockReturns} = await getCurrentPriceAndReturns();
    const returnsYTD = await getReturnsYTD();

    if (selectedIV){
        const IV = await getIV();
        const discount = (((parseFloat(IV)/currPrice)-1) * -100).toFixed(2);
        const selectedDiscount = document.querySelector('#discount');

        selectedDiscount.children[0].style.color = "";
        selectedDiscount.children[0].innerText = discount + '%';

        if (discount < 0.25){
            selectedDiscount.children[0].classList.add('undervalued');
        } else if(discount < 0){
            selectedDiscount.children[0].classList.add('signif-undervalued');
        }else {
            selectedDiscount.children[0].classList.add('overvalued');
            selectedDiscount.children[0].innerText += '(overvalued)';

        }
    }

    selectedCurrPrice.style.color = "";
    selectedCurrPrice.innerText = "Current Price: $" + currPrice;

    const selectedReturnsYTD = performanceSection.children[0].children[1];
    const selectedStockReturns = performanceSection.children[1].children[1];

    selectedReturnsYTD.style.color ="";
    selectedStockReturns.style.color ="";

    if(returnsYTD >= 0){
        selectedReturnsYTD.innerText = "+" + returnsYTD + "%";
        selectedReturnsYTD.classList.add('returns-positive');
    } else {
        selectedReturnsYTD.innerText = returnsYTD + "%";
        selectedReturnsYTD.classList.add('returns-negative');
    }

    if(stockReturns >= 0){
        selectedStockReturns.innerText = "+" + stockReturns + "%";
        selectedStockReturns.classList.add('returns-positive');
    } else {
        selectedStockReturns.innerText = stockReturns + "%";
        selectedStockReturns.classList.add('returns-negative');
    }
    // for (let cardBody of cardBodies){
    //     const returns = await getReturns(cardBody.id);
    //     // console.log(cardBody.id, returns)
    //     const returnsString = returns + '%';
    //     cardBody.children[4].children[0].innerText = returnsString;

    //     if (returns >0){
    //         cardBody.children[4].children[0].style.color = "#4ca54c"
    //     } else {
    //         cardBody.children[4].children[0].style.color = "#b51a28"
    //     }
    // }
}

addReturnsPriceAndDiscount();