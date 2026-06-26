import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import AdminLayout from './AdminLayout'
import { getAnalytics } from '../../services/adminApi'

const DEEP    = '#1a2410'
const PRIMARY = '#3e5219'
const SAGE    = '#d0eba1'
const SURFACE = '#efefd7'
const BORDER  = '#deded0'
const MUTED   = '#6b7358'

const BAR_PALETTE = ['#3e5219','#4e6824','#6a8c31','#8aaf45','#aace65']

const STYLES = `
  @keyframes skPulse {
    0%,100% { opacity:1; }
    50%      { opacity:0.4; }
  }
  .an-hero  { padding: 32px 36px 36px; }
  .an-body  { padding: 28px 36px; }
  .an-hero h1 { font-size: 28px; }
  .pr-row {
    display: grid;
    grid-template-columns: 28px 1fr auto 120px;
    align-items: center;
    gap: 12px;
    padding: 12px 22px;
  }
  .pr-badge { display: inline; }
  .pr-bar   { display: flex; }
  .pr-count-mobile { display: none; }

  @media (max-width: 600px) {
    .an-hero  { padding: 20px 16px 24px; }
    .an-body  { padding: 16px; }
    .an-hero h1 { font-size: 22px; }
    .pr-row {
      grid-template-columns: 24px 1fr 40px;
      gap: 8px;
      padding: 10px 16px;
    }
    .pr-badge { display: none; }
    .pr-bar   { display: none; }
    .pr-count-mobile { display: block; }
  }
`

function Skel({ width = '100%', height = '40px', light, delay = 0, style: s }) {
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

function HeroStat({ label, value, large }) {
  return (
    <div style={{
      flex: '1 1 120px',
      padding: '14px 16px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(208,235,161,0.12)',
      borderRadius: '12px',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(208,235,161,0.55)',
        marginBottom: '8px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: large ? '30px' : '24px',
        fontWeight: '700',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#ffffff',
        lineHeight: 1,
      }}>
        {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
      </div>
    </div>
  )
}

function Card({ title, subtitle, children, noPad }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      border: `1px solid ${BORDER}`,
      borderRadius: '14px',
      overflow: 'hidden',
      marginBottom: '20px',
      boxShadow: '0 1px 4px rgba(62,82,25,0.06)',
    }}>
      {(title || subtitle) && (
        <div style={{
          padding: '14px 18px 12px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: '700',
            color: PRIMARY,
            letterSpacing: '0.01em',
          }}>
            {title}
          </h3>
          {subtitle && (
            <span style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: MUTED,
            }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
      <div style={noPad ? {} : { padding: '18px 22px' }}>
        {children}
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      backgroundColor: DEEP,
      color: SAGE,
      padding: '8px 14px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: "'JetBrains Mono', monospace",
      boxShadow: '0 4px 16px rgba(26,36,16,0.3)',
      border: '1px solid rgba(208,235,161,0.15)',
      lineHeight: '1.6',
    }}>
      <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>{label}</strong>
      {payload[0].value} places
    </div>
  )
}

function Chip({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        color: MUTED,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '12px',
        fontWeight: '700',
        color: PRIMARY,
      }}>
        {value}
      </span>
    </div>
  )
}

export default function Analytics() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getAnalytics()
      .then(res => {
        if (res.status === 200) setData(res.data)
        else setError('Unexpected server response.')
      })
      .catch(() => setError('Could not reach the server.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AdminLayout>
      <style>{STYLES}</style>
      <div className="an-hero" style={{ backgroundColor: DEEP }}>
        <Skel width="120px" height="12px" light />
        <Skel width="240px" height="34px" light s={{ marginTop: '10px', marginBottom: '28px' }} />
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[...Array(4)].map((_, i) => (
            <Skel key={i} height="80px" light delay={i * 0.1} s={{ flex: '1 1 120px' }} />
          ))}
        </div>
      </div>
      <div className="an-body">
        {[...Array(3)].map((_, i) => (
          <Skel key={i} height="180px" delay={0.2 + i * 0.1} s={{ marginBottom: '20px', borderRadius: '14px' }} />
        ))}
      </div>
    </AdminLayout>
  )

  if (error) return (
    <AdminLayout>
      <style>{STYLES}</style>
      <div className="an-hero" style={{ backgroundColor: DEEP }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: 'rgba(208,235,161,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>Analytics</div>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#fff' }}>Overview</h1>
      </div>
      <div className="an-body">
        <div style={{ padding: '16px 20px', backgroundColor: '#fff5f5', border: '1px solid #fcc', borderRadius: '10px', fontSize: '13px', color: '#c00' }}>
          ⚠️ {error}
        </div>
      </div>
    </AdminLayout>
  )

  const { totals, paths, places, transportation } = data
  const byType         = places.by_type.map(t => ({ name: t.type, value: t.places_count }))
  const transport      = transportation.by_type
  const transportTotal = transport.reduce((s, t) => s + t.count, 0)
  const topPlaces      = places.most_requested
  const topMax         = topPlaces[0]?.requests || 1

  return (
    <AdminLayout>
      <style>{STYLES}</style>

      {/* Hero */}
      <div
        className="an-hero"
        style={{
          backgroundColor: DEEP,
          backgroundImage: 'radial-gradient(ellipse at 90% 0%, rgba(62,82,25,0.6) 0%, transparent 60%)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: '10px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(208,235,161,0.45)',
          marginBottom: '6px',
        }}>
          Analytics
        </div>
        <h1 className="an-hero h1" style={{
          margin: 0,
          fontWeight: '800',
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>
          Overview
        </h1>
        <p style={{
          color: 'rgba(208,235,161,0.5)',
          fontSize: '13px',
          fontFamily: "'JetBrains Mono',monospace",
          margin: '4px 0 24px',
        }}>
          {totals.places} places · {totals.paths.toLocaleString()} paths mapped
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <HeroStat label="Total Places"        value={totals.places}              large />
          <HeroStat label="Navigation Requests" value={totals.navigation_requests} />
          <HeroStat label="Transportations"     value={totals.transportations}     />
          <HeroStat label="Aliases"             value={totals.aliases}             />
        </div>
      </div>

      {/* Body */}
      <div className="an-body">

        {/* Places by type bar chart */}
        <Card
          title="Places by Type"
          subtitle={`${totals.places} total across ${byType.length} categories`}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byType} margin={{ top: 4, right: 8, left: -20, bottom: 56 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fill: MUTED }}
                angle={-40}
                textAnchor="end"
                interval={0}
                tickLine={false}
                axisLine={{ stroke: BORDER }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fill: MUTED }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(62,82,25,0.05)' }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={42}>
                {byType.map((_, i) => (
                  <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Transport + Paths */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <Card title="Transportation" subtitle={`${transportTotal} total routes`} noPad>
              {transport.map((t, i) => {
                const pct = Math.round((t.count / transportTotal) * 100)
                return (
                  <div key={i} style={{
                    padding: '14px 18px',
                    borderBottom: i < transport.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '7px',
                      alignItems: 'baseline',
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize', color: PRIMARY }}>
                        {t.transport_type}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: MUTED }}>
                        {t.count} · {pct}%
                      </span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', backgroundColor: SURFACE, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: PRIMARY,
                        borderRadius: '99px',
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                      }} />
                    </div>
                  </div>
                )
              })}
            </Card>
          </div>

          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <Card title="Path Stats" noPad>
              {[
                { label: 'Total Paths',   value: paths.total.toLocaleString() },
                { label: 'Accessible',    value: paths.accessible.toLocaleString() },
                { label: 'Avg Distance',  value: `${paths.average_distance.toFixed(1)} m` },
                { label: 'Avg Walk Time', value: `${Math.round(paths.average_walk_time)} s` },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '13px 18px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: MUTED,
                    fontFamily: "'JetBrains Mono',monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    fontFamily: "'JetBrains Mono',monospace",
                    color: PRIMARY,
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* Most Requested Places */}
        <Card
          title="Most Requested Places"
          subtitle={`${places.never_requested} of ${totals.places} never visited`}
          noPad
        >
          {topPlaces.map((place, i) => {
            const pct = topMax > 0 ? (place.requests / topMax) * 100 : 0
            const arabic = /[\u0600-\u06FF]/.test(place.name)
            return (
              <div
                key={place.id}
                className="pr-row"
                style={{ borderBottom: i < topPlaces.length - 1 ? `1px solid ${BORDER}` : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = SURFACE}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: '11px',
                  color: i < 3 ? PRIMARY : MUTED,
                  fontWeight: i < 3 ? '700' : '400',
                }}>
                  {i + 1}
                </span>

                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  direction: arabic ? 'rtl' : 'ltr',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#1b1d0e',
                }}>
                  {place.name}
                </span>

                <span className="pr-badge" style={{
                  fontSize: '10px',
                  fontFamily: "'JetBrains Mono',monospace",
                  color: PRIMARY,
                  backgroundColor: SAGE + '40',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  whiteSpace: 'nowrap',
                  fontWeight: '600',
                }}>
                  {place.type}
                </span>

                <div className="pr-bar" style={{ alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '5px', borderRadius: '99px', backgroundColor: SURFACE, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: pct > 0 ? PRIMARY : 'transparent',
                      borderRadius: '99px',
                    }} />
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: '12px',
                    fontWeight: '700',
                    color: place.requests > 0 ? PRIMARY : MUTED,
                    minWidth: '18px',
                    textAlign: 'right',
                  }}>
                    {place.requests}
                  </span>
                </div>

                <span className="pr-count-mobile" style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: '12px',
                  fontWeight: '700',
                  color: place.requests > 0 ? PRIMARY : MUTED,
                  textAlign: 'right',
                }}>
                  {place.requests}
                </span>
              </div>
            )
          })}

          <div style={{
            padding: '10px 18px',
            borderTop: `1px solid ${BORDER}`,
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            backgroundColor: SURFACE,
          }}>
            <Chip label="Avg requests / place" value={places.average_requests.toFixed(2)} />
            <Chip label="Never visited"        value={places.never_requested} />
          </div>
        </Card>

      </div>
    </AdminLayout>
  )
}