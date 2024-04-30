const { deleteStaff } = require('./adminActions');

describe('deleteStaff', () => {
    beforeEach(() => {
        // Mock the confirm function
        global.confirm = jest.fn(() => true);

        // Mock the fetch function
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true // Mocking a successful response for simplicity
            })
        );

        // Mock other necessary DOM elements and functions if needed
    });

    test('should send a DELETE request to the server when user confirms deletion', async () => {
        const staffId = 123; // Example staff ID
        const listItemID = 'staff-123'; // Example list item ID

        // Call the function being tested
        await deleteStaff(staffId, listItemID);

        // Expect fetch to be called with the correct arguments
        expect(fetch).toHaveBeenCalledWith(`/staff/${staffId}`, {
            method: 'DELETE'
        });

        // Additional expectations as needed
    });

    test('should not send a DELETE request when user cancels deletion', async () => {
        // Mock the confirm function to return false
        global.confirm = jest.fn(() => false);

        // Call the function being tested
        await deleteStaff(123, 'staff-123');

        // Expect fetch not to have been called
        expect(fetch).not.toHaveBeenCalled();

        // Additional expectations as needed
    });

    test('should handle errors during deletion process', async () => {
        // Mock the fetch function to simulate an error response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500 // Example error status code
            })
        );

        // Spy on console.error
        console.error = jest.fn();

        // Call the function being tested
        await deleteStaff(123, 'staff-123');

        // Expectations
        expect(console.error).toHaveBeenCalledWith('Error deleting staff member:', 500);

        // Additional expectations as needed
    });

    // Add more test cases as needed
});
