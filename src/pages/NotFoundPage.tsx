import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-up">
        <h1 className="text-7xl font-display font-bold text-forest mb-2">404</h1>
        <h2 className="text-xl font-display font-semibold text-earth mb-2">Stand not found</h2>
        <p className="text-earth-light mb-6">
          Looks like this road doesn&apos;t lead anywhere. Let&apos;s get you back on the map.
        </p>
        <Link
          to="/"
          className="inline-flex px-6 py-2.5 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light transition-colors no-underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
