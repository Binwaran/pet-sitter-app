'use client'
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import sitters from '@/mock/sitters';

const TagPage = () => {
  const searchParams = useSearchParams();
  const tag = searchParams.get('type');
  const [filteredSitters, setFilteredSitters] = useState([]);

  useEffect(() => {
    if (tag) {
      const filtered = sitters.filter((sitter) =>
        sitter.petTypes.some(petType => petType.toLowerCase() === tag.toLowerCase())
      );
      setFilteredSitters(filtered);
    }
  }, [tag]);

  if (!tag) return <p>Loading...</p>;

  return (
    <div>
      <h1>Showing results for: {tag}</h1>
      {filteredSitters.length > 0 ? (
        filteredSitters.map((sitter) => (
          <div key={sitter.id}>
            <h2>{sitter.name}</h2>
            <p>{sitter.description}</p>
          </div>
        ))
      ) : (
        <p>No pet sitters found for this tag.</p>
      )}
    </div>
  );
};

export default TagPage;
