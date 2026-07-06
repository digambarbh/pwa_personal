export default function TermHeader({ path }) {
  return (
    <div className="term-header">
      <span className="dot r"></span>
      <span className="dot y"></span>
      <span className="dot g"></span>
      &nbsp;placement-tracker {path}
    </div>
  );
}
