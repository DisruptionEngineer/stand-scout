import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-forest mb-2">404</h1>
        <h2 className="text-xl font-semibold text-earth mb-2">Page not found</h2>
        <p className="text-earth-light mb-6">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex px-6 py-2.5 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-light transition-colors no-underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
