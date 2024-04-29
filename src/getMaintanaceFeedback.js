

// Fetch reported issues from the server
function fetchUsers() {
    fetch('/get-maintanace-feedback')
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch reported issues');
        }
    })
    .then(data => {
        console.log(data);
        const {  ids,issueAssigneds ,feedbacks } = data;
        
        
        updateNotificationsWidget(ids,issueAssigneds ,feedbacks);
    })
    .catch(error => {
        console.error('Error fetching reported issues:', error);
    });
}


function updateNotificationsWidget(ids,issueAssigneds ,feedbacks) {
    const notificationsList = document.getElementById('notifications-list');

    // Clear existing items in the list
    notificationsList.innerHTML = '';

    // Add each issue to the notifications widget
    issueAssigneds.forEach((issueAssigned, index) => {
        const newItem = document.createElement('li');
        newItem.className = 'notification-item'; // Add a class for styling
        newItem.id = `issue-${ids[index]}`; // Set ID for identifying the issue

        // Construct the content of the list item with icons using innerHTML
        newItem.innerHTML = `
            <p>Issue:  ${issueAssigned}</p>
            <br> <!-- Add a line break -->
            <p>.................</p>
            <p>Feedback:  ${feedbacks[index]}</p>
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
const socket = io();

// Update total issues count when received from the server
socket.on('total-issues-count', (totalCount) => {
    const totalIssuesCountElement = document.getElementById('total-issues-count');
    totalIssuesCountElement.textContent = totalCount;
});

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