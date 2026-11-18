
export default async (request) => {
    if (request.method !== "POST") {
        return Response.json(
            { error: "Method not allowed." },
            { status: 405 }
        );
    }

    try {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error("OPENROUTER_API_KEY is missing from Netlify.");
        }

        const body = await request.json();

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

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter error:", data);

            return Response.json(
                {
                    error: data.error?.message ||
                        "OpenRouter request failed."
                },
                { status: 502 }
            );
        }

        return Response.json(data);

    } catch (error) {
        console.error("Function error:", error);

        return Response.json(
            {
                error: error.message || "Internal server error."
            },
            { status: 500 }
        );
    }
};
