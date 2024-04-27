// Function to update notifications widget with the list of issues
function updateNotificationsWidget(issues) {
    const notificationsList = document.getElementById('notifications-list');

   

    // Add each issue to the notifications widget
    issues.forEach(issue => {
        const newItem = document.createElement('li');
        newItem.textContent = issue;
        notificationsList.appendChild(newItem);
    });
}

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
        const { issues } = data;
        updateNotificationsWidget(issues);
    })
    .catch(error => {
        console.error('Error fetching reported issues:', error);
    });
}

// Initialize Socket.IO Client-Side Code
const socket = io();

// Update total issues count when received from the server
socket.on('total-issues-count', (totalCount) => {
    const totalIssuesCountElement = document.getElementById('total-issues-count');
    totalIssuesCountElement.textContent = totalCount;
});
