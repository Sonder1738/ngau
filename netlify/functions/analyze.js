
export default async (request) => {
    if (request.method !== "POST") {
        return Response.json(
            { error: "Method not allowed." },
            { status: 405, headers: { Allow: "POST" } }
        );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return Response.json(
            { error: "API key is not configured on Netlify." },
            { status: 500 }
        );
    }

    try {
        const { image, prompt } = await request.json();

        if (
            typeof image !== "string" ||
            !/^data:image\/(jpeg|png|webp|gif);base64,/i.test(image)
        ) {
            return Response.json(
                { error: "Please provide a valid image." },
                { status: 400 }
            );
        }

        if (image.length > 5_500_000) {
            return Response.json(
                { error: "Image is too large. Maximum size is 4 MB." },
                { status: 413 }
            );
        }

        if (
            typeof prompt !== "string" ||
            !prompt.trim() ||
            prompt.length > 5000
        ) {
            return Response.json(
                { error: "Please provide a valid prompt." },
                { status: 400 }
            );
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "X-Title": "AI Image Identifier"
                },
                body: JSON.stringify({
                    model: "openrouter/free",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt.trim()
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: image
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
            return Response.json(
                {
                    error: data.error?.message ||
                        "OpenRouter API request failed."
                },
                { status: response.status }
            );
        }

        const answer = data.choices?.[0]?.message?.content;

        if (typeof answer !== "string" || !answer.trim()) {
            return Response.json(
                { error: "The AI returned an empty response." },
                { status: 502 }
            );
        }

        return Response.json({ answer });

    } catch (error) {
        console.error("Image analysis error:", error.message);

        return Response.json(
            { error: "Unable to analyze the image. Please try again." },
            { status: 500 }
        );
    }
};
