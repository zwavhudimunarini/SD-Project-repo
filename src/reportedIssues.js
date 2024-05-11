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
            const { issues, ids } = data;
            updateNotificationsWidget(issues, ids);
        })
        .catch(error => {
            console.error('Error fetching reported issues:', error);
        });
}




// Function to update button state based on data
function updateButtonState(button, issueId) {
    const assigned = localStorage.getItem(`issue-${issueId}`);
    if (assigned === 'true') {
        button.innerHTML = 'Assigned';
        button.style.backgroundColor = 'green';
        button.disabled = true;
    } else {
        button.innerHTML = 'Assign';
        button.style.backgroundColor = ''; // Reset background color to default
        button.disabled = false;
    }
}

// Function to update the assigned state of an issue in local storage
function updateAssignedStateInStorage(issueId, assigned) {
    localStorage.setItem(`issue-${issueId}`, assigned);
}


function updateNotificationsWidget(issues, ids) {
    const notificationsTableBody = document.querySelector('#notifications-table tbody');

    // Clear existing rows in the table body
    notificationsTableBody.innerHTML = '';

    // Add each issue to the notifications table
    issues.forEach((issue, index) => {
        const newRow = document.createElement('tr');
        
        // Description column
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = issue;
        descriptionCell.style.width = '1100px';
        newRow.appendChild(descriptionCell);

        // Action column
        const actionCell = document.createElement('td');
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';

        // Assign button
        const assignButton = document.createElement('button');
        assignButton.textContent = 'Assign';
        assignButton.className = 'assign-button'; // Add a class for styling
        assignButton.onclick = function() {
            assignMaintenance(issue, assignButton, ids[index]);
            assignButton.disabled = true;
        };
        actionButtons.appendChild(assignButton);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button'; // Add a class for styling
        deleteButton.onclick = function() {
            deleteIssue(ids[index]);
        };
        actionButtons.appendChild(deleteButton);

        actionCell.appendChild(actionButtons);
        newRow.appendChild(actionCell);

        // Append the row to the table body
        notificationsTableBody.appendChild(newRow);

        // Update button state based on local storage
        updateButtonState(assignButton, ids[index]);
    });
}


function assignMaintenance(issue, assignButton, issueId) {
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
                    // Store the state in localStorage
                    updateAssignedStateInStorage(issueId, true);
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



// Call fetchReportedIssues when the page loads
document.addEventListener('DOMContentLoaded', fetchReportedIssues);



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