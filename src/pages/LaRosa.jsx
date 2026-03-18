import { useState, useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import AddPlayerModal from '../components/ui/AddPlayerModal';
import { RUOLI_MANTRA } from '../data/mockData';

const RUOLI_FILTRO = ['Tutti', ...RUOLI_MANTRA];
const RUOLI_KPI = ['Por', 'DC', 'DD', 'DS', 'M/C', 'C', 'T/A', 'PC'];

/* ── Sub-componenti ──────────────────────────────────────── */

function StatoBadge({ infortunato, diffidato }) {
  if (infortunato) return <span className="badge badge-red">Infortunato</span>;
  if (diffidato) return <span className="badge badge-amber">Diffida</span>;
  return <span className="badge badge-green">Disponibile</span>;
}

function VotiDots({ voti }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {voti.map((v, i) => {
        let color = 'var(--text-muted)';
        if (v >= 7) color = 'var(--green)';
        else if (v >= 6) color = 'var(--amber)';
        else if (v > 0) color = 'var(--red)';
        return (
          <div
            key={i}
            title={v > 0 ? String(v) : 'SV'}
            style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}
          />
        );
      })}
    </div>
  );
}

function DettaglioGiocatore({ giocatore, onModifica, onRimuovi, onClose }) {
  if (!giocatore) return null;

  const votiValidi = giocatore.votiUltimi5.filter((v) => v > 0);
  const mediaUltimi3 = votiValidi.slice(-3).length > 0
    ? votiValidi.slice(-3).reduce((s, v) => s + v, 0) / votiValidi.slice(-3).length
    : null;
  const inForma = mediaUltimi3 != null && mediaUltimi3 >= giocatore.votoMedia;

  return (
    <div className="glass-elevated" style={{ position: 'sticky', top: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {giocatore.nome} {giocatore.cognome}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{giocatore.squadra}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, padding: 2, lineHeight: 1 }}
        >✕</button>
      </div>

      {/* Badge stato + forma */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatoBadge infortunato={giocatore.infortunato} diffidato={giocatore.diffidato} />
        {mediaUltimi3 != null && (
          <span className={`badge badge-${inForma ? 'green' : 'red'}`}>
            {inForma ? 'In forma' : 'In calo'}
          </span>
        )}
      </div>

      {/* Dati griglia */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Ruolo', value: giocatore.ruoloMantra },
          { label: 'Quotazione', value: `${giocatore.quotazione}M` },
          { label: 'Media Voti', value: giocatore.votoMedia.toFixed(1) },
          { label: 'Media Ultimi 3', value: mediaUltimi3 != null ? mediaUltimi3.toFixed(1) : '—' },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'var(--bg-glass)',
            borderRadius: 8, padding: '10px 12px',
            border: '1px solid rgba(168,85,247,0.1)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Grafico voti */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Andamento Voti (Ultimi 5)
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
          {giocatore.votiUltimi5.map((v, i) => {
            let color = 'var(--text-muted)';
            if (v >= 7) color = 'var(--green)';
            else if (v >= 6) color = 'var(--amber)';
            else if (v > 0) color = 'var(--red)';
            const heightPct = v > 0 ? ((v - 4) / 6) * 100 : 4;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 9, color, fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                  {v > 0 ? v : 'SV'}
                </div>
                <div style={{
                  width: '100%', height: `${Math.max(heightPct, 4)}%`,
                  background: color, borderRadius: '3px 3px 0 0', opacity: 0.85,
                  minHeight: 4, boxShadow: `0 0 6px ${color}55`,
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Note stato */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0', borderTop: '1px solid var(--gold-border)', marginBottom: 14 }}>
        {giocatore.infortunato && '⚠️ Giocatore non disponibile per infortunio.'}
        {giocatore.diffidato && !giocatore.infortunato && '⚠️ In diffida: attenzione alla prossima ammonizione.'}
        {!giocatore.infortunato && !giocatore.diffidato && '✅ Giocatore disponibile e in condizione.'}
      </div>

      {/* Azioni */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={onModifica}>
          ✏️ Modifica
        </button>
        <button className="btn-danger" style={{ flex: 1 }} onClick={onRimuovi}>
          🗑️ Rimuovi
        </button>
      </div>
    </div>
  );
}

/* ── Componente principale ───────────────────────────────── */

export default function LaRosa() {
  const rosa = useAppStore((s) => s.rosa);
  const removeGiocatore = useAppStore((s) => s.removeGiocatore);

  const [showAdd, setShowAdd] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [filtroRuolo, setFiltroRuolo] = useState('Tutti');
  const [filtroSquadra, setFiltroSquadra] = useState('');
  const [filtroStato, setFiltroStato] = useState('tutti');
  const [cerca, setCerca] = useState('');
  const [sortKey, setSortKey] = useState('cognome');
  const [sortDir, setSortDir] = useState(1);
  const [selezionato, setSelezionato] = useState(null);

  const squadre = useMemo(() => [...new Set(rosa.map((g) => g.squadra))].sort(), [rosa]);

  const kpiRuoli = useMemo(() => RUOLI_KPI.map((r) => ({
    ruolo: r,
    count: rosa.filter((g) => g.ruoloMantra.startsWith(r.split('/')[0])).length,
  })), [rosa]);

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

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => d * -1);
    else { setSortKey(key); setSortDir(1); }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
    return <span style={{ marginLeft: 4, color: 'var(--gold)' }}>{sortDir === 1 ? '↑' : '↓'}</span>;
  }

  function handleRemove(g) {
    if (window.confirm(`Rimuovere ${g.nome} ${g.cognome} dalla rosa?`)) {
      removeGiocatore(g.id);
      if (selezionato?.id === g.id) setSelezionato(null);
    }
  }

  /* ── Empty state ─────────────────────────────────────── */
  if (rosa.length === 0) {
    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 className="section-title">La Rosa</h2>
            <p className="section-subtitle">Gestisci i tuoi giocatori</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            + Aggiungi Giocatore
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">La tua rosa è vuota</div>
            <div className="empty-state-desc">
              Aggiungi i tuoi giocatori per iniziare. Usa il pulsante in alto a destra.
            </div>
            <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => setShowAdd(true)}>
              + Aggiungi il primo giocatore
            </button>
          </div>
        </div>

        {showAdd && (
          <AddPlayerModal onClose={() => setShowAdd(false)} />
        )}
      </div>
    );
  }

  /* ── Layout principale ───────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 className="section-title" style={{ margin: 0 }}>La Rosa</h2>
          <span className="badge badge-gold">{rosa.length} giocatori</span>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          + Aggiungi Giocatore
        </button>
      </div>

      {/* KPI ruoli */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {kpiRuoli.map((k) => (
          <div key={k.ruolo} style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--gold-border)',
            borderRadius: 8, padding: '6px 14px',
            display: 'flex', alignItems: 'center', gap: 6,
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, color: 'var(--gold)' }}>
              {k.count}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Barlow Condensed' }}>{k.ruolo}</span>
          </div>
        ))}
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
          {RUOLI_FILTRO.map((r) => <option key={r} value={r}>{r}</option>)}
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
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('ruoloMantra')} style={{ cursor: 'pointer' }}>
                    Ruolo<SortIcon col="ruoloMantra" />
                  </th>
                  <th onClick={() => handleSort('cognome')} style={{ cursor: 'pointer' }}>
                    Nome<SortIcon col="cognome" />
                  </th>
                  <th onClick={() => handleSort('squadra')} style={{ cursor: 'pointer' }}>
                    Squadra<SortIcon col="squadra" />
                  </th>
                  <th onClick={() => handleSort('quotazione')} style={{ cursor: 'pointer' }}>
                    Quota<SortIcon col="quotazione" />
                  </th>
                  <th onClick={() => handleSort('votoMedia')} style={{ cursor: 'pointer' }}>
                    Media<SortIcon col="votoMedia" />
                  </th>
                  <th>Ultimi 5</th>
                  <th>Stato</th>
                  <th style={{ textAlign: 'center' }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {rosaFiltrata.map((g) => (
                  <tr
                    key={g.id}
                    onClick={() => setSelezionato(selezionato?.id === g.id ? null : g)}
                    style={{
                      cursor: 'pointer',
                      background: selezionato?.id === g.id ? 'rgba(168,85,247,0.06)' : undefined,
                      borderLeft: selezionato?.id === g.id ? '2px solid var(--purple)' : '2px solid transparent',
                    }}
                  >
                    <td>
                      <span className="badge badge-muted">{g.ruoloMantra}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.nome} {g.cognome}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{g.squadra}</td>
                    <td>
                      <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, color: 'var(--gold)' }}>
                        {g.quotazione}M
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'Barlow Condensed', fontWeight: 700,
                        color: g.votoMedia >= 7 ? 'var(--green)' : g.votoMedia >= 6 ? 'var(--amber)' : 'var(--red)',
                      }}>
                        {g.votoMedia.toFixed(1)}
                      </span>
                    </td>
                    <td><VotiDots voti={g.votiUltimi5} /></td>
                    <td><StatoBadge infortunato={g.infortunato} diffidato={g.diffidato} /></td>
                    <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          title="Modifica"
                          onClick={() => setEditPlayer(g)}
                          style={{
                            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
                            borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13,
                            color: 'var(--purple)', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.22)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.12)'; }}
                        >✏️</button>
                        <button
                          title="Rimuovi"
                          onClick={() => handleRemove(g)}
                          style={{
                            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                            borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13,
                            color: 'var(--red)', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.22)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rosaFiltrata.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Nessun giocatore trovato con i filtri selezionati.
            </div>
          )}
        </div>

        {/* Pannello dettaglio */}
        {selezionato && (
          <DettaglioGiocatore
            giocatore={selezionato}
            onClose={() => setSelezionato(null)}
            onModifica={() => { setEditPlayer(selezionato); setSelezionato(null); }}
            onRimuovi={() => handleRemove(selezionato)}
          />
        )}
      </div>

      {/* Modali */}
      {showAdd && (
        <AddPlayerModal onClose={() => setShowAdd(false)} />
      )}
      {editPlayer && (
        <AddPlayerModal
          onClose={() => setEditPlayer(null)}
          giocatoreEsistente={editPlayer}
        />
      )}
    </div>
  );
}
