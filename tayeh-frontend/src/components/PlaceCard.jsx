function PlaceCard({ name, description, tag }) {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface-container-low)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div>
        <p style={{
          fontWeight: '600',
          fontSize: '14px',
          color: 'var(--color-on-surface)',
          marginBottom: '4px',
        }}>
          {name}
        </p>
        <p style={{
          fontSize: '12px',
          color: 'var(--color-on-surface-variant)',
        }}>
          {description}
        </p>
      </div>

      {tag && (
        <span style={{
          backgroundColor: 'var(--color-secondary-container)',
          color: 'var(--color-on-secondary-container)',
          fontSize: '11px',
          fontWeight: '500',
          padding: '2px 10px',
          borderRadius: 'var(--radius-full)',
          whiteSpace: 'nowrap',
          marginLeft: '8px',
        }}>
          {tag}
        </span>
      )}
    </div>
  )
}

export default PlaceCard