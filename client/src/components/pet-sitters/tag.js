'use client';
import { typeColorMap } from '@/utils/typeColorMap';

  const Tag = ({ type, className = "" }) => {
  const normalizedType = typeof type === 'string' ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : type;
  const { bg, text, border } = typeColorMap[normalizedType] || typeColorMap.default;


  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium capitalize border ${bg} ${text} ${border} transition hover:brightness-95 ${className}`}
    >
      {type}
    </span>
  );
};

export default Tag;
