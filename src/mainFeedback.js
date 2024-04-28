function fetchTotalIssues() {
    fetch('/total-issues')
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch reported issues');
        }
    })
    .then(data => {
        console.log(data);
        const { issues,ids } = data;
        
        
        updateTotalIssues(issues,ids);
    })
    .catch(error => {
        console.error('Error fetching reported issues:', error);
    });
}




function  updateTotalIssues(issues, ids) {
    const feedbackList = document.getElementById('feedback-list');

    // Clear existing items in the list
    feedbackList.innerHTML = '';

    // Add each issue to the notifications widget
    issues.forEach((issue, index) => {
        const newItem = document.createElement('li');
        newItem.className = 'notification-item'; // Add a class for styling
        newItem.id = `issue-${ids[index]}`; // Set ID for identifying the issue

        // Set the text content of the list item to the issue description
        newItem.textContent = issue;

        // Create the "Write Feedback" button
        const writeFeedbackButton = document.createElement('button');
        writeFeedbackButton.textContent = 'Write Feedback';
        writeFeedbackButton.className = 'assign-button'; // Add a class for styling
        writeFeedbackButton.onclick = function() {
            const issueId = newItem.id.split('-')[1];
            console.log(issueId);
            // Show the modal when the button is clicked
            openFeedbackModal(issueId);
        };

        // Append the button to the list item
        newItem.appendChild(writeFeedbackButton);

        // Append the list item to the notifications list
        feedbackList.appendChild(newItem);
    });
}

function openFeedbackModal(issueId) {
    const modal = document.getElementById('feedbackModal');
    modal.style.display = 'block'; // Show the modal

    // Get the textarea and save button from the modal
    const feedbackTextArea = document.getElementById('feedbackTextArea');
    const saveFeedbackButton = document.getElementById('saveFeedbackButton');

    // Set up event listener for the save button
    saveFeedbackButton.onclick = function() {
        const feedback = feedbackTextArea.value; // Get the feedback text
        console.log('Feedback:', feedback);

        // Call a function to save the feedback to the database
        saveFeedback(issueId, feedback);

        // Hide the modal after saving feedback
        modal.style.display = 'none';
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

async function saveFeedback(issueId, feedback) {
    try {
        const response = await fetch(`/update-feedback/${issueId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ feedback: feedback })
        });

        if (!response.ok) {
            throw new Error('Failed to save feedback');
        }

        const data = await response.json();
        console.log('Feedback saved successfully:', data.message);
        // You can perform additional actions after successfully saving feedback if needed
    } catch (error) {
        console.error('Error saving feedback:', error);
        // Handle error cases if necessary
    }
}