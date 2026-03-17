import { useState, useMemo } from 'react';
import useAppStore from '../store/useAppStore';

const ruoliMantra = ['Tutti', 'Por', 'DD', 'DS', 'DC', 'M/C', 'C', 'T/A', 'W', 'T', 'A', 'PC'];

function VotiBar({ voti }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {voti.map((v, i) => {
        let color = 'var(--text-muted)';
        if (v >= 7) color = 'var(--accent-green)';
        else if (v >= 6) color = 'var(--accent-amber)';
        else if (v > 0) color = 'var(--accent-red)';
        return (
          <div
            key={i}
            title={v > 0 ? v.toString() : 'SV'}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: color, flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

function StatoBadge({ infortunato, diffidato }) {
  if (infortunato) return <span className="badge badge-red">Infortunato</span>;
  if (diffidato) return <span className="badge badge-amber">Diffida</span>;
  return <span className="badge badge-green">Disponibile</span>;
}

function DettaglioGiocatore({ giocatore, onClose }) {
  if (!giocatore) return null;
  const maxVoto = Math.max(...giocatore.votiUltimi5.filter((v) => v > 0), 0.1);

  return (
    <div className="card" style={{ position: 'sticky', top: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>
            {giocatore.nome} {giocatore.cognome}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{giocatore.squadra}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Ruolo', value: giocatore.ruoloMantra },
          { label: 'Quotazione', value: `${giocatore.quotazione}M` },
          { label: 'Media Voti', value: giocatore.votoMedia.toFixed(1) },
          { label: 'Stato', value: <StatoBadge infortunato={giocatore.infortunato} diffidato={giocatore.diffidato} /> },
        ].map((item) => (
          <div key={item.label} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Andamento Voti (Ultimi 5)
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {giocatore.votiUltimi5.map((v, i) => {
            let color = 'var(--text-muted)';
            if (v >= 7) color = 'var(--accent-green)';
            else if (v >= 6) color = 'var(--accent-amber)';
            else if (v > 0) color = 'var(--accent-red)';
            const heightPct = v > 0 ? ((v - 4) / 6) * 100 : 4;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 10, color, fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                  {v > 0 ? v : 'SV'}
                </div>
                <div style={{
                  width: '100%', height: `${Math.max(heightPct, 4)}%`,
                  background: color, borderRadius: '3px 3px 0 0', opacity: 0.8,
                  minHeight: 4,
                }} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
        {giocatore.infortunato && '⚠️ Giocatore non disponibile per infortunio.'}
        {giocatore.diffidato && '⚠️ In diffida: attenzione alla prossima ammonizione.'}
        {!giocatore.infortunato && !giocatore.diffidato && '✅ Giocatore disponibile e in condizione.'}
      </div>
    </div>
  );
}

export default function LaRosa() {
  const rosa = useAppStore((s) => s.rosa);
  const [filtroRuolo, setFiltroRuolo] = useState('Tutti');
  const [filtroSquadra, setFiltroSquadra] = useState('');
  const [filtroStato, setFiltroStato] = useState('tutti');
  const [cerca, setCerca] = useState('');
  const [sortKey, setSortKey] = useState('cognome');
  const [sortDir, setSortDir] = useState(1);
  const [selezionato, setSelezionato] = useState(null);

  const squadre = useMemo(() => [...new Set(rosa.map((g) => g.squadra))].sort(), [rosa]);

  const rosaFiltrata = useMemo(() => {
    let r = [...rosa];
    if (filtroRuolo !== 'Tutti') r = r.filter((g) => g.ruoloMantra.includes(filtroRuolo));
    if (filtroSquadra) r = r.filter((g) => g.squadra === filtroSquadra);
    if (filtroStato === 'infortunati') r = r.filter((g) => g.infortunato);
    if (filtroStato === 'diffidati') r = r.filter((g) => g.diffidato);
    if (filtroStato === 'disponibili') r = r.filter((g) => !g.infortunato);
    if (cerca) r = r.filter((g) => `${g.nome} ${g.cognome}`.toLowerCase().includes(cerca.toLowerCase()));
    r.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (typeof av === 'number') return (av - bv) * sortDir;
      return av.toString().localeCompare(bv.toString()) * sortDir;
    });
    return r;
  }, [rosa, filtroRuolo, filtroSquadra, filtroStato, cerca, sortKey, sortDir]);

  const kpiRuoli = useMemo(() => {
    const ruoliBase = ['Por', 'DC', 'DD', 'DS', 'M/C', 'C', 'T/A', 'PC'];
    return ruoliBase.map((r) => ({
      ruolo: r,
      count: rosa.filter((g) => g.ruoloMantra.startsWith(r.split('/')[0])).length,
    }));
  }, [rosa]);

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => d * -1);
    else { setSortKey(key); setSortDir(1); }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
    return <span style={{ marginLeft: 4 }}>{sortDir === 1 ? '↑' : '↓'}</span>;
  }

  return (
    <div>
      {/* KPI Ruoli */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {kpiRuoli.map((k) => (
          <div key={k.ruolo} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: 'var(--accent-blue)' }}>
              {k.count}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Barlow Condensed' }}>{k.ruolo}</span>
          </div>
        ))}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Totale:</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{rosa.length}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>giocatori</span>
        </div>
      </div>

      {/* Filtri */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="input-field"
          placeholder="Cerca giocatore..."
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        <select className="input-field" value={filtroRuolo} onChange={(e) => setFiltroRuolo(e.target.value)} style={{ maxWidth: 140 }}>
          {ruoliMantra.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="input-field" value={filtroSquadra} onChange={(e) => setFiltroSquadra(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">Tutte le squadre</option>
          {squadre.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-field" value={filtroStato} onChange={(e) => setFiltroStato(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="tutti">Tutti gli stati</option>
          <option value="disponibili">Disponibili</option>
          <option value="infortunati">Infortunati</option>
          <option value="diffidati">Diffidati</option>
        </select>
      </div>

      {/* Layout tabella + dettaglio */}
      <div style={{ display: 'grid', gridTemplateColumns: selezionato ? '1fr 300px' : '1fr', gap: 16 }}>
        {/* Tabella */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('ruoloMantra')}>Ruolo<SortIcon col="ruoloMantra" /></th>
                  <th onClick={() => handleSort('cognome')}>Nome<SortIcon col="cognome" /></th>
                  <th onClick={() => handleSort('squadra')}>Squadra<SortIcon col="squadra" /></th>
                  <th onClick={() => handleSort('quotazione')}>Quota<SortIcon col="quotazione" /></th>
                  <th onClick={() => handleSort('votoMedia')}>Media<SortIcon col="votoMedia" /></th>
                  <th>Ultimi 5</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {rosaFiltrata.map((g) => (
                  <tr
                    key={g.id}
                    onClick={() => setSelezionato(selezionato?.id === g.id ? null : g)}
                    style={{ cursor: 'pointer' }}
                    className={selezionato?.id === g.id ? 'highlight' : ''}
                  >
                    <td>
                      <span className="badge badge-muted">{g.ruoloMantra}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.nome} {g.cognome}</span>
                    </td>
                    <td>{g.squadra}</td>
                    <td>
                      <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, color: 'var(--accent-amber)' }}>
                        {g.quotazione}M
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, color: g.votoMedia >= 7 ? 'var(--accent-green)' : g.votoMedia >= 6 ? 'var(--text-primary)' : 'var(--accent-red)' }}>
                        {g.votoMedia.toFixed(1)}
                      </span>
                    </td>
                    <td><VotiBar voti={g.votiUltimi5} /></td>
                    <td><StatoBadge infortunato={g.infortunato} diffidato={g.diffidato} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rosaFiltrata.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              Nessun giocatore trovato con i filtri selezionati.
            </div>
          )}
        </div>

        {/* Dettaglio */}
        {selezionato && (
          <DettaglioGiocatore
            giocatore={selezionato}
            onClose={() => setSelezionato(null)}
          />
        )}
      </div>
    </div>
  );
}
