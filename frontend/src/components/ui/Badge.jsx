import React from 'react';

const tones = {
  default: 'bg-gray-800 text-gray-300 border-gray-700',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/10 text-red-400 border-red-500/30',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

export default function Badge({ tone = 'default', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${tones[tone] || tones.default} ${className}`}
    >
      {children}
    </span>
  );
}
