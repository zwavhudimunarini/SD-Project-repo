function submitForm() {
    // Disable the submit button to prevent multiple submissions
    //submitButton.disabled = true;

    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
   
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        // Re-enable the submit button
        //submitButton.disabled = false;
        return; // Stop further execution if passwords don't match
    }
    if(password.length<8){
        alert("password too short");
        return;
    }

    // Prepare the data to be sent in the request body
    var formData = {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        
        
    };

    // Make a POST request using the Fetch API
    fetch('/submitTenant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'User created successfully') {
            // If user is created successfully, redirect to login page
            window.location.href = 'administrator.html';
        } else {
            // If there's any other response, show alert
            alert('Invalid details');
        }
        // Re-enable the submit button after request completes
        //submitButton.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        if(password.length<8){

            alert("Password too short");
        }
        
        // Re-enable the submit button after request completes
        //submitButton.disabled = false;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const submitButton = document.getElementById('addNewTenant');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Call submitForm function
        submitForm();
    });

    
});


module.exports=submitForm;



