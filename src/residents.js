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



// function updateNotificationsWidget(finesData) {

//     //paid cost
//     const paidAmount = finesData.reduce((total, fine) => total + fine.paidAmount, 0);
//     const paidCostParagraph = document.getElementById('paid-cost');

//     // Update the content of the "Remaining Cost" paragraph
//     paidCostParagraph.textContent = `Paid Cost: R ${paidAmount}`;


//     //remaining cost
//     const remainingAmount = finesData.reduce((total, fine) => total + (fine.amount-fine.paidAmount), 0);
//     const remainingCostParagraph = document.getElementById('remaining-cost');

//     // Update the content of the "Remaining Cost" paragraph
//     remainingCostParagraph.textContent = `Remaining cost: R ${remainingAmount}`;


//     const notificationsList = document.getElementById('notifications-list');

//     // Clear existing items in the list
//     notificationsList.innerHTML = '';

//     // CSS styles for the table
//     const tableStyle = `
//         /* Style for the table */
//         .fines-table {
//             border-collapse: collapse;
//             width: 100%;
//         }

//         /* Style for table header */
//         .fines-table th {
//             border: 1px solid #dddddd;
//             text-align: left;
//             padding: 8px;
//         }

//         /* Style for table data */
//         .fines-table td {
//             border: 1px solid #dddddd;
//             text-align: left;
//             padding: 8px;
//         }
//     `;

//     // Create a style element and append the CSS styles
//     const styleElement = document.createElement('style');
//     styleElement.textContent = tableStyle;

//     // Append the style element to the document head
//     document.head.appendChild(styleElement);

//     // Create a table element
//     const table = document.createElement('table');
//     table.className = 'fines-table'; // Add a class for styling

//     // Create table header row
//     const headerRow = document.createElement('tr');

//     // Create table header cells for each column
//     ['Title', 'Description', 'Amount', 'Action'].forEach(columnName => {
//         const headerCell = document.createElement('th');
//         headerCell.textContent = columnName;
//         headerRow.appendChild(headerCell);
//     });

//     // Append the header row to the table
//     table.appendChild(headerRow);

//     // Add each fine to the table
//     finesData.forEach(fine => {
//         // Create a row for the fine
//         const row = document.createElement('tr');

//         // Create cells for each property of the fine
//         ['title', 'description', 'amount', 'action'].forEach(propertyName => {
//             const cell = document.createElement('td');
//             if (propertyName === 'amount') {
//                 // Add "R" prefix before the amount
//                 cell.textContent = 'R ' + fine[propertyName];
//             }
            
//             if (propertyName === 'action') {
//                 cell.textContent = fine[propertyName];
//                 // Create a text area for entering the paid amount
//                 const textArea = document.createElement('textarea');
//                 textArea.placeholder = 'Enter amount';
//                 textArea.style.height = '30px';
//                 textArea.style.padding = '4px';
//                 textArea.style.marginLeft = '10px';
                
//                 textArea.style.boxSizing = 'border-box';
//                 cell.appendChild(textArea);
                
//                 // Create a button for paying
//                 const payButton = document.createElement('button');
//                 payButton.textContent = 'Pay';
//                 payButton.style.height = '30px';
                
//                 payButton.style.marginLeft = '10px';

//                 //update the amounts after entering an amount and then pressing pay button
//                 payButton.addEventListener('click', function() {
//                     // Get the value entered in the text area
                    
//                     const amountPaid = parseFloat(textArea.value);
    
//                     // Get the ID of the fine from the data attribute or any other method you're using to store it
//                     const fineId = fine.id;

//                     const userData = {
//                         paidAmount: amountPaid,
//                         fineId: fineId
//                     };

//                     fetch('/send-payment', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json'
//                         },
//                         body: JSON.stringify(userData)
//                     })
//                     .then(response => {
//                         if (response.ok) {
//                             return response.json();
//                         }
//                     })
//                     .then(data => {
//                         if (data.message) {
//                             alert("success");
//                             textArea.value = '';
                            
//                             // Payment successful, you may want to update the UI accordingly
//                         }
//                     })
//                     .catch(error => {
//                         console.error('Error:', error);
//                         // Handle errors here, such as displaying an error message to the user
//                     });
             

//                     // Add your logic here to handle payment, e.g., updating the database
//                     console.log('Amount paid:', amountPaid);
//                     // You might want to update UI or trigger another action after payment
//                 });
//                 cell.appendChild(payButton);
//             }

//             else {
//                 cell.textContent = fine[propertyName];
//             }
//             row.appendChild(cell);
//         });

//         // Append the row to the table
//         table.appendChild(row);
//     });

//     // Append the table to the notifications list
//     notificationsList.appendChild(table);
// }


function updateNotificationsWidget(finesData) {
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
            }
            if (propertyName === 'action') {
                const existingActionText = fine[propertyName];
                const actionCellContainer = document.createElement('div');
                actionCellContainer.style.display = 'flex';
                actionCellContainer.style.alignItems = 'center';
                actionCellContainer.style.marginLeft = '10px';
            
                const textArea = document.createElement('textarea');
                textArea.placeholder = 'Enter amount';
                textArea.style.height = '30px';
                textArea.style.padding = '4px';
                textArea.style.boxSizing = 'border-box';
                actionCellContainer.appendChild(textArea);
            
                const payButton = document.createElement('button');
                payButton.textContent = 'Pay';
                payButton.style.height = '30px';
                payButton.style.marginLeft = '10px';
                actionCellContainer.appendChild(payButton);
            
                payButton.addEventListener('click', function () {
                    const amountPaid = parseFloat(textArea.value);
                    const fineId = fine.id;
                    const userData = {
                        paidAmount: amountPaid,
                        fineId: fineId
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
                                textArea.value = '';
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                });
            
                cell.textContent = ''; // Clear existing content
                cell.appendChild(document.createTextNode(existingActionText)); // Append existing text
                cell.appendChild(actionCellContainer); // Append textarea and pay button
            }
            
            
            else {
                cell.textContent = fine[propertyName];
            }
            row.appendChild(cell);
        });
        table.appendChild(row);
    });
    notificationsList.appendChild(table);
}





