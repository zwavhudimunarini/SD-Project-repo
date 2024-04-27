// Function to report and save the issue
function saveIssue() {
    const issue = document.getElementById('issue').value;
    fetch('/report-issue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ issue: issue })
    })
    .then(response => {
        if (response.ok) {
            closeModal();
            // Issue reported successfully, no need to update notifications widget here
        } else {
            console.error('Failed to report issue:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error reporting issue:', error);
    });
}

// Socket.IO Client-Side Code (Listening for Notifications)
const socket = io();
socket.on('new-issue', issue => {
    // Do nothing, tenants do not need to handle notifications
});
