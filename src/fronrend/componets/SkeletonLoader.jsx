import React from 'react';
import './SkeletonLoader.css';

/**
 * Skeleton loader for tables (admin dashboard, bookings)
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <table className="skeleton-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i}>
              <div className="skeleton skeleton-text" style={{ width: '80%', height: '14px' }}></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx}>
                <div className="skeleton skeleton-text" style={{ width: colIdx === 0 ? '50%' : '90%', height: '12px' }}></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * Skeleton loader for room cards
 */
export const RoomCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="rooms-grid">
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="room-card skeleton-container">
          <div className="room-image-wrapper">
            <div className="skeleton skeleton-image" style={{ height: '240px', width: '100%' }}></div>
          </div>
          <div className="room-card-body" style={{ padding: '20px' }}>
            <div className="skeleton skeleton-text" style={{ width: '70%', height: '20px', marginBottom: '12px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '90%', height: '14px', marginBottom: '8px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '85%', height: '14px', marginBottom: '20px' }}></div>
            <div className="room-meta" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }}></div>
              <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }}></div>
            </div>
            <div className="room-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '100px', height: '24px' }}></div>
              <div className="skeleton" style={{ width: '110px', height: '38px', borderRadius: '20px' }}></div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

/**
 * Skeleton loader for tour cards
 */
export const TourCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="tours-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="tour-card skeleton-container" style={{ borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
          <div className="skeleton skeleton-image" style={{ height: '200px', width: '100%' }}></div>
          <div style={{ padding: '16px' }}>
            <div className="skeleton skeleton-text" style={{ width: '80%', height: '18px', marginBottom: '10px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '95%', height: '14px', marginBottom: '6px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '90%', height: '14px', marginBottom: '16px' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '80px', height: '20px' }}></div>
              <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: '6px' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton loader for blogs
 */
export const BlogCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="blogs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="blog-card skeleton-container" style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="skeleton skeleton-image" style={{ height: '180px', width: '100%' }}></div>
          <div style={{ padding: '16px' }}>
            <div className="skeleton skeleton-text" style={{ width: '50%', height: '12px', marginBottom: '8px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '85%', height: '16px', marginBottom: '12px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '95%', height: '14px', marginBottom: '16px' }}></div>
            <div className="skeleton" style={{ width: '90px', height: '24px', borderRadius: '4px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton loader for attractions
 */
export const AttractionCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="attractions_grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="attraction_card skeleton-container">
          <div className="attraction_card_image">
            <div className="skeleton skeleton-image" style={{ height: '220px', width: '100%' }}></div>
          </div>
          <div className="attraction_card_body">
            <div className="skeleton skeleton-text" style={{ width: '70%', height: '18px', marginBottom: '8px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '95%', height: '14px', marginBottom: '16px' }}></div>
            <div className="skeleton" style={{ width: '110px', height: '36px', borderRadius: '6px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton loader for admin dashboard stats
 */
export const DashboardStatsSkeleton = () => {
  return (
    <div className="admin-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="stat-card skeleton-container" key={i} style={{ display: 'flex', padding: '20px', borderRadius: '8px', border: '1px solid #eee', background: '#fff' }}>
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '8px', marginRight: '16px' }}></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="skeleton skeleton-text" style={{ width: '40%', height: '24px', marginBottom: '6px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '75%', height: '12px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * General section loader
 */
export const PageSectionSkeleton = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="skeleton skeleton-text" style={{ width: '30%', height: '28px', marginBottom: '16px', marginInline: 'auto' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '50%', height: '16px', marginBottom: '32px', marginInline: 'auto' }}></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="skeleton" style={{ height: '300px', borderRadius: '8px' }}></div>
        <div className="skeleton" style={{ height: '300px', borderRadius: '8px' }}></div>
        <div className="skeleton" style={{ height: '300px', borderRadius: '8px' }}></div>
      </div>
    </div>
  );
};

export const SkeletonBlock = ({ width = '100%', height = '20px', borderRadius = '4px' }) => {
  return <div className="skeleton" style={{ width, height, borderRadius }}></div>;
};

export default TableSkeleton;
