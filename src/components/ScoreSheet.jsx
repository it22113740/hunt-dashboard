import { formatCount } from '../lib/format'

function Column({ title, approved, rejected, pending }) {
  const waiting =
    pending > 0
      ? `${formatCount(pending)} still waiting for a store to review`
      : 'Nothing waiting for review'

  return (
    <section className="score__col">
      <h2>{title}</h2>
      <div className="score__pair">
        <p>
          <span className="score__num score__num--ok">{formatCount(approved)}</span>
          <span className="score__label">Approved</span>
        </p>
        <p>
          <span className="score__num score__num--no">{formatCount(rejected)}</span>
          <span className="score__label">Rejected</span>
        </p>
      </div>
      <p className="score__wait">{waiting}</p>
    </section>
  )
}

export function ScoreSheet({ media, compact = false }) {
  return (
    <div className={compact ? 'score score--compact' : 'score'}>
      <Column
        title="Photos"
        approved={media.approvedPhotos}
        rejected={media.rejectedPhotos}
        pending={media.pendingPhotos}
      />
      <Column
        title="Videos"
        approved={media.approvedVideos}
        rejected={media.rejectedVideos}
        pending={media.pendingVideos}
      />
    </div>
  )
}
