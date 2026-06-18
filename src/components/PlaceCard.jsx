function PlaceCard({ name, description, tag, image, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-surface-container-low)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.02)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      {image && (
        <img
          src={image}
          alt={name}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: '600',
          fontSize: '14px',
          color: 'var(--color-on-surface)',
          marginBottom: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {name}
        </p>
        <p style={{
          fontSize: '12px',
          color: 'var(--color-on-surface-variant)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
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
          flexShrink: 0,
        }}>
          {tag}
        </span>
      )}
    </div>
  )
}

export default PlaceCard