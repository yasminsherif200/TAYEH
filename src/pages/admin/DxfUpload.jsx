import { useState, useRef, useCallback } from 'react'
import { uploadDxfFile } from '../../services/adminApi'
import AdminLayout from './AdminLayout'
import { FileCode, UploadCloud, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'

const DEEP    = '#1a2410'
const PRIMARY = '#3e5219'
const SAGE    = '#d0eba1'
const SURFACE = '#efefd7'
const BORDER  = '#deded0'
const MUTED   = '#6b7358'
const BEIGE   = '#fbfbe2'

// Per-file status: idle | uploading | success | error
function getStatusColor(status) {
  if (status === 'success') return '#2d7a3a'
  if (status === 'error')   return '#c0392b'
  if (status === 'uploading') return PRIMARY
  return MUTED
}

function FileRow({ file, onRemove }) {
  const { name, size, status, error } = file
  const kb = (size / 1024).toFixed(1)

  const StatusIcon = () => {
    if (status === 'uploading') return <Loader size={15} style={{ animation: 'spin 1s linear infinite', color: PRIMARY }} />
    if (status === 'success')   return <CheckCircle size={15} color="#2d7a3a" />
    if (status === 'error')     return <AlertCircle size={15} color="#c0392b" />
    return null
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 1fr auto auto',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      borderBottom: `1px solid ${BORDER}`,
      transition: 'background 0.1s',
    }}
    onMouseEnter={e => { if (status === 'idle') e.currentTarget.style.background = SURFACE }}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Icon */}
      <div style={{
        width: '28px', height: '28px',
        borderRadius: '6px',
        backgroundColor: SAGE + '30',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FileCode size={14} color={PRIMARY} />
      </div>

      {/* Name + meta */}
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          fontSize: '13px', fontWeight: '600',
          color: '#1b1d0e',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </div>
        <div style={{
          fontSize: '11px',
          fontFamily: "'JetBrains Mono', monospace",
          color: getStatusColor(status),
          marginTop: '2px',
        }}>
          {status === 'idle'      && `${kb} KB`}
          {status === 'uploading' && 'Uploading…'}
          {status === 'success'   && 'Uploaded successfully'}
          {status === 'error'     && (error || 'Upload failed')}
        </div>
      </div>

      {/* Status icon */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <StatusIcon />
      </div>

      {/* Remove button — only when not uploading */}
      {status !== 'uploading' && (
        <button
          onClick={() => onRemove(file.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px', borderRadius: '4px',
            color: MUTED, display: 'flex', alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
          onMouseLeave={e => e.currentTarget.style.color = MUTED}
          aria-label="Remove file"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default function DxfUpload() {
  const [files, setFiles]       = useState([])  // { id, name, size, raw, status, error }
  const [dragging, setDragging] = useState(false)
  const inputRef                = useRef(null)

  const addFiles = useCallback((incoming) => {
    const dxf = Array.from(incoming).filter(f =>
      f.name.toLowerCase().endsWith('.dxf')
    )
    if (!dxf.length) return
    const entries = dxf.map(f => ({
      id:     crypto.randomUUID(),
      name:   f.name,
      size:   f.size,
      raw:    f,
      status: 'idle',
      error:  null,
    }))
    setFiles(prev => [...prev, ...entries])
  }, [])

  const removeFile = (id) =>
    setFiles(prev => prev.filter(f => f.id !== id))

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleUploadAll = async () => {
    const pending = files.filter(f => f.status === 'idle')
    if (!pending.length) return

    for (const file of pending) {
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ))
      try {
        await uploadDxfFile(file.raw)
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'success' } : f
        ))
      } catch (err) {
        setFiles(prev => prev.map(f =>
          f.id === file.id
            ? { ...f, status: 'error', error: err?.message || 'Upload failed' }
            : f
        ))
      }
    }
  }

  const pendingCount   = files.filter(f => f.status === 'idle').length
  const uploadingCount = files.filter(f => f.status === 'uploading').length
  const successCount   = files.filter(f => f.status === 'success').length
  const errorCount     = files.filter(f => f.status === 'error').length
  const isUploading    = uploadingCount > 0

  return (
    <AdminLayout>
      <style>{STYLES}</style>

      {/* ── Hero header ── */}
      <div
        className="dxf-hero"
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
          Map Data
        </div>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: '800',
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>
          DXF Upload
        </h1>
        <p style={{
          color: 'rgba(208,235,161,0.5)',
          fontSize: '13px',
          fontFamily: "'JetBrains Mono', monospace",
          marginTop: '6px',
          marginBottom: 0,
        }}>
          Upload AutoCAD floor plan files to update the campus map
        </p>
      </div>

      {/* ── Content ── */}
      <div className="dxf-content">

        {/* Drop zone */}
        <div
          className={`drop-zone${dragging ? ' drop-zone--active' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Drop DXF files here or click to browse"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".dxf"
            multiple
            style={{ display: 'none' }}
            onChange={e => addFiles(e.target.files)}
          />

          <div style={{
            width: '52px', height: '52px',
            borderRadius: '14px',
            backgroundColor: dragging ? SAGE + '25' : SAGE + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}>
            <UploadCloud size={26} color={dragging ? PRIMARY : MUTED} />
          </div>

          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: dragging ? PRIMARY : '#1b1d0e',
            marginBottom: '4px',
            transition: 'color 0.2s',
          }}>
            {dragging ? 'Release to add files' : 'Drop DXF files here'}
          </div>
          <div style={{
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            color: MUTED,
          }}>
            or click to browse · .dxf files only
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: '14px',
            overflow: 'hidden',
            marginBottom: '20px',
            boxShadow: '0 1px 4px rgba(62,82,25,0.06)',
          }}>
            {/* Card header */}
            <div style={{
              padding: '14px 20px 12px',
              borderBottom: `1px solid ${BORDER}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <h3 style={{
                margin: 0, fontSize: '13px',
                fontWeight: '700', color: PRIMARY,
              }}>
                Files queued
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {successCount > 0 && <StatusChip label={`${successCount} uploaded`} color="#2d7a3a" bg="#eaf6ec" />}
                {errorCount   > 0 && <StatusChip label={`${errorCount} failed`}    color="#c0392b" bg="#fdf0ef" />}
                {pendingCount > 0 && <StatusChip label={`${pendingCount} pending`}  color={MUTED}   bg={SURFACE} />}
              </div>
            </div>

            {/* Rows */}
            {files.map(f => (
              <FileRow key={f.id} file={f} onRemove={removeFile} />
            ))}

            {/* Footer actions */}
            <div style={{
              padding: '12px 20px',
              borderTop: `1px solid ${BORDER}`,
              backgroundColor: SURFACE,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <button
                onClick={() => setFiles([])}
                disabled={isUploading}
                style={{
                  background: 'none',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: MUTED,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isUploading) e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED }}
              >
                Clear all
              </button>

              <button
                onClick={handleUploadAll}
                disabled={pendingCount === 0 || isUploading}
                style={{
                  backgroundColor: pendingCount === 0 || isUploading ? SURFACE : PRIMARY,
                  color: pendingCount === 0 || isUploading ? MUTED : '#fff',
                  border: `1px solid ${pendingCount === 0 || isUploading ? BORDER : PRIMARY}`,
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: "'Manrope', sans-serif",
                  cursor: pendingCount === 0 || isUploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isUploading
                  ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</>
                  : `Upload ${pendingCount > 0 ? pendingCount : ''} file${pendingCount !== 1 ? 's' : ''}`
                }
              </button>
            </div>
          </div>
        )}

        {/* Empty hint */}
        {files.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '12px',
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            color: MUTED,
            opacity: 0.7,
          }}>
            No files selected yet
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

function StatusChip({ label, color, bg }) {
  return (
    <span style={{
      fontSize: '11px',
      fontFamily: "'JetBrains Mono', monospace",
      color,
      backgroundColor: bg,
      padding: '2px 8px',
      borderRadius: '99px',
      fontWeight: '600',
    }}>
      {label}
    </span>
  )
}

const STYLES = `
  .dxf-hero {
    padding: 32px 36px 36px;
  }
  .dxf-content {
    padding: 28px 36px;
  }
  .drop-zone {
    border: 1.5px dashed ${BORDER};
    border-radius: 14px;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    margin-bottom: 20px;
    background: #fff;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
  }
  .drop-zone:hover,
  .drop-zone:focus-visible {
    border-color: ${PRIMARY};
    background: ${SURFACE};
  }
  .drop-zone--active {
    border-color: ${PRIMARY};
    background: ${SAGE}18;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @media (max-width: 600px) {
    .dxf-hero    { padding: 20px 16px 24px; }
    .dxf-content { padding: 16px; }
    .dxf-hero h1 { font-size: 22px; }
    .drop-zone   { padding: 28px 16px; }
  }
`