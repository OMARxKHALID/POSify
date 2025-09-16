/**
 * Reusable Row component for displaying label-value pairs
 */

export const Row = ({ label, value, className = "" }) => (
  <div className={`flex justify-between ${className}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
