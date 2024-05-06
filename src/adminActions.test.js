const { searchStaff, deleteStaff, addStaff, displayStaffList} = require('./adminActions');
const { test, expect } = require('@jest/globals');

global.fetch = jest.fn();

describe('deleteStaff', () => {
    beforeEach(() => {
        // Mock the confirm function
        global.confirm = jest.fn(() => true);
    });

    test('should send a DELETE request to the server', () => {
        const id = 123; // Example ID
        
        // Call the function being tested
        deleteStaff(id);

        // Expect fetch to be called with the correct arguments
        expect(fetch).toHaveBeenCalledWith(`/staff/${id}`, {
            method: 'DELETE'
        });
    });

    test('should update DOM after successful deletion', async () => {
        const id = 123; // Example ID
        const listItemID = 'staff-123'; // Example listItemID

        // Mock a successful response from the server
        fetch.mockResolvedValueOnce({ ok: true });

        // Call the function being tested
        await deleteStaff(id, listItemID);

        // Assert that the deleted staff member is removed from the DOM
        expect(document.getElementById(listItemID)).toBeNull();

        // You can add more assertions to ensure the DOM is updated correctly
    });

    test('should handle errors during deletion', async () => {
        const id = 123; // Example ID
        const listItemID = 'staff-123'; // Example listItemID

        // Mock an error response from the server
        fetch.mockRejectedValueOnce(new Error('Failed to delete staff member'));

        // Call the function being tested
        await deleteStaff(id, listItemID);

        // You can add assertions here to check how errors are handled
    });

    test('should show confirmation dialog before deleting', () => {
        // Call the function being tested
        deleteStaff(123);

        // Assert that the confirmation dialog is shown
        expect(confirm).toHaveBeenCalled();
    });

    /*test('should handle confirmation dialog response', async () => {
        // Mock user confirmation
        global.confirm.mockReturnValueOnce(true); // User confirms deletion
        global.confirm.mockReturnValueOnce(false); // User cancels deletion

        // Call the function being tested (confirm deletion)
        await deleteStaff(123);

        // Expect fetch to be called since deletion is confirmed
        expect(fetch).toHaveBeenCalled();

        // Call the function being tested (cancel deletion)
        await deleteStaff(456);

        // Expect fetch not to be called since deletion is canceled
        expect(fetch).not.toHaveBeenCalled();
    });

    test('should handle network errors during deletion', async () => {
        // Mock a network error response from the server
        fetch.mockRejectedValueOnce(new Error('Network error'));

        // Call the function being tested
        await expect(deleteStaff(123)).rejects.toThrow('Error deleting staff member: Network error');

        expect(fetch).toHaveBeenCalledWith(`/staff/123`, {
            method: 'DELETE'
        });

        // You can add more specific assertions here based on your error handling logic
    });

    test('should handle unexpected server responses', async () => {
        // Mock an unexpected response from the server
        fetch.mockResolvedValueOnce({ ok: false, status: 500 });

        // Call the function being tested
        await expect(deleteStaff(123)).rejects.toThrow('Error deleting staff member: 500');
    });*/

    afterEach(() => {
        jest.resetAllMocks(); // Reset mock usage data after each test
    });

});

describe('searchStaff', () => {
    // Mock the necessary DOM elements and fetch function
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="searchInput" type="text">
            <ul id="searchResults"></ul>
        `;
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    { id: 1, name: 'John Doe', email: 'john@example.com' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                ])
            })
        );
    });

    test('should display search results when search is successful', async () => {
        // Set up search input
        document.getElementById('searchInput').value = 'john';
        // Call the searchStaff function
        await searchStaff();
        // Check if search results are displayed
        expect(document.querySelectorAll('.search-result')).toHaveLength(2);
        expect(document.querySelector('.search-result').textContent).toContain('John Doe');
        expect(document.querySelector('.search-result').textContent).toContain('john@example.com');
    });

     // Test network error handling
     test('should log error message when network response is not ok', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            })
        );
        console.error = jest.fn(); // Mock console.error
        await searchStaff();
        expect(console.error).toHaveBeenCalledWith('Error searching for staff members:', expect.any(Error));
        expect(console.error.mock.calls[0][1].message).toBe('Network response was not ok');
    });
});

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Staff member added successfully' }),
  })
);

describe('addStaff', () => {
    test('should add a staff member and show success alert', async () => {
      // Mock the response from the server
      const response = { ok: true, json: () => Promise.resolve({ message: 'Success' }) };
      fetch.mockResolvedValue(response);
  
      // Mock the DOM elements and functions
      const form = { reset: jest.fn() };
      global.alert = jest.fn();
  
      // Call the function
      await addStaff(form);
  
      // Check if fetch was called with the correct URL, method, headers, and body
      expect(fetch).toHaveBeenCalledWith('/add-staff', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String)
      }));
  
      // Check if the form is reset and success alert is shown
      expect(form.reset).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Staff member added successfully');
  
      // You can also test other assertions based on the specific behavior of your code
    });
  
    // You can write more tests to cover different scenarios such as validation errors and error handling
  });

  global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ]),
  })
);

describe('displayStaffList', () => {
    test('should fetch all staff members and display them', async () => {
        // Mock the response from the server
        const staffMembers = [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ];
        const response = { ok: true, json: () => Promise.resolve(staffMembers) };
        fetch.mockResolvedValue(response);
    
        // Mock the DOM elements
        const searchResults = {
          innerHTML: '',
          appendChild: jest.fn((staffElement) => {
            console.log('Appending staff element:', staffElement);
            console.log('Current innerHTML:', searchResults.innerHTML);
            searchResults.children.push(staffElement);
          }),
          children: []
        };
        await displayStaffList();

    // Check if fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith('/all-staff');

    // Check if the search results are populated with staff members
    console.log('Final innerHTML:', searchResults.innerHTML);
    console.log('Appended staff elements:', searchResults.appendChild.mock.calls);
    expect(searchResults.children.length).toBe(2);
    expect(searchResults.innerHTML).toContain('John Doe');
    expect(searchResults.innerHTML).toContain('john@example.com');
    expect(searchResults.innerHTML).toContain('Jane Smith');

    // You can also test other assertions based on the specific behavior of your code
  });
});

