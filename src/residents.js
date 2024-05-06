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
}

function clearLocalStorage() {
    localStorage.removeItem('fineStates');
}

function updateNotificationsWidget(finesData) {
    //clearLocalStorage()

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

