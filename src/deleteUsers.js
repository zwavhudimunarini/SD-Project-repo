

//get all tenants in the database, so that u can delete them

function fetchUsers() {
    fetch('/get-users')
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch reported issues');
        }
    })
    .then(data => {
        console.log(data);
        const { names,emails,ids } = data;
        
        
        updateNotificationsWidget(names,emails,ids);
    })
    .catch(error => {
        console.error('Error fetching reported issues:', error);
    });
}


function updateNotificationsWidget(names, emails, ids) {
    const notificationsList = document.getElementById('notifications-list');

    // Clear existing items in the list
    notificationsList.innerHTML = '';

    // Add each issue to the notifications widget
    names.forEach((name, index) => {
        const newItem = document.createElement('li');
        newItem.className = 'notification-item'; // Add a class for styling
        newItem.id = `issue-${ids[index]}`; // Set ID for identifying the issue

        // Construct the content of the list item with icons using innerHTML
        newItem.innerHTML = `
            <img src="images/userIcon.jpeg" alt="User Icon" class="icon" style="width: 20px; height: 20px; margin-right: 5px;">
            ${name}
            <br>
            <img src="images/emailIcon.jpg" alt="Email Icon" class="icon" style="width: 20px; height: 20px; margin-left: 50px;">
            ${emails[index]}
        `;

        // Create the "Delete" button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button'; // Add a class for styling
        
        // Set up event listener for the delete button
        deleteButton.onclick = function() {
            // Extract the issue ID from the ID of the parent list item
            const Id = newItem.id.split('-')[1];
            console.log(Id);
            
            // Call a function to delete the item from the database
            deleteIssue(Id);
        };

        // Append the delete button to the list item
        newItem.appendChild(deleteButton);

        // Append the list item to the notifications list
        notificationsList.appendChild(newItem);
    });
}






// Initialize Socket.IO Client-Side Code
// const socket = io();

// // Update total issues count when received from the server
// socket.on('total-issues-count', (totalCount) => {
//     const totalIssuesCountElement = document.getElementById('total-issues-count');
//     totalIssuesCountElement.textContent = totalCount;
// });



//delete the Tenant
function deleteIssue(Id) {
    // Send a DELETE request to the server to delete the issue
    fetch(`/delete-user/${Id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            // If deletion is successful, remove the corresponding item from the UI
            const itemToRemove = document.getElementById(`issue-${Id}`);
            itemToRemove.parentNode.removeChild(itemToRemove);
            console.log(`Issue with ID ${Id} deleted successfully.`);
        } else {
            throw new Error('Failed to delete issue');
        }
    })
    .catch(error => {
        console.error('Error deleting issue:', error);
    });
}

//module.exports={ fetchUsers };
module.exports = { deleteIssue };