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
        if (response.ok) {
            return response.json();
        }
        else if(email=='' || password==''){
            alert('all fields are required');
        }
        
        else if (response.status == 401) {
            window.location.href="login.html"
            // Invalid email or password, show alert to the user
            
            alert('Invalid email or password');
            //clear the form
            document.getElementById('email').value='',
            document.getElementById('password').value='';
            
            
        }
        else if(response.status==404){
            window.location.href="login.html"
            alert("Invalid email or password")
        }
        else {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        if (data.success) {

            window.location.href = 'admin.html?name=' + data.name;
            //check if password matches
            // if(data.role=="Admin"){

            //     window.location.href = 'admin.html?name=' + data.name;
            // }
            // else {

            //     window.location.href="login.html"
            //     alert('Unkown role');
            // }
            
            // // Redirect based on role
            // switch(data.role) {
            //     case 'Tenant':
            //         //dont forget to change to tenant.html after it has been designed
            //         window.location.href = 'ResidentHomepage.html?name=' + data.name;
            //         break;
            //     case 'Admin':
            //         window.location.href = 'admin.html?name=' + data.name;
            //         break;
            //     case 'administrator':
            //         window.location.href = 'administrator.html?name=' + data.name;
            //         break;
            //     case 'maintanance':
            //         window.location.href = 'maintananceStaff.html?name='+ data.name;
            //         break;
                
            //     default:
            //         alert('Unknown role');
            // }
        }
        else {

            window.location.href="login.html"
            alert('Invalid email or password');
        }
        
    })
    
    .catch(error => {
        console.error('Error:', error);
        window.location.href="login.html"
        //alert("An error occured. Please try again");
        
     
    });




    //tenant
    fetch('/login-tenant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        else if(email=='' || password==''){
            alert('all fields are required');
        }
        
        else if (response.status == 401) {
            window.location.href="login.html"
            // Invalid email or password, show alert to the user
            
            alert('Invalid email or password');
            //clear the form
            document.getElementById('email').value='',
            document.getElementById('password').value='';
            
            
        }
        else if(response.status==404){
            window.location.href="login.html"
            alert("Invalid email or password")
        }
        else {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        if (data.success) {

            window.location.href = 'ResidentHomepage.html'
            //check if password matches

            // if(data.role=="Tenant"){

            //     window.location.href = 'ResidentHomepage.html'
            // }
            // else {

            //     window.location.href="login.html"
            //     alert('Unkown role');
            // }
            
            // Redirect based on role
            // switch(data.role) {
            //     case 'Tenant':
            //         //dont forget to change to tenant.html after it has been designed
            //         window.location.href = 'ResidentHomepage.html?name=' + data.name;
            //         break;
            //     case 'Admin':
            //         window.location.href = 'admin.html?name=' + data.name;
            //         break;
            //     case 'administrator':
            //         window.location.href = 'administrator.html?name=' + data.name;
            //         break;
            //     case 'maintanance':
            //         window.location.href = 'maintananceStaff.html?name='+ data.name;
            //         break;
                
            //     default:
            //         alert('Unknown role');
            // }
        }
         
        else {

            window.location.href="login.html"
            alert('Invalid email or password');
        }
    })
    
    .catch(error => {
        console.error('Error:', error);
        window.location.href="login.html"
        //alert("An error occured. Please try again");
        
     
    });


    //maintanance
    fetch('/login-main', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        else if(email=='' || password==''){
            alert('all fields are required');
        }
        
        else if (response.status == 401) {
            window.location.href="login.html"
            // Invalid email or password, show alert to the user
            
            alert('Invalid email or password');
            //clear the form
            document.getElementById('email').value='',
            document.getElementById('password').value='';
            
            
        }
        else if(response.status==404){
            window.location.href="login.html"
            alert("Invalid email or password")
        }
        else {
            throw new Error('Network response was not ok');
        }
    }).then(data => {
        if (data.success) {

            window.location.href = 'maintananceStaff.html';
            //check if password matches

            // if(data.role=="maintanance"){

            //     window.location.href = 'maintananceStaff.html?name='+ data.name;
            // }
            // else {

            //     window.location.href="login.html"
            //     alert('Unkown role');
            // }
            
            // // Redirect based on role
            // switch(data.role) {
            //     case 'Tenant':
            //         //dont forget to change to tenant.html after it has been designed
            //         window.location.href = 'ResidentHomepage.html?name=' + data.name;
            //         break;
            //     case 'Admin':
            //         window.location.href = 'admin.html?name=' + data.name;
            //         break;
            //     case 'administrator':
            //         window.location.href = 'administrator.html?name=' + data.name;
            //         break;
            //     case 'maintanance':
            //         window.location.href = 'maintananceStaff.html?name='+ data.name;
            //         break;
                
            //     default:
            //         alert('Unknown role');
            // }
        }
         
        else {

            window.location.href="login.html"
            alert('Invalid email or password');
        }
    })
    
    .catch(error => {
        console.error('Error:', error);
        window.location.href="login.html"
        //alert("An error occured. Please try again");
        
     
    });


    //administrator
    fetch('/login-ad', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        else if(email=='' || password==''){
            alert('all fields are required');
        }
        
        else if (response.status == 401) {
            window.location.href="login.html"
            // Invalid email or password, show alert to the user
            
            alert('Invalid email or password');
            //clear the form
            document.getElementById('email').value='',
            document.getElementById('password').value='';
            
            
        }
        else if(response.status==404){
            window.location.href="login.html"
            alert("Invalid email or password")
        }
        else {
            throw new Error('Network response was not ok');
        }
    }).then(data => {
        if (data.success) {

            window.location.href = 'administrator.html' ;
            //check if password matches
            
            // Redirect based on role
            // if(data.role=="administrator"){

            //     window.location.href = 'administrator.html?name=' + data.name;
            // }
            // else {

            //     window.location.href="login.html"
            //     alert('Unkown role');
            //  }
            // switch(data.role) {
            //     case 'Tenant':
            //         //dont forget to change to tenant.html after it has been designed
            //         window.location.href = 'ResidentHomepage.html?name=' + data.name;
            //         break;
            //     case 'Admin':
            //         window.location.href = 'admin.html?name=' + data.name;
            //         break;
            //     case 'administrator':
            //         window.location.href = 'administrator.html?name=' + data.name;
            //         break;
            //     case 'maintanance':
            //         window.location.href = 'maintananceStaff.html?name='+ data.name;
            //         break;
                
            //     default:
            //         alert('Unknown role');
            // }
        }
         
        else {

            window.location.href="login.html"
            alert('Invalid email or password');
        }
    })
    
    .catch(error => {
        console.error('Error:', error);
        window.location.href="login.html"
        //alert("An error occured. Please try again");
        
     
    });

}




