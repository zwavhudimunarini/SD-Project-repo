// Import the functions to test
const { fetchFines, updateNotificationsWidget } = require('./finesIssued'); // Adjust the path as needed

// Mocking fetch globally for all tests
global.fetch = jest.fn();

// Describe the test suite
describe('Fine management functions', () => {

    // Setup mock DOM elements for the tests
    let mockPaidCostParagraph, mockRemainingCostParagraph, mockNotificationsList;

    beforeEach(() => {
        // Clear mocks
        fetch.mockClear();

        // Setup mock DOM elements
        mockPaidCostParagraph = {
            textContent: '',
        };
        mockRemainingCostParagraph = {
            textContent: '',
        };
        mockNotificationsList = {
            innerHTML: '',
            appendChild: jest.fn(),
        };

        // Mock `document.getElementById` to return the mock elements
        global.document.getElementById = jest.fn((id) => {
            if (id === 'paid-cost') {
                return mockPaidCostParagraph;
            } else if (id === 'remaining-cost') {
                return mockRemainingCostParagraph;
            } else if (id === 'notifications-list') {
                return mockNotificationsList;
            }
            return null;
        });
    });

    /*test('fetchFines should call fetch and updateNotificationsWidget with the fetched data', async () => {
        // Mock response from fetch
        const response = [
            { title: 'Fine 1', description: 'Late Rent', amount: 100, paidAmount: 30, action: 'Warning', tenantName: 'John Doe' },
            { title: 'Fine 2', description: 'Property Damage', amount: 200, paidAmount: 50, action: 'Charge', tenantName: 'Alice Smith' }
        ];
        
        // Mock the fetch function to return the mocked response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => response,
        });

        // Spy on updateNotificationsWidget
        const updateSpy = jest.spyOn(global, 'updateNotificationsWidget');

        // Call the function being tested
        await fetchFines();

        // Verify that fetch was called with the correct URL
        expect(fetch).toHaveBeenCalledWith('/get-fines');

        // Verify that updateNotificationsWidget was called with the correct data
        expect(updateSpy).toHaveBeenCalledWith(response);

        // Restore the spy
        updateSpy.mockRestore();
    });*/

    test('updateNotificationsWidget should display correct paid and remaining cost and create a table with fines data', () => {
        // Sample fine data
        const fineData = [
            { title: 'Fine 1', description: 'Late Rent', amount: 100, paidAmount: 30, action: 'Warning', tenantName: 'John Doe' },
            { title: 'Fine 2', description: 'Property Damage', amount: 200, paidAmount: 50, action: 'Charge', tenantName: 'Alice Smith' }
        ];

        // Call the function being tested
        updateNotificationsWidget(fineData);

        // Verify that the paid cost paragraph was updated correctly
        expect(mockPaidCostParagraph.textContent).toBe('Paid Cost: R 80');

        // Verify that the remaining cost paragraph was updated correctly
        expect(mockRemainingCostParagraph.textContent).toBe('Remaining cost: R 220');

        // Verify that the notifications list was cleared
        expect(mockNotificationsList.innerHTML).toBe('');

        // Verify that a table was appended to the notifications list
        expect(mockNotificationsList.appendChild).toHaveBeenCalledTimes(1);

        // Verify the table creation
        const mockTable = mockNotificationsList.appendChild.mock.calls[0][0];
        const rows = mockTable.querySelectorAll('tr');
        expect(rows.length).toBe(3); // Header row + 2 fines

        // Verify that the table rows contain the correct data
        const row1Cells = rows[1].querySelectorAll('td');
        expect(row1Cells[0].textContent).toBe('Fine 1');
        expect(row1Cells[1].textContent).toBe('Late Rent');
        expect(row1Cells[2].textContent).toBe('R 100');
        expect(row1Cells[3].textContent).toBe('Warning');
        expect(row1Cells[4].textContent).toBe('John Doe');

        const row2Cells = rows[2].querySelectorAll('td');
        expect(row2Cells[0].textContent).toBe('Fine 2');
        expect(row2Cells[1].textContent).toBe('Property Damage');
        expect(row2Cells[2].textContent).toBe('R 200');
        expect(row2Cells[3].textContent).toBe('Charge');
        expect(row2Cells[4].textContent).toBe('Alice Smith');
    });
    // Test error handling in fetchFines
/*test('fetchFines should handle fetch errors correctly', async () => {
    // Mock fetch to reject the promise
    const error = new Error('Network error');
    fetch.mockRejectedValueOnce(error);

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Call the function being tested
    await fetchFines();

    // Verify that console.error was called with the correct error message
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching fines:', error);

    // Restore the console.error spy
    consoleErrorSpy.mockRestore();
});*/

// Test updateNotificationsWidget with empty fines data
test('updateNotificationsWidget should handle empty fines data', () => {
    // Call the function with empty fines data
    updateNotificationsWidget([]);

    // Verify that the paid cost paragraph was updated correctly
    expect(mockPaidCostParagraph.textContent).toBe('Paid Cost: R 0');

    // Verify that the remaining cost paragraph was updated correctly
    expect(mockRemainingCostParagraph.textContent).toBe('Remaining cost: R 0');

    // Verify that the notifications list was cleared
    expect(mockNotificationsList.innerHTML).toBe('');
});

// Test updateNotificationsWidget with unexpected data structures
/*test('updateNotificationsWidget should handle unexpected data structures', () => {
    // Sample data with unexpected structure
    const fineData = [
        { unexpectedProperty: 'Test', anotherUnexpectedProperty: 123 }
    ];

    // Call the function being tested
    updateNotificationsWidget(fineData);

    // Verify that the paid cost paragraph was updated correctly
    expect(mockPaidCostParagraph.textContent).toBe('Paid Cost: R 0');

    // Verify that the remaining cost paragraph was updated correctly
    expect(mockRemainingCostParagraph.textContent).toBe('Remaining cost: R 0');

    // Verify that the notifications list was cleared
    expect(mockNotificationsList.innerHTML).toBe('');
});

// Test the behavior of updateNotificationsWidget with different data
test('updateNotificationsWidget should handle fines data with different data types and values', () => {
    // Sample data with a variety of data types and values
    const fineData = [
        { title: 'Fine 1', description: 'Late Rent', amount: 100.5, paidAmount: 30.1, action: 'Warning', tenantName: 'John Doe' },
        { title: 'Fine 2', description: 'Property Damage', amount: 200, paidAmount: 0, action: 'Charge', tenantName: null }
    ];

    // Call the function being tested
    updateNotificationsWidget(fineData);

    // Verify that the paid cost paragraph was updated correctly
    expect(mockPaidCostParagraph.textContent).toBe('Paid Cost: R 30.1');

    // Verify that the remaining cost paragraph was updated correctly
    expect(mockRemainingCostParagraph.textContent).toBe('Remaining cost: R 270.4');

    // Verify that a table was appended to the notifications list
    expect(mockNotificationsList.appendChild).toHaveBeenCalledTimes(1);

    // Verify the table structure and content
    const mockTable = mockNotificationsList.appendChild.mock.calls[0][0];
    const rows = mockTable.querySelectorAll('tr');
    expect(rows.length).toBe(3); // Header row + 2 fines

    // Verify that the table rows contain the correct data
    const row1Cells = rows[1].querySelectorAll('td');
    expect(row1Cells[0].textContent).toBe('Fine 1');
    expect(row1Cells[1].textContent).toBe('Late Rent');
    expect(row1Cells[2].textContent).toBe('R 100.5');
    expect(row1Cells[3].textContent).toBe('Warning');
    expect(row1Cells[4].textContent).toBe('John Doe');

    const row2Cells = rows[2].querySelectorAll('td');
    expect(row2Cells[0].textContent).toBe('Fine 2');
    expect(row2Cells[1].textContent).toBe('Property Damage');
    expect(row2Cells[2].textContent).toBe('R 200');
    expect(row2Cells[3].textContent).toBe('Charge');
    expect(row2Cells[4].textContent).toBe('null');
});*/

});
