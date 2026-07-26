import React from 'react';
import './SkeletonLoader.css';

/**
 * Skeleton loader for tables (admin dashboard)
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <table className="skeleton-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i}>
              <div className="skeleton skeleton-text"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx}>
                <div className="skeleton skeleton-text"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * Skeleton loader for image cards
 */
export const ImageCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-image"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text skeleton-text--short"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton loader for list items
 */
export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="skeleton-list">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <div className="skeleton skeleton-avatar"></div>
          <div className="skeleton-list-content">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text skeleton-text--short"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Generic skeleton block
 */
export const SkeletonBlock = ({ width = '100%', height = '20px' }) => {
  return <div className="skeleton" style={{ width, height }}></div>;
};

export default TableSkeleton;
