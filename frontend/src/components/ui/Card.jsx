import React from 'react';

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-[#111625] border border-gray-800 rounded-xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
