import fetch from "node-fetch";

// Reusable function for making API requests
export const makeApiRequest = async (url, body) => {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`⛔️ API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ API request successful");
    const messageContent = data.choices[0].message.content;
    return messageContent;
};