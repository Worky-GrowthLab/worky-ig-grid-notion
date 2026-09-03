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

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 4v5h-5" />
    </svg>
  );
}

function ChevronIcon({ dir }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
  {dir === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
   </svg>
   );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
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

function GridCell({ item, index, onOpen }) {
  return (
    <button type="button" className="cell" title={item.title} onClick={() => onOpen(index)}>
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

function Lightbox({ items, index, onClose, onNav }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const item = index != null ? items[index] : null;

useEffect(() => {
  setMenuOpen(false);
}, [index]);

useEffect(() => {
  const onKey = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNav(-1);
    if (e.key === 'ArrowRight') onNav(1);
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [onClose, onNav]);

if (!item) return null;

const hasMultiple = items.length > 1;

return (
  <div className="lightbox-backdrop" onClick={onClose}>
  <div className="lightbox-box" onClick={(e) => e.stopPropagation()}>
<div className="lightbox-topbar">
  <div className="lightbox-menu-wrap">
  <button
type="button"
className="lightbox-icon-btn"
onClick={() => setMenuOpen((v) => !v)}
aria-label="Más opciones"
>
  <DotsIcon />
  </button>
{menuOpen && (
  <div className="lightbox-menu">
  <a href={item.url} target="_blank" rel="noreferrer" className="lightbox-menu-item">
  Abrir en Notion ↗
  </a>
  </div>
)}
</div>
<button type="button" className="lightbox-icon-btn" onClick={onClose} aria-label="Cerrar">
  ✕
  </button>
  </div>

{hasMultiple && (
  <button
 type="button"
 className="lightbox-nav lightbox-nav-left"
 onClick={() => onNav(-1)}
 aria-label="Anterior"
 >
   <ChevronIcon dir="left" />
   </button>
 )}

<div className="lightbox-media">
{item.sourceType === 'canva' ? (
  <iframe src={item.embedUrl} allow="fullscreen" className="lightbox-canva-frame" />
  ) : (
    <img src={item.imageUrl} alt={item.title} />
              )}
    </div>

              {hasMultiple && (
                <button
              type="button"
              className="lightbox-nav lightbox-nav-right"
              onClick={() => onNav(1)}
    aria-label="Siguiente"
              >
              <ChevronIcon dir="right" />
              </button>
              )}

    <div className="lightbox-meta">
    <div className="lightbox-title">{item.title}</div>
<div className="lightbox-sub">
{item.fecha ? new Date(item.fecha).toLocaleDateString('es-UY') : ''}
{item.estado ? ` · ${item.estado}` : ''}
{item.pilar ? ` · ${item.pilar}` : ''}
</div>
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
  const [selectedIndex, setSelectedIndex] = useState(null);

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

const navigate = useCallback(
  (delta) => {
    setSelectedIndex((cur) => {
      if (cur == null || items.length === 0) return cur;
      return (cur + delta + items.length) % items.length;
    });
  },
  [items.length]
  );

return (
  <div className={`wrap${dark ? ' dark' : ''}`}>
<div className="toolbar">
  <span className="count">{items.length} publicaciones</span>
<button
className={`icon-btn${loading ? ' spinning' : ''}`}
onClick={load}
disabled={loading}
aria-label="Actualizar"
title="Actualizar"
>
  <RefreshIcon />
  </button>
  </div>

{error && <div className="error">⚠ {error}</div>}

<div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
{items.map((item, i) => (
  <GridCell key={item.id} item={item} index={i} onOpen={setSelectedIndex} />
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

<Lightbox items={items} index={selectedIndex} onClose={() => setSelectedIndex(null)} onNav={navigate} />
  </div>
);
}
