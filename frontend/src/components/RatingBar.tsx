interface RatingBarProps {
  average: number
  total: number
  distribution: { [key: number]: number }
}

const RatingBar = ({ average, total, distribution }: RatingBarProps) => {
  if (total === 0) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>No ratings yet</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.summaryRow}>
        <span style={styles.avgNumber}>⭐ {average}</span>
        <span style={styles.totalText}>{total} rating{total !== 1 ? 's' : ''}</span>
      </div>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] || 0
        const percent = total > 0 ? (count / total) * 100 : 0
        return (
          <div key={star} style={styles.barRow}>
            <span style={styles.starLabel}>{star} ★</span>
            <div style={styles.barTrack}>
              <div style={{ ...styles.barFill, width: `${percent}%` }} />
            </div>
            <span style={styles.countLabel}>{count}</span>
          </div>
        )
      })}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '4px 0' },
  summaryRow: { display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' },
  avgNumber: { fontSize: '18px', fontWeight: '600', color: '#111827' },
  totalText: { fontSize: '12px', color: '#9ca3af' },
  barRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  starLabel: { fontSize: '11px', color: '#6b7280', width: '28px', flexShrink: 0 },
  barTrack: { flex: 1, height: '8px', backgroundColor: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: '99px' },
  countLabel: { fontSize: '11px', color: '#9ca3af', width: '20px', textAlign: 'right' as const, flexShrink: 0 },
  emptyState: { padding: '16px 0', textAlign: 'center' as const },
  emptyText: { fontSize: '12px', color: '#9ca3af', margin: 0 },
}

export default RatingBar