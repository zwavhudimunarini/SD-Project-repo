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
            const clearInput=document.getElementById('issue');
            clearInput.value="";
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


//get all the fines related to currently logged in tenant
function fetchFines() {
    fetch('/get-fines-tenant')
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch fines');
        }
    })
    .then(data => {
        console.log(data);
        updateNotificationsWidget(data); // Pass the combined fines data to the updateNotificationsWidget function
       
    })
    .catch(error => {
        console.error('Error fetching fines:', error);
    });
    //
}

function clearLocalStorage() {
    localStorage.removeItem('fineStates');
}

function updateNotificationsWidget(finesData) {
    //clearLocalStorage()
    //ndaa

    // Function to update button state based on data
    function updateButtonState(button, fine) {
        if (fine.paid) {
            button.textContent = 'Paid';
            button.style.backgroundColor = 'red';
            button.disabled = true;
        } else {
            button.textContent = 'Pay';
            button.style.backgroundColor = 'green';
            button.disabled = false;
        }
    }

    // Function to update the paid state of a fine in local storage
    function updatePaidStateInStorage(fineId, paid) {
        const storedData = JSON.parse(localStorage.getItem('fineStates')) || {};
        storedData[fineId] = paid;
        localStorage.setItem('fineStates', JSON.stringify(storedData));
    }

    // Function to get the paid state of a fine from local storage
    function getPaidStateFromStorage(fineId) {
        const storedData = JSON.parse(localStorage.getItem('fineStates')) || {};
        return storedData[fineId] || false;
    }

    //paid cost
    const paidAmount = finesData.reduce((total, fine) => total + fine.paidAmount, 0);
    const paidCostParagraph = document.getElementById('paid-cost');
    paidCostParagraph.textContent = `Paid Cost: R ${paidAmount}`;

    //remaining cost
    const remainingAmount = finesData.reduce((total, fine) => total + (fine.amount - fine.paidAmount), 0);
    const remainingCostParagraph = document.getElementById('remaining-cost');
    remainingCostParagraph.textContent = `Remaining cost: R ${remainingAmount}`;

    const notificationsList = document.getElementById('notifications-list');
    notificationsList.innerHTML = '';

    const tableStyle = `
        /* Style for the table */
        .fines-table {
            border-collapse: collapse;
            width: 100%;
        }

        /* Style for table header */
        .fines-table th {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }

        /* Style for table data */
        .fines-table td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = tableStyle;
    document.head.appendChild(styleElement);

    const table = document.createElement('table');
    table.className = 'fines-table';

    const headerRow = document.createElement('tr');
    ['Title', 'Description', 'Amount', 'Action'].forEach(columnName => {
        const headerCell = document.createElement('th');
        headerCell.textContent = columnName;
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    finesData.forEach(fine => {
        const row = document.createElement('tr');
        ['title', 'description', 'amount', 'action'].forEach(propertyName => {
            const cell = document.createElement('td');
            if (propertyName === 'amount') {
                cell.textContent = 'R ' + fine[propertyName];
            } else if (propertyName === 'action') {
                const existingActionText = fine[propertyName];
                const actionCellContainer = document.createElement('div');
                actionCellContainer.style.display = 'flex'; // Set display to flex
                actionCellContainer.style.alignItems = 'center';
                actionCellContainer.style.marginLeft = '10px';

                const payButton = document.createElement('button');
                const paid = getPaidStateFromStorage(fine.id); // Get paid state from local storage
                fine.paid = paid; // Update paid state in fine data
                updateButtonState(payButton, fine); // Update button state based on data
                payButton.style.height = '30px';
                payButton.style.marginLeft = '10px';
                actionCellContainer.appendChild(document.createTextNode(existingActionText)); // Append existing text
                actionCellContainer.appendChild(payButton); // Append pay button

                payButton.addEventListener('click', function () {
                    if (!fine.paid) {
                        const userData = {
                            paidAmount: fine.amount, // Use the "amount" directly from the fine object
                            fineId: fine.id
                        };

                        fetch('/send-payment', {
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
                            })
                            .then(data => {
                                if (data.message) {
                                    alert("success");
                                    fine.paid = true; // Update the paid state in the data
                                    updatePaidStateInStorage(fine.id, true); // Update paid state in local storage
                                    updateButtonState(payButton, fine); // Update button state
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                    }
                });

                cell.appendChild(actionCellContainer); // Append container with existing text and pay button
            } else {
                cell.textContent = fine[propertyName];
            }
            row.appendChild(cell);
        });
        table.appendChild(row);
    });

    notificationsList.appendChild(table);
}


// // Function to handle clicking on a notification text
// function handleNotificationClick(notification) {
//     // Redirect to another page with notification details
//     // Replace 'notification-details.html' with the URL of the page to display details
//     window.location.href = 'notification-details.html?id=' + notification.id;
// }

// // Function to fetch notifications from the server
// async function fetchNotifications() {
//     try {
//         const response = await fetch('/notifications');
//         if (!response.ok) {
//             throw new Error('Failed to fetch notifications');
//         }
//         const notifications = await response.json();

//         // Update the HTML content with the notifications
//         const notificationsList = document.getElementById('fetchedNotifications-list');
//         notificationsList.innerHTML = ''; // Clear previous content
//         if (notifications.length === 0) {
//             notificationsList.innerHTML = '<li>No notifications available</li>';
//         } else {
//             notifications.forEach(notification => {
//                 const listItem = document.createElement('li');
//                 listItem.classList.add('notification');
//                 listItem.textContent = notification.message;
//                 listItem.addEventListener('click', () => handleNotificationClick(notification));
//                 notificationsList.appendChild(listItem);
//             });
//         }
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//     }
// }



// // Add CSS styles dynamically
// const style = document.createElement('style');
// style.textContent = `
//     /* CSS styles */
//     body {
//         font-family: Arial, sans-serif;
//         margin: 0;
//         padding: 0;
//         background-color: #f4f4f4;
//     }

//     .card {
//         max-width: 800px;
//         margin: 20px auto;
//         padding: 20px;
//         background-color: #fff;
//         border-radius: 5px;
//         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//     }

//     .notification {
//         display: flex;
//         align-items: center;
//         justify-content: flex-start;
//         padding: 10px;
//         margin: 10px 0;
//         background-color: #f8f9fa;
//         border: 1px solid #ddd;
//         border-radius: 5px;
//         box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
//         width: 100%;
//         max-width: 600px;
//         overflow: hidden;
//         white-space: nowrap;
//         text-overflow: ellipsis;
//         cursor: pointer;
//     }

//     .notification:hover {
//         background-color: #e9ecef;
//     }

//     .notification-list {
//         list-style-type: none;
//         padding: 0;
//     }

//     .notification p {
//         margin: 0;
//         flex-grow: 1;
//         overflow: hidden;
//         white-space: nowrap;
//         text-overflow: ellipsis;
//     }
// `;
// document.head.appendChild(style);

// // Function to handle clicking on a notification text
// function handleNotificationClick(notification) {
//     // Redirect to another page with notification details
//     window.location.href = 'notification-details.html?id=' + notification.id;
// }

// // Function to fetch notifications from the server
// async function fetchNotifications() {
//     try {
//         const response = await fetch('/notifications');
//         if (!response.ok) {
//             throw new Error('Failed to fetch notifications');
//         }
//         const notifications = await response.json();

//         // Update the HTML content with the notifications
//         const notificationsList = document.getElementById('fetchedNotifications-list');
//         notificationsList.innerHTML = ''; // Clear previous content
//         if (notifications.length === 0) {
//             notificationsList.innerHTML = '<li>No notifications available</li>';
//         } else {
//             notifications.forEach(notification => {
//                 const listItem = document.createElement('li');
//                 listItem.classList.add('notification');
//                 const messageElement = document.createElement('p');
//                 messageElement.textContent = notification.message;
//                 listItem.appendChild(messageElement);
//                 listItem.addEventListener('click', () => handleNotificationClick(notification));
//                 notificationsList.appendChild(listItem);
//             });
//         }
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//     }
// }

// // Fetch notifications when the page loads
// document.addEventListener('DOMContentLoaded', fetchNotifications);
