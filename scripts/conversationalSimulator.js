document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const conversationLog = document.getElementById('conversationLog');

    sendButton.addEventListener('click', function() {
        const userText = userInput.value.trim();
        if (userText) {
            appendMessage('User', userText);
            simulateResponse(userText); // Implement this function based on your scenarios
            userInput.value = ''; // Clear input after sending
        }
    });

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${sender}: ${message}`;
        conversationLog.appendChild(messageElement);

        // Auto-scroll to the latest message
        conversationLog.scrollTop = conversationLog.scrollHeight;
    }

    function simulateResponse(userInput) {
        // Example response logic
        const response = "This is a placeholder response. Implement scenarios and logic.";
        setTimeout(() => appendMessage('Bot', response), 1000);
    }
});