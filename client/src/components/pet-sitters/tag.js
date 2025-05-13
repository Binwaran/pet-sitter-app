'use client';
import { useRouter } from 'next/navigation';
import { typeColorMap } from '@/utils/typeColorMap';

const Tag = ({ type }) => {
  const router = useRouter();
  const { bg, text, border } = typeColorMap[type.toLowerCase()] || typeColorMap.default;

  const handleClick = (e) => {
    e.stopPropagation(); // ป้องกันไม่ให้ไป trigger คลิกของ SitterCard
    router.push(`/Tag?type=${type.toLowerCase()}`);
  };

  return (
    <span
      onClick={handleClick}
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium capitalize cursor-pointer border ${bg} ${text} ${border} transition hover:brightness-95`}
    >
      {type}
    </span>
  );
};

export default Tag;
