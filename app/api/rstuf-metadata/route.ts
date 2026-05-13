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

    // SECURITY: Prevent path traversal attacks
    // Ensure the filename doesn't contain path separators or '..'
    if (fileName.includes('/') || fileName.includes('\\') || fileName.includes('..')) {
        return NextResponse.json(
            { error: 'Invalid filename provided' },
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
        // Ensure the internal URL ends with a slash
        const baseUrl = RSTUF_API_INTERNAL_URL.endsWith('/')
            ? RSTUF_API_INTERNAL_URL
            : `${RSTUF_API_INTERNAL_URL}/`;

        const targetUrl = `${baseUrl}${fileName}`;

        console.info(`Proxying request to RSTUF API: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            next: { revalidate: 0 }, // Disable caching for fresh metadata
            headers: {
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout to prevent hanging
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

    } catch (error: any) {
        if (error.name === 'TimeoutError') {
            console.error(`Timeout fetching ${fileName} from RSTUF API`);
            return NextResponse.json(
                { error: 'RSTUF API request timed out' },
                { status: 504 }
            );
        }
        console.error(`Proxy error fetching ${fileName} from RSTUF API:`, error);
        return NextResponse.json(
            { error: 'Internal server error while proxying to RSTUF API' },
            { status: 500 }
        );
    }
}
