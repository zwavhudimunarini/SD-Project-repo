function searchStaff() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = ''; // Clear previous search results

    fetch(`/search/staff?query=${searchInput}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(staffMembers => {
        staffMembers.forEach(staff => {
            const listItem = document.createElement('li');
            listItem.classList.add('search-result');
            // Display staff information except for the password
            listItem.innerHTML = `
                Name: ${staff.name}<br>
                Email: ${staff.email}<br>
                Id: ${staff.id}<br>
                <button class="delete-button" onclick="deleteStaff(${staff.id})">Delete</button>
            `;
            searchResults.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error('Error searching for staff members:', error);
        // Optionally, show an error message to the user
    });
}

// Function to delete a staff member
async function deleteStaff(staffId, listItemID) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        try {
            // Send an AJAX request to the server to delete the staff member
            const response = await fetch(`/staff/${staffId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Staff member successfully deleted
                console.log('Staff member deleted successfully');
                searchStaff();
                // Remove the deleted staff member from the search results
                const searchResult = document.getElementById(listItemID);
                if (searchResult) {
                    searchResult.remove();
                }
                displayStaffList();
                // Check if there are no more search results, clear input and hide results
                const searchResults = document.getElementById('searchResults');
                if (searchResults.children.length === 0) {
                    document.getElementById('searchInput').value = '';
                    searchResults.style.display = 'none';
                }
            } else {
                // Error occurred while deleting staff member
                console.error('Error deleting staff member:', response.status);
                // Optionally, show an error message to the user
            }
        } catch (error) {
            console.error('Error deleting staff member:', error);
            // Optionally, show an error message to the user
        }
    }
}


//add staff
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#addStaffForm');
    const addButton = document.getElementById('addStaff');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        addStaff();
    });

    function addStaff() {
        // Disable the submit button to prevent multiple submissions
        var addButton = document.getElementById('addStaff');
        //addButton.disabled = true;

        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var confirmPassword = document.getElementById("confirmPassword").value;
        var role; // Get selected role

        var radioButtons = document.getElementsByName('role');
        

        for (var i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].checked) {
                role = radioButtons[i].value;
                break;
            }
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            // Re-enable the submit button
            addButton.disabled = false;
            return; // Stop further execution if passwords don't match
        }
        if(password.length < 8) {
            alert("Password too short");
        }

        var formData = {
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            role: role // Include role in the formData
        };

        fetch('/add-staff', {
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
            if (data.message) {
                // If user is created successfully, redirect to admin page
                form.reset();
                alert(data.message);
            } 
            else if(data.error) {
                // If there's any other response, show alert
                alert(data.error);
            }
            // Re-enable the submit button after request completes
           // addButton.disabled = false;
        })

        .catch(error => {
            console.error('Error:', error);
            
            
            // Re-enable the submit button after request completes
            //addButton.disabled = false;
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    displayStaffList(); // Call the function to display the staff list when the page loads
});

async function displayStaffList() {
    try {
        const response = await fetch('/all-staff');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const staffMembers = await response.json();
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = ''; // Clear previous search results

        staffMembers.forEach(staff => {
            const listItem = document.createElement('li');
            listItem.classList.add('search-result');
            // Display staff information except for the password
            listItem.innerHTML = `
            <article class="staff-info">
                <h2>${staff.name}</h2>
                <h3>Email: ${staff.email}</h3>
                <h3>Id: ${staff.id}</h3>
                <button class="delete-button" onclick="deleteStaff(${staff.id}, 'staff-${staff.id}')">Delete</button>
            </article>
            `;
            searchResults.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error displaying staff list:', error);
        // Optionally, show an error message to the user
    }
}



module.exports={ deleteStaff};