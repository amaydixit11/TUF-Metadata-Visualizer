import { NextResponse } from 'next/server';

/**
 * The internal URL of the RSTUF API.
 * In a Kubernetes cluster, this would be something like 'http://rstuf-api:8000/api/v1/metadata/'
 */
const RSTUF_API_INTERNAL_URL = process.env.RSTUF_API_INTERNAL_URL;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
        return NextResponse.json(
            { error: 'Missing "file" query parameter' },
            { status: 400 }
        );
    }

    if (!RSTUF_API_INTERNAL_URL) {
        console.error('RSTUF_API_INTERNAL_URL environment variable is not set');
        return NextResponse.json(
            { error: 'RSTUF API configuration is missing on the server' },
            { status: 500 }
        );
    }

    try {
        // Ensure the internal URL ends with a slash and the filename does not start with one
        const baseUrl = RSTUF_API_INTERNAL_URL.endsWith('/')
            ? RSTUF_API_INTERNAL_URL
            : `${RSTUF_API_INTERNAL_URL}/`;
        const cleanFileName = fileName.startsWith('/')
            ? fileName.substring(1)
            : fileName;

        const targetUrl = `${baseUrl}${cleanFileName}`;

        console.info(`Proxying request to RSTUF API: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            next: { revalidate: 0 }, // Disable caching for fresh metadata
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`RSTUF API responded with error: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: `RSTUF API error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error(`Proxy error fetching ${fileName} from RSTUF API:`, error);
        return NextResponse.json(
            { error: 'Internal server error while proxying to RSTUF API' },
            { status: 500 }
        );
    }
}
