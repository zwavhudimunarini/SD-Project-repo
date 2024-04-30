 

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const submitButton = document.getElementById('submitBtn');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Call submitForm function
        submitForm();
    });

    function submitForm() {
        // Disable the submit button to prevent multiple submissions
        submitButton.disabled = true;

        var name = document.getElementById("names").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var confirmPassword = document.getElementById("confirmPassword").value;
        
       

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            // Re-enable the submit button
            submitButton.disabled = false;
            return; // Stop further execution if passwords don't match
        }
    
        if(password.length<8){
            alert("Password too short");
            return;
        }

        // Prepare the data to be sent in the request body
        var formData = {
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            confirmPassword: confirmPassword,
           
        };

        // Make a POST request using the Fetch API
        fetch('/submit', {
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
                window.location.href = 'login.html';
            } else {
                // If there's any other response, show alert
                alert('Invalid details');
            }
            // Re-enable the submit button after request completes
            submitButton.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
           
            
            // Re-enable the submit button after request completes
            submitButton.disabled = false;
        });
    }
});


function onSignIn(googleUser) {

    var profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log("Name: " + profile.getName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.
  
    // Redirect to login page
    window.location.href = "login.html";
}

module.exports={submitForm};
