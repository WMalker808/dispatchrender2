function bannerTitle({ timing, schedDate, schedTime }) {
  if (timing === 'immediate') return 'Breaking news email sent'
  if (timing === 'scheduled') return `Breaking news email scheduled for ${schedDate} ${schedTime} (local)`
  return 'Breaking news email queued for intelligent delivery'
}

export default function SuccessBanner({ info, onDismiss }) {
  return (
    <div className="success-banner">
      <span className="success-title">{bannerTitle(info)}</span>
      <button className="success-dismiss" onClick={onDismiss} aria-label="Dismiss">&times;</button>
    </div>
  )
}
