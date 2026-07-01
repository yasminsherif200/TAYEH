import { useState, useEffect, useRef } from 'react'
import AdminLayout from './AdminLayout'
import { getPlaces, getPlaceById, updatePlace, deletePlace } from '../../services/adminApi'
import { createPortal } from 'react-dom'

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
  @keyframes modalIn {
    from { opacity:0; transform: scale(0.96) translateY(8px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }
  .pl-hero  { padding: 32px 36px 36px; }
  .pl-body  { padding: 28px 36px; }
  .pl-hero h1 { font-size: 28px; }
  .pl-table-row {
    display: grid;
    grid-template-columns: 48px 1fr 120px 80px 80px;
    align-items: center;
    gap: 12px;
    padding: 13px 22px;
    cursor: default;
  }
  .pl-col-type { display: block; }
  @media (max-width: 600px) {
    .pl-hero  { padding: 20px 16px 24px; }
    .pl-body  { padding: 16px; }
    .pl-hero h1 { font-size: 22px; }
    .pl-table-row {
      grid-template-columns: 36px 1fr 60px 60px;
      gap: 8px;
      padding: 11px 14px;
    }
    .pl-col-type { display: none; }
  }
`

function ActionMenu({ onView, onEdit, onDelete, deleting }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={deleting}
        style={{
          background: 'none',
          border: `1px solid ${BORDER}`,
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '10px',
          cursor: 'pointer',
          color: deleting ? MUTED : MUTED,
          fontFamily: "'JetBrains Mono', monospace",
          transition: 'all 0.15s',
          letterSpacing: '0.1em',
          opacity: deleting ? 0.5 : 1,
        }}
        onMouseEnter={e => { if (!deleting){
            e.currentTarget.style.backgroundColor = SURFACE
            e.currentTarget.style.borderColor = PRIMARY
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.borderColor = BORDER
        }}
      >
        {deleting ? '…' : '•••'}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 6px)',
          backgroundColor: '#fff',
          border: `1px solid ${BORDER}`,
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(26,36,16,0.12)',
          zIndex: 100,
          minWidth: '140px',
          overflow: 'hidden',
        }}>
          {[
            { label: 'View',   action: () => { onView();  setOpen(false) }, color: PRIMARY },
            { label: 'Edit',   action: () => { onEdit();  setOpen(false) }, color: MUTED   },
            { label: 'Delete', action: () => { onDelete(); setOpen(false) }, color: '#c0392b' },
          ].map(({ label, action, color }) => (
            <button
              key={label}
              onClick={action}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace",
                color,
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = SURFACE}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(26,36,16,0.5)',
          zIndex: 400, backdropFilter: 'blur(2px)',
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%', maxWidth: '400px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        zIndex: 401,
        boxShadow: '0 20px 60px rgba(26,36,16,0.25)',
        animation: 'modalIn 0.2s ease',
        padding: '28px 24px 24px',
      }}>
        {/* Icon */}
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '12px',
          backgroundColor: '#fdf0ef',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
          marginBottom: '16px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>

        <h3 style={{
          margin: '0 0 8px',
          fontSize: '16px',
          fontWeight: '700',
          color: '#1b1d0e',
        }}>
          Delete Place
        </h3>
        <p style={{
          margin: '0 0 24px',
          fontSize: '13px',
          color: MUTED,
          lineHeight: '1.6',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: `1px solid ${BORDER}`,
              background: 'none',
              fontSize: '13px',
              fontFamily: "'Manrope', sans-serif",
              color: MUTED,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loading ? '#e8c4c0' : '#c0392b',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: "'Manrope', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Deleting…' : 'Yes, delete'}
          </button>
        </div>
      </div>
    </>
  )
}

function Skel({ width = '100%', height = '40px', delay = 0, s }) {
  return (
    <div style={{
      width, height,
      borderRadius: '8px',
      backgroundColor: '#e8e8d8',
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

function StatBox({ label, value }) {
  return (
    <div style={{
      flex: '1 1 80px',
      backgroundColor: SURFACE,
      border: `1px solid ${BORDER}`,
      borderRadius: '10px',
      padding: '12px 14px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '20px',
        fontWeight: '700',
        fontFamily: "'JetBrains Mono', monospace",
        color: PRIMARY,
        lineHeight: 1,
      }}>
        {value ?? '—'}
      </div>
      <div style={{
        fontSize: '10px',
        fontFamily: "'JetBrains Mono', monospace",
        color: MUTED,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginTop: '4px',
      }}>
        {label}
      </div>
    </div>
  )
}

function PlaceModal({ placeId, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getPlaceById(placeId)
      .then(res => {
        console.log('Place response:', res)
        if (res.status === 200) setData(res.data)
        else setError('Could not load place details.')
      })
      .catch((err) => {
        console.log('Place error:', err) 
        setError('Could not reach the server.')
      })
      .finally(() => setLoading(false))

    // close on Escape
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [placeId])

  const arabic = data ? /[\u0600-\u06FF]/.test(data.name) : false

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(26,36,16,0.5)',
          zIndex: 400,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '560px',
        maxHeight: '85vh',
        backgroundColor: '#fff',
        borderRadius: '16px',
        zIndex: 401,
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(26,36,16,0.25)',
        animation: 'modalIn 0.2s ease',
      }}>

        {/* Modal Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 1,
        }}>
          <div>
            {loading ? (
              <Skel width="200px" height="22px" />
            ) : (
              <>
                <h2 style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: '700',
                  color: '#1b1d0e',
                  direction: arabic ? 'rtl' : 'ltr',
                  lineHeight: 1.3,
                }}>
                  {data?.name}
                </h2>
                {data?.type && (
                  <div style={{ marginTop: '6px' }}>
                    <TypeBadge type={data.type} />
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: MUTED,
              padding: '2px 6px',
              borderRadius: '6px',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[...Array(3)].map((_, i) => <Skel key={i} height="64px" delay={i * 0.1} s={{ flex: 1 }} />)}
              </div>
              <Skel height="14px" delay={0.2} />
              <Skel height="14px" delay={0.25} s={{ width: '80%' }} />
              <Skel height="40px" delay={0.3} />
            </div>
          ) : error ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#c00',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
            }}>
              ⚠️ {error}
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <StatBox label="Requests" value={data.requests} />
                <StatBox label="Rating"   value={data.rating ? `${data.rating}★` : '—'} />
                <StatBox label="Reviews"  value={data.reviews_count} />
                <StatBox label="Zone"     value={data.zone} />
              </div>

              {/* Description */}
              {data.description && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    margin: '0 0 6px',
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    Description
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#1b1d0e',
                    lineHeight: '1.6',
                  }}>
                    {data.description}
                  </p>
                </div>
              )}

              {/* Coordinates */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{
                  margin: '0 0 6px',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Coordinates
                </p>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: PRIMARY,
                    backgroundColor: SURFACE,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${BORDER}`,
                  }}>
                    latitude: {data.latitude}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: PRIMARY,
                    backgroundColor: SURFACE,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${BORDER}`,
                  }}>
                    longitude: {data.longitude}
                  </span>
                </div>
              </div>

              {/* Aliases */}
              {data.aliases?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    margin: '0 0 8px',
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    Aliases
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {data.aliases.map((alias, i) => (
                      <span key={i} style={{
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor: SAGE + '30',
                        color: PRIMARY,
                        border: `1px solid ${SAGE}`,
                        borderRadius: '99px',
                        padding: '3px 10px',
                        direction: /[\u0600-\u06FF]/.test(alias.name) ? 'rtl' : 'ltr',
                      }}>
                        {alias.alias || alias.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {data.tags?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    margin: '0 0 8px',
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    Tags
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {data.tags.map((tag, i) => (
                      <span key={i} style={{
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor: SURFACE,
                        color: MUTED,
                        border: `1px solid ${BORDER}`,
                        borderRadius: '99px',
                        padding: '3px 10px',
                      }}>
                        {tag.tag || tag.name || tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transportation points
              {data.transportation_points?.length > 0 && (
                <div>
                  <p style={{
                    margin: '0 0 8px',
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    Transportation
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {data.transportation_points.map((tp, i) => (
                      <div key={i} style={{
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor: SURFACE,
                        border: `1px solid ${BORDER}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#1b1d0e',
                      }}>
                        {tp.name || tp.type || tp}
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Footer with weighted score */}
              {data.weighted_score != null && (
                <div style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${BORDER}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    Weighted Score
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: PRIMARY,
                  }}>
                    {data.weighted_score.toFixed(3)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function EditModal({ placeId, onClose, onSaved }) {
  const [original, setOriginal] = useState(null)
  const [form, setForm]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)

  useEffect(() => {
    getPlaceById(placeId)
      .then(res => {
        if (res.status === 200) {
          setOriginal(res.data)
          setForm({
            name:           res.data.name           ?? '',
            type:           res.data.type           ?? '',
            description:    res.data.description    ?? '',
            zone:           res.data.zone           ?? '',
            latitude:       res.data.latitude       ?? '',
            longitude:      res.data.longitude      ?? '',
            rating:         res.data.rating         ?? '',
            weighted_score: res.data.weighted_score ?? '',
            reviews_count:  res.data.reviews_count  ?? '',
          })
        } else {
          setError('Could not load place.')
        }
      })
      .catch(() => setError('Could not reach the server.'))
      .finally(() => setLoading(false))

    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [placeId])

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      if (form.rating !== '' && (Number(form.rating) < 0 || Number(form.rating) > 5)) {
        setError('Rating must be between 0 and 5.')
        return
      }
      if (form.latitude !== '' && (Number(form.latitude) < -90 || Number(form.latitude) > 90)) {
        setError('Latitude must be between -90 and 90.')
        return
      }
      if (form.longitude !== '' && (Number(form.longitude) < -180 || Number(form.longitude) > 180)) {
        setError('Longitude must be between -180 and 180.')
        return
      }
      if (form.reviews_count !== '' && Number(form.reviews_count) < 0) {
        setError('Reviews count must be 0 or more.')
        return
      }

      setSaving(true)
      setError(null)

      const payload = {}

      // strings
      if (form.name        !== '') payload.name        = form.name
      if (form.type        !== '') payload.type        = form.type
      if (form.description !== '') payload.description = form.description
      if (form.zone        !== '') payload.zone        = String(form.zone)

      // numbers
      if (form.latitude       !== '') payload.latitude       = Number(form.latitude)
      if (form.longitude      !== '') payload.longitude      = Number(form.longitude)
      if (form.rating         !== '') payload.rating         = Number(form.rating)
      if (form.weighted_score !== '') payload.weighted_score = Number(form.weighted_score)
      if (form.reviews_count  !== '') payload.reviews_count  = parseInt(form.reviews_count, 10)

      await updatePlace(placeId, payload)
      setSuccess(true)
      setTimeout(() => onSaved(), 800)
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, name, type = 'text', inputMode }) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{
        display: 'block',
        fontSize: '11px',
        fontFamily: "'JetBrains Mono', monospace",
        color: MUTED,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '5px',
      }}>
        {label}
      </label>
      <input
        type={type}
        {...(inputMode ? { inputMode } : {})} 
        value={form[name]}
        onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '9px 12px',
          fontSize: '13px',
          fontFamily: "'Manrope', sans-serif",
          border: `1px solid ${BORDER}`,
          borderRadius: '8px',
          outline: 'none',
          color: '#1b1d0e',
          backgroundColor: '#fff',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = PRIMARY}
        onBlur={e => e.target.style.borderColor = BORDER}
      />
    </div>
  )

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(26,36,16,0.5)',
          zIndex: 400, backdropFilter: 'blur(2px)',
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%', maxWidth: '520px',
        maxHeight: '85vh',
        backgroundColor: '#fff',
        borderRadius: '16px',
        zIndex: 401,
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(26,36,16,0.25)',
        animation: 'modalIn 0.2s ease',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0,
          backgroundColor: '#fff', zIndex: 1,
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '3px',
            }}>
              Edit Place
            </div>
            <h2 style={{
              margin: 0, fontSize: '17px',
              fontWeight: '700', color: '#1b1d0e',
            }}>
              {loading ? '...' : original?.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '20px',
              color: MUTED, padding: '2px 6px',
              borderRadius: '6px', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[...Array(6)].map((_, i) => <Skel key={i} height="38px" delay={i * 0.05} />)}
            </div>
          ) : error && !form ? (
            <div style={{ color: '#c00', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>
              ⚠️ {error}
            </div>
          ) : form && (
            <>
              <Field label="Name"           name="name" />
              <Field label="Type"           name="type" />
              <Field label="Description"    name="description" />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><Field label="Latitude (-90 to 90)" name="latitude" type="text" inputMode="decimal" /></div>
                <div style={{ flex: 1 }}><Field label="Longitude (-180 to 180)" name="longitude" type="text" inputMode="decimal" /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><Field label="Zone" name="zone" type="text" /></div>
                <div style={{ flex: 1 }}><Field label="Rating (0–5)" name="rating" type="text" inputMode="decimal" /></div>
                <div style={{ flex: 1 }}><Field label="Reviews Count" name="reviews_count" type="text" inputMode="numeric" /></div>
              </div>
              <Field label="Weighted Score" name="weighted_score" type="text" inputMode="decimal" />

              {error && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#fdf0ef',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#c00',
                  marginBottom: '14px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#eaf6ec',
                  border: '1px solid #b2dfbc',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#2d7a3a',
                  marginBottom: '14px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  ✓ Saved successfully
                </div>
              )}

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '4px',
              }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: `1px solid ${BORDER}`,
                    background: 'none',
                    fontSize: '13px',
                    fontFamily: "'Manrope', sans-serif",
                    color: MUTED,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || success}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: success ? '#2d7a3a' : saving ? SURFACE : PRIMARY,
                    color: saving ? MUTED : '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: "'Manrope', sans-serif",
                    cursor: saving || success ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {saving ? 'Saving…' : success ? '✓ Saved' : 'Save changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function Places() {
  const [data, setData]             = useState([])
  const [meta, setMeta]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [page, setPage]             = useState(1)
  const [sort, setSort]             = useState('desc')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [editingId, setEditingId]     = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) 
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    try {
      await deletePlace(confirmDelete.id)
      setData(prev => prev.filter(p => p.id !== confirmDelete.id))
      setConfirmDelete(null)
    } catch (err) {
      alert(err.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

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

      {/* Modal */}
      {selectedId && createPortal(
        <PlaceModal
          placeId={selectedId}
          onClose={() => setSelectedId(null)}
        />,
        document.body
      )}

      {editingId && createPortal(        
        <EditModal
          placeId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={() => {
            setEditingId(null)
            setLoading(true)
            getPlaces({ page, sort })
              .then(res => { setData(res.data); setMeta(res.meta) })
              .catch(() => setError('Could not reach the server.'))
              .finally(() => setLoading(false))
          }}
        />,
        document.body
      )}

      {confirmDelete && createPortal(
        <ConfirmModal
          message={`"${confirmDelete.name}" will be permanently deleted and cannot be recovered.`}
          loading={!!deletingId}
          onConfirm={handleDelete}
          onCancel={() => { if (!deletingId) setConfirmDelete(null) }}
        />,
        document.body
      )}

      {/* Hero */}
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

      {/* Body */}
      <div className="pl-body">

        {/* Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}>
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
          {/* Header */}
          <div
            className="pl-table-row"
            style={{
              backgroundColor: SURFACE,
              borderBottom: `1px solid ${BORDER}`,
              cursor: 'default',
            }}
          >
            {['#', 'Name', 'Type', 'Visits', 'Actions'].map(h => (
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
                  // onClick={() => setSelectedId(place.id)}
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
                    direction: 'ltr',
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

                  {/* Actions */}
                  <ActionMenu
                    onView={() => setSelectedId(place.id)}
                    onEdit={() => setEditingId(place.id)}
                    onDelete={() => setConfirmDelete(place)}
                    deleting={deletingId === place.id}
                  />
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
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