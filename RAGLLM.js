const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());


function retrieveDocuments(query) {
    // Example: Retrieve relevant information from a knowledge base (could be from a database, vector store, etc.)
    // For now, it returns a mock response.
    return "Relevant information retrieved from the knowledge base.";
}


function generatePrompt(query, retrievedInfo) {
    let prompt = "";
    if (query.toLowerCase().includes("research")) {
        prompt = `User asked: ${query}\nRelevant Info: ${retrievedInfo}\nAs CollegeComrade, a friendly college assistant, provide advice on applying for research.`;
    } else if (query.toLowerCase().includes("friends")) {
        prompt = `User asked: ${query}\nRelevant Info: ${retrievedInfo}\nAs CollegeComrade, a friendly college assistant, give tips on making friends in college.`;
    } else if (query.toLowerCase().includes("chores") || query.toLowerCase().includes("balance")) {
        prompt = `User asked: ${query}\nRelevant Info: ${retrievedInfo}\nAs CollegeComrade, a friendly college assistant, help with balancing chores and classes.`;
    } else {
        prompt = `User asked: ${query}\nRelevant Info: ${retrievedInfo}\nRespond as CollegeComrade, a friendly college assistant chatbot.`;
    }
    return prompt;
}

// Function to call the Gemini API with the generated prompt
async function callGeminiApi(prompt) {
    const url = "https://api.gemini.com/llm/generate";  // Replace with the actual Gemini API endpoint
    const headers = {
        "Authorization": "Bearer YOUR_GEMINI_API_KEY",  // Replace with your actual Gemini API key
        "Content-Type": "application/json"
    };
    const payload = {
        "prompt": prompt,
        "max_tokens": 250,
        "temperature": 0.7  
    };
    
    const response = await axios.post(url, payload, { headers });
    return response.data.choices[0].text;
}

app.post('/chatbot', async (req, res) => {
    try {
        const userInput = req.body.message;
        const retrievedInfo = retrieveDocuments(userInput);
        const prompt = generatePrompt(userInput, retrievedInfo);
        const generatedResponse = await callGeminiApi(prompt);

        // Return the response to the frontend
        res.json({ response: generatedResponse });
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
