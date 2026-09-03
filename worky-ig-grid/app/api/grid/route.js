export const dynamic = 'force-dynamic'; // nunca cachear: las URLs de archivos de Notion vencen

const NOTION_VERSION = '2025-09-03';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const dataSourceId = searchParams.get('ds') || process.env.NOTION_DATA_SOURCE_ID;
    const platform = searchParams.get('platform') || 'Instagram / Facebook';    const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10) || 24, 60);

const token = process.env.NOTION_TOKEN;

if (!token) {
    return Response.json(
        { error: 'Falta NOTION_TOKEN en las variables de entorno de Vercel.' },
        { status: 500 }
        );
}
    if (!dataSourceId) {
        return Response.json(
            { error: 'Falta el data source id (variable NOTION_DATA_SOURCE_ID o parámetro ?ds=).' },
            { status: 400 }
            );
    }

const body = {
    filter: {
        and: [
            { property: 'Plataforma', multi_select: { contains: platform } },            { property: 'Archivos y multimedia', files: { is_not_empty: true } },
            { property: 'Fecha de Publicación', date: { is_not_empty: true } },
            ],
    },
    sorts: [{ property: 'Fecha de Publicación', direction: 'descending' }],
    page_size: limit,
};

let res;
    try {
        res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        });
    } catch (e) {
        return Response.json({ error: `No se pudo contactar a Notion: ${e.message}` }, { status: 502 });
    }

if (!res.ok) {
    const errText = await res.text();
    return Response.json(
        { error: `Notion API respondió ${res.status}: ${errText}` },
        { status: 502 }
        );
}

const data = await res.json();

const items = (data.results || [])
    .map((page) => {
        const props = page.properties || {};

         const filesProp = props['Archivos y multimedia']?.files || [];
        const firstFile = filesProp[0];
        const imageUrl = firstFile
        ? firstFile.type === 'file'
            ? firstFile.file?.url
            : firstFile.external?.url
            : null;

         const titleParts = props['Titulo']?.title || [];
        const title = titleParts.map((t) => t.plain_text).join('') || 'Sin título';

         const formatos = (props['Formato']?.multi_select || []).map((o) => o.name);
        const estado = props['Estado']?.status?.name || null;
        const pilar = props['Pilar de contenido']?.select?.name || null;
        const fecha = props['Fecha de Publicación']?.date?.start || null;

         return {
             id: page.id,
             url: page.url,
             title,
             imageUrl,
             formatos,
             estado,
             pilar,
             fecha,
         };
    })
    .filter((item) => !!item.imageUrl);

return Response.json({ items, count: items.length });
}
