'use client';

import { useEffect, useState, useCallback } from 'react';

function ReelIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="white" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,.7))' }}>
<path d="M17 2H7C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5zM9.5 15.9V8.1L16 12l-6.5 3.9z" />
  </svg>
);
}

function CarouselIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,.7))' }}>
<rect x="2" y="4.5" width="15" height="15" rx="3" />
  <path d="M20 2.5c.83 0 1.5.67 1.5 1.5v13" strokeLinecap="round" />
  </svg>
);
}

function CanvaBadge() {
  return (
    <span className="source-chip" title="Diseño de Canva">
    Canva
    </span>
  );
}

function FormatBadge({ formatos }) {
  if (!formatos || formatos.length === 0) return null;
  if (formatos.includes('Reel')) return <ReelIcon />;
    if (formatos.includes('Carrousel')) return <CarouselIcon />;
    return null;
}

function GridCell({ item, onOpen }) {
  return (
    <button type="button" className="cell" title={item.title} onClick={() => onOpen(item)}>
  {item.sourceType === 'canva' ? (
    <>
    <iframe
    src={item.embedUrl}
loading="lazy"
allow="fullscreen"
className="cell-canva-frame"
/>
  <div className="cell-click-catcher" />
  </>
) : (
  <img src={item.imageUrl} alt={item.title} loading="lazy" />
  )}

<div className="badge">
  <FormatBadge formatos={item.formatos} />
  </div>
{item.sourceType === 'canva' && (
  <div className="badge badge-bottom-left">
  <CanvaBadge />
  </div>
 )}
<div className="info">
{item.fecha ? new Date(item.fecha).toLocaleDateString('es-UY') : ''} · {item.estado || ''}
</div>
  </button>
);
}

function Lightbox({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

if (!item) return null;

return (
  <div className="lightbox-backdrop" onClick={onClose}>
  <div className="lightbox-box" onClick={(e) => e.stopPropagation()}>
<button type="button" className="lightbox-close" onClick={onClose} aria-label="Cerrar">
  ✕
  </button>

<div className="lightbox-media">
{item.sourceType === 'canva' ? (
  <iframe src={item.embedUrl} allow="fullscreen" className="lightbox-canva-frame" />
  ) : (
    <img src={item.imageUrl} alt={item.title} />
              )}
    </div>

              <div className="lightbox-meta">
              <div className="lightbox-title">{item.title}</div>
              <div className="lightbox-sub">
              {item.fecha ? new Date(item.fecha).toLocaleDateString('es-UY') : ''}
    {item.estado ? ` · ${item.estado}` : ''}
    {item.pilar ? ` · ${item.pilar}` : ''}
    </div>
    <a href={item.url} target="_blank" rel="noreferrer" className="lightbox-link">
             Abrir en Notion ↗
             </a>
             </div>
             </div>
             </div>
             );
            }

    export default function GridPage() {
    const [items, setItems] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [cols, setCols] = useState(3);
      const [dark, setDark] = useState(false);
      const [selected, setSelected] = useState(null);

    const load = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch(`/api/grid?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido consultando Notion.');
      setItems(data.items || []);
      } catch (e) {
      setError(e.message);
      } finally {
      setLoading(false);
      }
    }, []);

    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const c = parseInt(params.get('cols') || '3', 10);
      if (c === 3 || c === 4) setCols(c);
      setDark(params.get('theme') === 'dark');
      load();
    }, [load]);

    return (
    <div className={`wrap${dark ? ' dark' : ''}`}>
      <div className="toolbar">
      <span className="count">{items.length} publicaciones</span>
      <button onClick={load} disabled={loading}>
                       {loading ? 'Actualizando…' : '↻ Actualizar'}
                       </button>
                       </div>

                       {error && <div className="error">⚠ {error}</div>}

                       <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                       {items.map((item) => (
                        <GridCell key={item.id} item={item} onOpen={setSelected} />
                       ))}

      {!loading && items.length === 0 && !error && (
        <div className="empty">
        Todavía no hay publicaciones con imagen (Notion, link o Canva) y fecha cargadas en el Content Calendar.
        <br />
        Subí un archivo en "Portada", o pegá una URL / link de Canva en "Referencia", junto con una "Fecha de
        Publicación" en Notion para que aparezcan acá.
        </div>
        )}
        </div>

        <Lightbox item={selected} onClose={() => setSelected(null)} />
        </div>
        );
        }
      
