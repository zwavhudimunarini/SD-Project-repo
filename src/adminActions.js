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

    // Send an AJAX request to the server to search for staff members
    /*const xhr = new XMLHttpRequest();
    xhr.open('GET', `/search/staff?query=${searchInput}`, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const staffMembers = JSON.parse(xhr.responseText);
                staffMembers.forEach(staff => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('search-result');
                    listItem.innerHTML = `
                        ${staff.name}
                        <button class="delete-button" onclick="deleteStaff(${staff.id})">Delete</button>
                    `;
                    searchResults.appendChild(listItem);
                });
            } else {
                console.error('Error searching for staff members:', xhr.status);
                // Optionally, show an error message to the user
            }
        }
    };
    xhr.send();*/
}

// Function to delete a staff member
async function deleteStaff(staffId) {
    console.log('Deleting staff member with ID:', staffId);
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
                const searchResult = document.getElementById(`staff-${staffId}`);
                if (searchResult) {
                    searchResult.remove();
                }
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
        addButton.disabled = true;

        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var confirmPassword = document.getElementById("confirmPassword").value;
        var role = document.querySelector('input[name="role"]:checked').value; // Get selected role

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            // Re-enable the submit button
            addButton.disabled = false;
            return; // Stop further execution if passwords don't match
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
            } else if(data.error) {
                // If there's any other response, show alert
                alert(data.error);
            }
            // Re-enable the submit button after request completes
            addButton.disabled = false;
        })

        .catch(error => {
            console.error('Error:', error);
            if(password.length < 8) {
                alert("Password too short");
            }
            
            // Re-enable the submit button after request completes
            addButton.disabled = false;
        });
    }
});


