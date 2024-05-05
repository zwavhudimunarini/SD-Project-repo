
function fetchFines() {
    fetch('/get-fines')
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
//     const notificationsList = document.getElementById('notifications-list');

//     // Clear existing items in the list
//     notificationsList.innerHTML = '';

//     // Add each fine to the notifications widget
//     finesData.forEach(fine => {
//         const newItem = document.createElement('li');
//         newItem.className = 'notification-item'; // Add a class for styling
//         newItem.id = `issue-${fine.id}`; // Set ID for identifying the fine

//         // Construct the content of the list item
//         newItem.innerHTML = `
//             <p>Title: ${fine.title}</p>
//             <p>Description: ${fine.description}</p>
//             <p>Amount: R ${fine.amount}</p>
//             <p>Action: ${fine.action}</p>
//             <p>Tenant Name: ${fine.tenantName}</p>
           
//         `;

//         // Create the "Delete" button
//         // const deleteButton = document.createElement('button');
//         // deleteButton.textContent = 'Delete';
//         // deleteButton.className = 'delete-button'; // Add a class for styling

//         // // Set up event listener for the delete button
//         // deleteButton.onclick = function() {
//         //     // Extract the fine ID from the ID of the parent list item
//         //     const fineId = newItem.id.split('-')[1];
//         //     console.log(fineId);

//         //     // Call a function to delete the item from the database
//         //     deleteFine(fineId);
//         // };

//         // // Append the delete button to the list item
//         // newItem.appendChild(deleteButton);

//         // Append the list item to the notifications list
//         notificationsList.appendChild(newItem);
//     });
// }

function updateNotificationsWidget(finesData) {
    const notificationsList = document.getElementById('notifications-list');

    // Clear existing items in the list
    notificationsList.innerHTML = '';

    // CSS styles for the table
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

    // Create a style element and append the CSS styles
    const styleElement = document.createElement('style');
    styleElement.textContent = tableStyle;

    // Append the style element to the document head
    document.head.appendChild(styleElement);

    // Create a table element
    const table = document.createElement('table');
    table.className = 'fines-table'; // Add a class for styling

    // Create table header row
    const headerRow = document.createElement('tr');

    // Create table header cells for each column
    ['Title', 'Description', 'Amount', 'Action', 'Tenant Name'].forEach(columnName => {
        const headerCell = document.createElement('th');
        headerCell.textContent = columnName;
        headerRow.appendChild(headerCell);
    });

    // Append the header row to the table
    table.appendChild(headerRow);

    // Add each fine to the table
    finesData.forEach(fine => {
        // Create a row for the fine
        const row = document.createElement('tr');

        // Create cells for each property of the fine
        ['title', 'description', 'amount', 'action', 'tenantName'].forEach(propertyName => {
            const cell = document.createElement('td');
            if (propertyName === 'amount') {
                // Add "R" prefix before the amount
                cell.textContent = 'R ' + fine[propertyName];
            } else {
                cell.textContent = fine[propertyName];
            }
            row.appendChild(cell);
        });

        // Append the row to the table
        table.appendChild(row);
    });

    // Append the table to the notifications list
    notificationsList.appendChild(table);
}


