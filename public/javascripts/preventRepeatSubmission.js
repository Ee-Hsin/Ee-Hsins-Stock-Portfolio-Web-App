//Backend will prevent user from registering twice, but I don;t want the user to have that problem if they click register button multiple times in the first place.

const form = document.querySelector('.registration-form')

form.addEventListener('submit', (event) =>{
    if(inArray('was-validated', form.classList) && !failedSubmission){
        document.querySelector(".btn-success").disabled = true;
    }
})

function inArray(needle,haystack)
{
    const count=haystack.length;
    for(let i=0;i<count;i++)
    {
        if(haystack[i]===needle){return true;}
    }
    return false;
}