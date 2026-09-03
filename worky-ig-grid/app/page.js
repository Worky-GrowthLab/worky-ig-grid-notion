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

function FormatBadge({ formatos }) {
  if (!formatos || formatos.length === 0) return null;
  if (formatos.includes('Reel')) return <ReelIcon />;
  if (formatos.includes('Carrusel')) return <CarouselIcon />;
  return null;
}

export default function GridPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cols, setCols] = useState(3);
  const [dark, setDark] = useState(false);

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
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="cell" title={item.title}>
            <img src={item.imageUrl} alt={item.title} loading="lazy" />
            <div className="badge">
              <FormatBadge formatos={item.formatos} />
            </div>
            <div className="info">
              {item.fecha ? new Date(item.fecha).toLocaleDateString('es-UY') : ''} · {item.estado || ''}
            </div>
          </a>
        ))}

        {!loading && items.length === 0 && !error && (
          <div className="empty">
            Todavía no hay publicaciones con imagen y fecha cargadas en el Content Calendar.
            <br />
            Subí un archivo en “Files &amp; media” y una “Fecha de Publicación” en Notion para que aparezcan acá.
          </div>
        )}
      </div>
    </div>
  );
}
