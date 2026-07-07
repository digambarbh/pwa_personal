import TermHeader from "./TermHeader";

export default function SkeletonLoader({ path = "--loading" }) {
  return (
    <div className="page">
      <TermHeader path={path} />
      
      <div className="skeleton-card">
        <div className="skeleton-line skeleton-shimmer title"></div>
        <div className="skeleton-line skeleton-shimmer short"></div>
      </div>

      <div className="skeleton-card">
        <div className="skeleton-line skeleton-shimmer title"></div>
        <div className="skeleton-line skeleton-shimmer"></div>
        <div className="skeleton-line skeleton-shimmer"></div>
        <div className="skeleton-line skeleton-shimmer short"></div>
        <div className="skeleton-box skeleton-shimmer" style={{ marginTop: 12 }}></div>
      </div>
      
      <div className="skeleton-card">
        <div className="skeleton-line skeleton-shimmer title"></div>
        <div className="skeleton-line skeleton-shimmer"></div>
        <div className="skeleton-line skeleton-shimmer short"></div>
      </div>
    </div>
  );
}
