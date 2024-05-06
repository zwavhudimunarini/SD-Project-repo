const { 
    updateTotalIssues,
    saveFeedback,
    openFeedbackModal,
    fetchTotalIssues 
} = require('./mainFeedback');
const { test, expect } = require('@jest/globals');

describe('updateTotalIssues', () => {
    beforeEach(() => {
        document.body.innerHTML = '<ul id="feedback-list"></ul>';
    });

    test('should add issues to the DOM', () => {
        const issues = ['Issue 1', 'Issue 2'];
        const ids = [123, 456];

        updateTotalIssues(issues, ids);

        const list = document.getElementById('feedback-list');
        const firstItemText = list.children[0].childNodes[0].nodeValue.trim(); 
        expect(firstItemText).toBe('Issue 1');
    });

    test('should clear previous issues before adding new ones', () => {
        const initialIssues = ['Initial Issue'];
        const initialIds = [789];

        updateTotalIssues(initialIssues, initialIds);
        updateTotalIssues(issues, ids);

        const list = document.getElementById('feedback-list');
        expect(list.children.length).toBe(2);
    });
});


describe('openFeedbackModal', () => {
    beforeEach(() => {
        // Set up the DOM elements needed for the test
        document.body.innerHTML = `
            <div id="feedbackModal" style="display: none;"></div>
            <textarea id="feedbackTextArea"></textarea>
            <button id="saveFeedbackButton"></button>
        `;
    });

    test('should display the feedback modal', () => {
        const modal = document.getElementById('feedbackModal');
        openFeedbackModal('123');
        expect(modal.style.display).toBe('block');
    });
});


describe('saveFeedback', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Feedback saved successfully' })
        }));
    });

    test('should call fetch with the correct parameters', async () => {
        await saveFeedback('123', 'Good job');

        expect(fetch).toHaveBeenCalledWith(`/update-feedback/123`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ feedback: 'Good job' })
        });
    });

    test('should handle server errors gracefully', async () => {
        fetch.mockImplementationOnce(() => Promise.resolve({
            ok: false
        }));

        await expect(saveFeedback('123', 'Good job')).rejects.toThrow('Failed to save feedback');
    });
});
