

// Fetch reported issues from the server
function fetchReportedIssues() {
    fetch('/reported-issues')
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch reported issues');
        }
    })
    .then(data => {
        console.log(data);
        const { issues,ids } = data;
        
        
        updateNotificationsWidget(issues,ids);
    })
    .catch(error => {
        console.error('Error fetching reported issues:', error);
    });
}

function updateNotificationsWidget(issues, ids) {
    const notificationsList = document.getElementById('notifications-list');

    // Clear existing items in the list
    notificationsList.innerHTML = '';

    // Add each issue to the notifications widget
    issues.forEach((issue, index) => {
        const newItem = document.createElement('li');
        newItem.className = 'notification-item'; // Add a class for styling
        newItem.id = `issue-${ids[index]}`; // Set ID for identifying the issue

        // Set the text content of the list item to the issue description
        newItem.textContent = issue;

        // Create the "Assign Maintenance" button
        const assignMaintenanceButton = document.createElement('button');
        assignMaintenanceButton.textContent = 'Assign';
        assignMaintenanceButton.className = 'assign-button'; // Add a class for styling
        assignMaintenanceButton.onclick = function() {
            
            assignMaintenance(issue, assignMaintenanceButton);
            assignMaintenanceButton.disabled = true;
        };


        // Create the "Delete" button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button'; // Add a class for styling
        
        // Set up event listener for the delete button
        deleteButton.onclick = function() {
            // Extract the issue ID from the ID of the parent list item
            const issueId = newItem.id.split('-')[1];
            console.log(issueId);
            
            // Call a function to delete the item from the database
            deleteIssue(issueId);
        };

        // Append the delete button to the list item
        newItem.appendChild(deleteButton);
        newItem.appendChild(assignMaintenanceButton);

        // Append the list item to the notifications list
        notificationsList.appendChild(newItem);
    });
}


function assignMaintenance(issue, assignButton) {
    // Check if the button is already disabled
    if (assignButton.disabled) {
        return; // Exit the function if the button is disabled
    }
    fetch('/assign-to-maintanace', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ issue: issue })
    })
    .then(response => {
        if (response.ok) {
            console.log("Issue is sent to the database");
            // Change button text to "Assigned" after 5 seconds
            setTimeout(() => {
                if (assignButton) {
                    assignButton.innerHTML = 'Assigned';
                    assignButton.style.backgroundColor = 'green';
                    assignButton.disabled = true; // Disable the button
                }
            }, 5000); // 5 seconds delay
        } else {
            throw new Error('Failed to assign maintenance');
        }
    })
    .catch(error => {
        console.error("Error assigning maintenance:", error);
        // Re-enable the button in case of error so that user can try again
        assignButton.disabled = false;
    });
}


// Initialize Socket.IO Client-Side Code
const socket = io();

// Update total issues count when received from the server
socket.on('total-issues-count', (totalCount) => {
    const totalIssuesCountElement = document.getElementById('total-issues-count');
    totalIssuesCountElement.textContent = totalCount;
});

function deleteIssue(issueId) {
    // Send a DELETE request to the server to delete the issue
    fetch(`/delete-issue/${issueId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            // If deletion is successful, remove the corresponding item from the UI
            const itemToRemove = document.getElementById(`issue-${issueId}`);
            itemToRemove.parentNode.removeChild(itemToRemove);
            console.log(`Issue with ID ${issueId} deleted successfully.`);
        } else {
            throw new Error('Failed to delete issue');
        }
    })
    .catch(error => {
        console.error('Error deleting issue:', error);
    });
}