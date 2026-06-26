import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getPlaces } from '../../services/adminApi'

const PRIMARY = '#3e5219'
const SAGE    = '#d0eba1'
const SURFACE = '#efefd7'
const BORDER  = '#deded0'
const MUTED   = '#6b7358'
const DEEP    = '#1a2410'

const TYPE_COLORS = {
  college:    '#3e5219',
  department: '#4e6824',
  library:    '#446464',
  building:   '#6a5e33',
  cafeteria:  '#6a8c31',
  landmark:   '#8aaf45',
  atm:        '#446464',
  bank:       '#5a8080',
  gate:       '#6b8c3a',
  mosque:     '#857645',
  outdoor:    '#709c9c',
  service:    '#a08e57',
  toilet:     '#87b8b8',
  venue:      '#baa669',
}

const STYLES = `
  @keyframes skPulse {
    0%,100% { opacity:1; }
    50%      { opacity:0.4; }
  }
  .pl-hero  { padding: 32px 36px 36px; }
  .pl-body  { padding: 28px 36px; }
  .pl-hero h1 { font-size: 28px; }
  .pl-table-row {
    display: grid;
    grid-template-columns: 48px 1fr 120px 80px;
    align-items: center;
    gap: 12px;
    padding: 13px 22px;
  }
  .pl-col-type  { display: block; }
  @media (max-width: 600px) {
    .pl-hero  { padding: 20px 16px 24px; }
    .pl-body  { padding: 16px; }
    .pl-hero h1 { font-size: 22px; }
    .pl-table-row {
      grid-template-columns: 36px 1fr 60px;
      gap: 8px;
      padding: 11px 14px;
    }
    .pl-col-type { display: none; }
  }
`

function Skel({ width = '100%', height = '40px', light, delay = 0, s }) {
  return (
    <div style={{
      width, height,
      borderRadius: '8px',
      backgroundColor: light ? 'rgba(255,255,255,0.08)' : '#e8e8d8',
      animation: `skPulse 1.6s ease-in-out ${delay}s infinite`,
      ...s,
    }} />
  )
}

function TypeBadge({ type }) {
  const color = TYPE_COLORS[type] || MUTED
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: color + '20',
      color,
      border: `1px solid ${color}40`,
      borderRadius: '99px',
      padding: '2px 10px',
      fontSize: '11px',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: '600',
      whiteSpace: 'nowrap',
    }}>
      {type}
    </span>
  )
}

function PageButton({ page, current, onClick }) {
  const isActive = page === current
  return (
    <button
      onClick={() => onClick(page)}
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        border: isActive ? 'none' : `1px solid ${BORDER}`,
        backgroundColor: isActive ? PRIMARY : '#fff',
        color: isActive ? '#fff' : MUTED,
        fontSize: '13px',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: isActive ? '700' : '400',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {page}
    </button>
  )
}

export default function Places() {
  const [data, setData]       = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [page, setPage]       = useState(1)
  const [sort, setSort]       = useState('desc')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    getPlaces({ page, sort })
      .then(res => {
        setData(res.data)
        setMeta(res.meta)
      })
      .catch(() => setError('Could not reach the server.'))
      .finally(() => setLoading(false))
  }, [page, sort])

  const allTypes = ['all', ...Array.from(new Set(data.map(p => p.type))).sort()]
  const filtered = typeFilter === 'all' ? data : data.filter(p => p.type === typeFilter)

  const goTo = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageNumbers = meta
    ? Array.from({ length: meta.last_page }, (_, i) => i + 1)
        .filter(p => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
        .reduce((acc, p, idx, arr) => {
          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
          acc.push(p)
          return acc
        }, [])
    : []

  return (
    <AdminLayout>
      <style>{STYLES}</style>

      <div
        className="pl-hero"
        style={{
          backgroundColor: DEEP,
          backgroundImage: 'radial-gradient(ellipse at 90% 0%, rgba(62,82,25,0.6) 0%, transparent 60%)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(208,235,161,0.45)',
          marginBottom: '6px',
        }}>
          Analytics
        </div>
        <h1 className="pl-hero h1" style={{
          margin: 0,
          fontWeight: '800',
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>
          Places
        </h1>
        <p style={{
          color: 'rgba(208,235,161,0.5)',
          fontSize: '13px',
          fontFamily: "'JetBrains Mono', monospace",
          margin: '4px 0 0',
        }}>
          {meta ? `${meta.total} places across the campus` : 'Loading...'}
        </p>
      </div>

      <div className="pl-body">

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}>
          {/*filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {allTypes.map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1) }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  border: typeFilter === t ? 'none' : `1px solid ${BORDER}`,
                  backgroundColor: typeFilter === t ? PRIMARY : '#fff',
                  color: typeFilter === t ? '#fff' : MUTED,
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer',
                  fontWeight: typeFilter === t ? '700' : '400',
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort */}
          <button
            onClick={() => { setSort(s => s === 'desc' ? 'asc' : 'desc'); setPage(1) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '99px',
              border: `1px solid ${BORDER}`,
              backgroundColor: '#fff',
              color: MUTED,
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {sort === 'desc' ? '↓' : '↑'} Visits
          </button>
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: '#fff',
          border: `1px solid ${BORDER}`,
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(62,82,25,0.06)',
          marginBottom: '20px',
        }}>
          <div
            className="pl-table-row"
            style={{
              backgroundColor: SURFACE,
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            {['#', 'Name', 'Type', 'Req'].map(h => (
              <span key={h} style={{
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: '700',
                color: MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(8)].map((_, i) => (
                <Skel key={i} height="36px" delay={i * 0.05} />
              ))}
            </div>
          ) : error ? (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              color: '#c00',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
            }}>
              ⚠️ {error}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: MUTED,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
            }}>
              No places found for this filter.
            </div>
          ) : (
            filtered.map((place, i) => {
              const arabic = /[\u0600-\u06FF]/.test(place.name)
              const rowNum = (page - 1) * 20 + i + 1
              return (
                <div
                  key={place.id}
                  className="pl-table-row"
                  style={{
                    borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = SURFACE}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    color: MUTED,
                  }}>
                    {rowNum}
                  </span>

                  <span style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#1b1d0e',
                    direction: arabic ? 'rtl' : 'ltr',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {place.name}
                  </span>

                  <span className="pl-col-type">
                    <TypeBadge type={place.type} />
                  </span>

                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                    fontWeight: place.requests > 0 ? '700' : '400',
                    color: place.requests > 0 ? PRIMARY : MUTED,
                  }}>
                    {place.requests}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {meta && meta.last_page > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <span style={{
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              color: MUTED,
            }}>
              Page {meta.current_page} of {meta.last_page} · {meta.total} total
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${BORDER}`,
                  backgroundColor: page === 1 ? SURFACE : '#fff',
                  color: page === 1 ? MUTED + '80' : MUTED,
                  fontSize: '13px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                ←
              </button>

              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`d${i}`} style={{
                    padding: '0 4px',
                    color: MUTED,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                  }}>
                    …
                  </span>
                ) : (
                  <PageButton key={p} page={p} current={page} onClick={goTo} />
                )
              )}

              <button
                onClick={() => goTo(page + 1)}
                disabled={page === meta.last_page}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${BORDER}`,
                  backgroundColor: page === meta.last_page ? SURFACE : '#fff',
                  color: page === meta.last_page ? MUTED + '80' : MUTED,
                  fontSize: '13px',
                  cursor: page === meta.last_page ? 'not-allowed' : 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}