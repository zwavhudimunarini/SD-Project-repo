

function updateIssues(issues) {
    const notificationsList = document.getElementById('notifications-list');

   

    // Add each issue to the notifications widget
    data.forEach(item => {
        html += `<li>${item.column_name}</li>`; // Replace 'column_name' with your actual column name
    });
    html += '</ul>';
    notificationsList.innerHTML = html;
}


const dataContainer = document.getElementById('notifications-list');
function totalIssues() {
    fetch('/total-issues')
    .then(response => {
        if (response.ok) {
            return response.json(); // Return the parsed JSON data
        } else {
            throw new Error('Failed to fetch issues');
        }
    })
    .then(data => {
        const { issues } = data;
        updateIssues(issues);
    })
    .catch(error => {
        console.error('Error fetching issues:', error);
       
    });
}
//const socket = io();