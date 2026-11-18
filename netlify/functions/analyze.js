
export default async (request) => {

    if (request.method !== "POST") {
        return Response.json({
            success: true,
            message: "Netlify function is running!"
        });
    }

    try {
        const body = await request.json();

        return Response.json({
            success: true,
            message: "Netlify POST is working!",
            receivedImage: !!body.image,
            receivedPrompt: !!body.prompt
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 400 });
    }
};
