function getUserInfo(){

    var email=document.getElementById("email").value;
    var password=document.getElementById("password").value;

    const userData = {
        email: email,
        password: password
    };

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Redirect to another page
            window.location.href = 'user.html';
        } else {
            alert('Invalid email or password');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error occurred while logging in');
    });

}




