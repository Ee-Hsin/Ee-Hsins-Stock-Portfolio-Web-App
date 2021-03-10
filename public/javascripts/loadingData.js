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

const getFinancials = async function() {
    const pathArray = window.location.pathname.split('/');
    const id = pathArray[2];
    const res = await axios.get(`/portfolio/${id}/getFinancials`);
    return res.data;
}

//Select ALL card bodies, then loop through them, take their id, and then add the returns to the child elements.

async function addReturnsPriceAndDiscount() {
    const performanceSection = document.querySelector('.row .performance-section');
    const selectedCurrPrice = document.querySelector('#currentPrice');
    const selectedIV = document.querySelector('#IV');


    const {currPrice, stockReturns} = await getCurrentPriceAndReturns();
    const returnsYTD = await getReturnsYTD();

    //If IV is shown, this adds the Discount.
    if (selectedIV){
        const IV = await getIV();
        const discount = (((parseFloat(IV)/currPrice)-1) * -100).toFixed(2);
        const selectedDiscount = document.querySelector('#discount');

        selectedDiscount.children[0].classList.remove('loading');//LOADING
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


    //This adds the current price
    selectedCurrPrice.classList.remove('loading');//LOADING
    selectedCurrPrice.innerText = "Current Price: $" + currPrice;

    //This adds the performance/returns
    const selectedReturnsYTD = performanceSection.children[0].children[1];
    const selectedStockReturns = performanceSection.children[1].children[1];

    //Removes styles from the loading... sign
    selectedReturnsYTD.classList.remove('loading');//LOADING
    selectedStockReturns.classList.remove('loading');//LOADING

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
}

//Add all the financials, and call the chartEps function
async function addFinancials(){
    const {currentRatio, debtOverEquity, longTermDebtOverEquity, returnOnEquity, epsPast5Y, historicalEps} = await getFinancials();
    
    //Adds ROE:
    const selectedROE = document.querySelector('#ROE');
    selectedROE.classList.remove('loading');
    selectedROE.classList.add('ROE');
    selectedROE.innerText = returnOnEquity;
    //Adds Current Ratio:
    const selectedCurrentRatio = document.querySelector('#currentRatio')
    selectedCurrentRatio.classList.remove('loading');
    selectedCurrentRatio.innerText = currentRatio;

    if (currentRatio > 1){
        selectedCurrentRatio.classList.add('debt-good');
    } else{
        selectedCurrentRatio.classList.add('debt-bad');
    }

    //Adds Debt/Equity:
    const selectedDebtOverEquity = document.querySelector('#debtOverEquity');
    selectedDebtOverEquity.classList.remove('loading');
    selectedDebtOverEquity.innerText = debtOverEquity;

    if (debtOverEquity <= 1.50){
        selectedDebtOverEquity.classList.add('debt-good');
    } else{
        selectedDebtOverEquity.classList.add('debt-bad');
    }
    //Adds Long Term Debt/Equity:
    const selectedLongTermDebtOverEquity = document.querySelector('#ltDebtOverEquity');
    selectedLongTermDebtOverEquity.classList.remove('loading');
    selectedLongTermDebtOverEquity.innerText = longTermDebtOverEquity;

    if (longTermDebtOverEquity <= 1.00){
        selectedLongTermDebtOverEquity.classList.add('debt-good');
    } else{
        selectedLongTermDebtOverEquity.classList.add('debt-bad');
    }

    //Adds EPS past5Y:
    const selectedEpsPast5Y = document.querySelector('#epsPast5Y');
    selectedEpsPast5Y.classList.remove('loading');
    selectedEpsPast5Y.innerText = epsPast5Y;

    if (epsPast5Y >= 5.0){
        selectedEpsPast5Y.innerText = "+" + epsPast5Y + "%";
        selectedEpsPast5Y.classList.add("returns-positive");
    } else if (epsPast5Y >= 0){
        selectedEpsPast5Y.innerText = epsPast5Y + "%";
        selectedEpsPast5Y.classList.add("returns-neutral");
    } else {
        selectedEpsPast5Y.classList.add("returns-negative");
    }


    //Chart Historical EPS:
    historicalEps.reverse();
    const dates = historicalEps.map((x)=>{
        return x.period;
    })
    const eps = historicalEps.map((x)=>{
        return x.v;
    })
    chartEps(eps,dates); //this function is in the chartingData JavaScript file.

}

addReturnsPriceAndDiscount();
addFinancials();