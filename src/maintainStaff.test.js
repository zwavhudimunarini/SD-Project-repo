const { 
    fetchTotalIssues, 
    updateTotalIssues, 
    updateNotificationsWidget, 
    openFeedbackModal 
} = require('./maintainStaff');
const { test, expect } = require('@jest/globals');


describe('fetchTotalIssues', () => {
    beforeEach(() => {
        fetch.resetMocks();
        console.error = jest.fn();
    });

    test('should call fetch and handle the data on successful response', async () => {
        fetch.mockResponseOnce(JSON.stringify({ issues: ['Issue 1', 'Issue 2'], ids: [1, 2] }));
        const mockUpdate = jest.fn();
        global.updateTotalIssues = mockUpdate;

        await fetchTotalIssues();
        expect(fetch).toHaveBeenCalledWith('/total-issues');
        expect(mockUpdate).toHaveBeenCalledWith(['Issue 1', 'Issue 2'], [1, 2]);
    });

    it('should log error on fetch failure', async () => {
        fetch.mockReject(new Error('Failed to fetch reported issues'));
        console.error = jest.fn();

        await fetchTotalIssues();
        expect(console.error).toHaveBeenCalledWith('Error fetching reported issues:', expect.any(Error));
    });
});


describe('updateTotalIssues', () => {
    test('should create list items for each issue', () => {
        document.body.innerHTML = `<div id="maintain-list"></div>`;
        const issues = ['Leaky faucet', 'Broken window'];
        const ids = [101, 102];

        updateTotalIssues(issues, ids);

        const list = document.getElementById('maintain-list');
        expect(list.children.length).toBe(2);
        expect(list.children[0].textContent).toBe('Leaky faucet');
        expect(list.children[1].id).toBe('issue-102');
    });
});


describe('updateNotificationsWidget', () => {
    test('should append issues to feedback list with feedback buttons', () => {
        document.body.innerHTML = `<div id="feedback-list"></div>`;
        const issues = ['Network issue', 'Server downtime'];
        const ids = [201, 202];

        updateNotificationsWidget(issues, ids);

        const list = document.getElementById('feedback-list');
        expect(list.children.length).toBe(2);
        expect(list.children[0].textContent).toContain('Network issue');
        expect(list.children[0].querySelector('button').textContent).toBe('Write Feedback');
    });
});


describe('openFeedbackModal', () => {
    test('should display the modal and set up the correct handlers', () => {
        document.body.innerHTML = `<div id="feedbackModal" style="display: none;"></div>
                                   <textarea id="feedbackTextArea"></textarea>
                                   <button id="saveFeedbackButton"></button>`;
        const modal = document.getElementById('feedbackModal');

        openFeedbackModal(300);
        expect(modal.style.display).toBe('block');
    });
});
