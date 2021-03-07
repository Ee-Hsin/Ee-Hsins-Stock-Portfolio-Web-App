
let failedSubmission = false;

(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    failedSubmission= true;
                    event.preventDefault()
                    event.stopPropagation()
                } else{
                    failedSubmission=false;
                }
                
                form.classList.add('was-validated')
            }, false)
        })
})()


function validation() {
    const email = document.querySelector('#email');
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

    email.addEventListener('input', function(){
        const span = document.querySelector('#email-feedback');

        //Text Matches Pattern
        if(email.value.match(pattern)){
            span.classList.add('valid');
            span.classList.remove('invalid');
            span.innerText = "Valid email address!";
        } else { //text doesn't match pattern
            span.classList.add('invalid');
            span.classList.remove('valid');
            span.innerText = "Invalid email address!";
        }
    })
}

validation();