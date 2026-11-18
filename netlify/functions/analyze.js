
export default async (request) => {
    console.log("Function started.");
    console.log("Method:", request.method);

    try {
        const body = await request.json();

        console.log("POST body received.");

        return new Response(
            JSON.stringify({
                success: true,
                message: "Netlify POST is working!",
                receivedImage: !!body.image,
                receivedPrompt: !!body.prompt
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {
        console.error("Diagnostic error:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
};
