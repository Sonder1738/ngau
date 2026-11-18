
export default async (request) => {

    if (request.method !== "POST") {
        return Response.json(
            { error: "Method not allowed." },
            { status: 405 }
        );
    }

    try {

        // Get API key from Netlify environment variables
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error(
                "OPENROUTER_API_KEY is missing from Netlify."
            );
        }

        // Receive image and prompt from index.html
        const body = await request.json();

        if (!body.image || !body.prompt) {
            throw new Error("Image or prompt is missing.");
        }

        console.log("Received image analysis request.");

        // Send request to OpenRouter
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": "Bearer " + apiKey,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    model: "openrouter/free",

                    messages: [
                        {
                            role: "user",

                            content: [
                                {
                                    type: "text",
                                    text: body.prompt
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: body.image
                                    }
                                }
                            ]
                        }
                    ],

                    max_tokens: 1500
                })
            }
        );

        console.log(
            "OpenRouter HTTP status:",
            response.status
        );

        // Read raw response for diagnostics
        const responseText = await response.text();

        console.log(
            "OpenRouter response:",
            responseText.substring(0, 1000)
        );

        let data;

        try {
            data = JSON.parse(responseText);
        } catch (error) {
            throw new Error(
                "OpenRouter returned invalid JSON. HTTP status: " +
                response.status
            );
        }

        // Handle OpenRouter errors
        if (!response.ok) {

            console.error("OpenRouter error:", data);

            return Response.json(
                {
                    error: data.error?.message ||
                        "OpenRouter request failed: " +
                        response.status
                },
                { status: 502 }
            );
        }

        // Return complete OpenRouter response
        return Response.json(data);

    } catch (error) {

        console.error("Function error:", error);

        return Response.json(
            {
                error: error.message ||
                    "Internal server error."
            },
            { status: 500 }
        );

    }
};
