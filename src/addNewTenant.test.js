const submitForm = require('./addNewTenant');
const { test, expect } = require('@jest/globals');

describe('submitForm', () => {
    // Mock document and fetch API
    beforeEach(() => {
        global.document = {
            getElementById: jest.fn((id) => ({ value: id === 'password' ? '1234567' : 'test' })),
            querySelector: jest.fn(() => ({ addEventListener: jest.fn() })),
            addEventListener: jest.fn()
        };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'User created successfully' })
            })
        );

        // Mock the window.alert function
        window.alert = jest.fn();
    });

    test('should show alert when passwords do not match', () => {
        // Simulate the case where passwords do not match
        document.getElementById = jest.fn((id) => ({ value: 'password1' })); // Mock getElementById

        // Call the function being tested
        submitForm();

        // Expect an alert to be shown for passwords not matching
        expect(window.alert).toHaveBeenCalledWith('Passwords do not match');
    });

    test('should show alert when password is too short', () => {
        // Mock DOM elements with a password less than 8 characters
        document.getElementById = jest.fn((id) => ({ value: '1234567' })); // Mock getElementById

        // Call the function being tested
        submitForm();

        // Expect an alert to be shown for password too short
        expect(window.alert).toHaveBeenCalledWith('password too short');
    });

    test('should submit form when passwords match', () => {
        // Mock DOM elements with matching passwords
        document.getElementById = jest.fn().mockImplementation(id => {
            switch (id) {
                case 'name':
                    return { value: 'John Doe' };
                case 'email':
                    return { value: 'john@example.com' };
                case 'password':
                    return { value: 'password' };
                case 'confirmPassword':
                    return { value: 'password' };
                default:
                    return null;
            }
        });

        // Call submitForm function
        submitForm();

        // Expect fetch to be called with correct arguments
        expect(fetch).toHaveBeenCalledWith('/submitTenant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password',
                confirmPassword: 'password'
            })
        });
    });

    test('should show alert when passwords do not match', () => {
        // Mock DOM elements with non-matching passwords
        document.getElementById = jest.fn().mockImplementation(id => {
            switch (id) {
                case 'name':
                    return { value: 'John Doe' };
                case 'email':
                    return { value: 'john@example.com' };
                case 'password':
                    return { value: 'password' };
                case 'confirmPassword':
                    return { value: 'differentPassword' }; // Non-matching password
                default:
                    return null;
            }
        });

        // Call submitForm function
        submitForm();

        // Expect an alert to be shown
        expect(window.alert).toHaveBeenCalledWith('Passwords do not match');
    });

    test('password length validation', () => {
        // Mock DOM elements with a password less than 8 characters
        document.getElementById = jest.fn((id) => ({ value: '1234567' })); // Mock getElementById

        // Call submitForm function
        submitForm();

        // Expect alert to be called with appropriate message
        expect(window.alert).toHaveBeenCalledWith('password too short');
    });
});





