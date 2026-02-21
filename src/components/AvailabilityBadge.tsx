import type { Stand } from '../data/types';

function getTimeSince(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getSourceLabel(source: Stand['lastStatusSource']): string {
  switch (source) {
    case 'owner_sms': return 'via owner';
    case 'community_qr': return 'via visitor';
    case 'community_app': return 'via community';
    default: return '';
  }
}

export default function AvailabilityBadge({ stand, size = 'sm' }: { stand: Stand; size?: 'sm' | 'md' }) {
  const { availabilityStatus, lastStatusUpdate, lastStatusSource } = stand;

  const timeSince = lastStatusUpdate ? getTimeSince(lastStatusUpdate) : null;
  const source = getSourceLabel(lastStatusSource);

  // Determine freshness: green < 1h, yellow < 6h, gray otherwise
  let freshness: 'fresh' | 'stale' | 'unknown' = 'unknown';
  if (lastStatusUpdate) {
    const hoursAgo = (Date.now() - new Date(lastStatusUpdate).getTime()) / 3600000;
    freshness = hoursAgo < 1 ? 'fresh' : hoursAgo < 6 ? 'stale' : 'unknown';
  }

  if (availabilityStatus === 'available') {
    const colorClass = freshness === 'fresh'
      ? 'bg-green-100 text-green-800 border-green-300'
      : freshness === 'stale'
        ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
        : 'bg-green-50 text-green-700 border-green-200';

    return (
      <span className={`inline-flex items-center gap-1.5 ${size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs'} rounded-full border font-medium ${colorClass}`}>
        <span className={`w-2 h-2 rounded-full bg-green-500 ${freshness === 'fresh' ? 'status-pulse' : ''}`} />
        Items Available
        {timeSince && (
          <span className="text-[10px] font-normal opacity-75">· {timeSince}{size === 'md' && source ? ` ${source}` : ''}</span>
        )}
      </span>
    );
  }

  if (availabilityStatus === 'sold_out') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs'} rounded-full border font-medium bg-red-50 text-red-700 border-red-200`}>
        <span className="w-2 h-2 rounded-full bg-red-400" />
        Sold Out
        {timeSince && (
          <span className="text-[10px] font-normal opacity-75">· {timeSince}</span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs'} rounded-full border font-medium bg-gray-100 text-gray-600 border-gray-200`}>
      <span className="w-2 h-2 rounded-full bg-gray-400" />
      No Recent Updates
    </span>
  );
}
