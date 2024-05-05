//get all the fines
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



function updateNotificationsWidget(finesData) {

    //paid cost
    const paidAmount = finesData.reduce((total, fine) => total + fine.paidAmount, 0);
    const paidCostParagraph = document.getElementById('paid-cost');

    // Update the content of the "Remaining Cost" paragraph
    paidCostParagraph.textContent = `Paid Cost: R ${paidAmount}`;


    //remaining cost
    const remainingAmount = finesData.reduce((total, fine) => total + (fine.amount-fine.paidAmount), 0);
    const remainingCostParagraph = document.getElementById('remaining-cost');

    // Update the content of the "Remaining Cost" paragraph
    remainingCostParagraph.textContent = `Remaining cost: R ${remainingAmount}`;


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


