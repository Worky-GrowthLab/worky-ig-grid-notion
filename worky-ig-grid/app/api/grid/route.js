export const dynamic = 'force-dynamic'; // nunca cachear: las URLs de archivos de Notion vencen

const NOTION_VERSION = '2025-09-03';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const dataSourceId = searchParams.get('ds') || process.env.NOTION_DATA_SOURCE_ID;
    const platform = searchParams.get('platform') || 'Instagram / Facebook';
    const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10) || 24, 60);

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
            { property: 'Plataforma', multi_select: { contains: platform } },
            { property: 'Fecha de Publicación', date: { is_not_empty: true } },
            {
                or: [
                    { property: 'Portada', files: { is_not_empty: true } },
                    { property: 'Referencia', url: { is_not_empty: true } },
                    ],
            },
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

         const portadaFiles = props['Portada']?.files || [];
        const portadaFile = portadaFiles[0];
        const portadaUrl = portadaFile
        ? portadaFile.type === 'file'
            ? portadaFile.file?.url
            : portadaFile.external?.url
            : null;

         const referenciaUrl = props['Referencia']?.url || null;
        const isCanva = !!referenciaUrl && /canva\.com/i.test(referenciaUrl);

         let imageUrl = null;
        let embedUrl = null;
        let sourceType = null;

         if (portadaUrl) {
             imageUrl = portadaUrl;
             sourceType = 'notion';
         } else if (referenciaUrl && isCanva) {
             embedUrl = referenciaUrl;
             sourceType = 'canva';
         } else if (referenciaUrl) {
             imageUrl = referenciaUrl;
             sourceType = 'link';
         }

         const titleParts = props['Titulo']?.title || [];
        const title = titleParts.map((t) => t.plain_text).join('') || 'Sin título';

         const formatoName = props['Formato']?.select?.name || null;
        const formatos = formatoName ? [formatoName] : [];
        const estado = props['Estado']?.status?.name || null;
        const pilar = props['Pilar de contenido']?.select?.name || null;
        const fecha = props['Fecha de Publicación']?.date?.start || null;

         return {
             id: page.id,
             url: page.url,
             title,
             imageUrl,
             embedUrl,
             sourceType,
             formatos,
             estado,
             pilar,
             fecha,
         };
    })
    .filter((item) => !!item.imageUrl || !!item.embedUrl);

return Response.json({ items, count: items.length });
}
