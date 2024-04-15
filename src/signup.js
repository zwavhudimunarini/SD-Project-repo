// var submitForm=document.getElementById("submitForm");

// submitForm.addEventListener('submit', function(event){

//     event.preventDefault();

//     let role;

//     let roles = document.getElementsByName("role");
//     for (let i = 0; i < roles.length; i++) {
//         if (roles[i].checked) {
//             role = roles[i].value;
//         }
//     }

//     var formData = {
//         username: document.getElementById("names").value,
//         email: document.getElementById("email").value,
//         password: document.getElementById("password").value,
//         confirmPassword:document.getElementById("confirmPassword").value,
//         number:  document.getElementById("number").value,
//         role: role
//     };

//     if (formData.password !== formData.confirmPassword) {
//         alert("Passwords do not match");
//         return; // Stop further execution if passwords don't match
//     }

//     fetch('/submit', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Success:', data);
//         //clear form fields
        
//     })
//     .catch((error) => {         
//         console.error('Error:', error);
//     });

// })

function submitForm() {


    var name = document.getElementById("names").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var number = document.getElementById("number").value;
    var role;

    var roles = document.getElementsByName("role");
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].checked) {
            role = roles[i].value;
            break;
        }
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return; // Stop further execution if passwords don't match
    }

    // Prepare the data to be sent in the request body
    var formData = {
        name: name,
        email: email,
        password: password,
        confirmPassword:confirmPassword,
        number: number,
        role: role
    };

    // Make a POST request using the Fetch API
    
    fetch('http://localhost:3004/submit', {
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
        if(data.success){

           // alert("User created successfully");
            window.location.href = 'login.html';
        }
        else{
            alert('Invalid details');

        }
        //console.log('Success:', data);
        // Handle success response, e.g., show a success message to the user
       
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error, e.g., show an error message to the user
        alert("Error occurred while creating user");
    });
}
