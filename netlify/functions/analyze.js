
export default async (request) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return Response.json(
            { error: "Missing OPENROUTER_API_KEY environment variable." },
            { status: 500 }
        );
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

    return Response.json(data, {
        status: response.ok ? 200 : 502
    });
};
