import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const SearchHeader = () => {
  const pathname = usePathname();
  const isListPage = pathname === '/pet-sitters';
  const isMapPage = pathname === '/pet-sitters/SearchMap';

  return (
    <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row items-center justify-between rounded-md w-full">
      <h1 className="text-xl font-semibold text-gray-800 text-center sm:text-left w-full sm:w-auto m-auto md:ml-20">
        Search For Pet Sitter
      </h1>

      <div className="flex flex-row items-center gap-4 w-auto pt-5 justify-center sm:justify-start">
        <Link href="/pet-sitters">
          <button
            className={`flex items-center gap-2 text-sm py-2 px-16 rounded-md border border-solid transition-all duration-300
              ${isListPage
                ? 'text-orange-500 border-orange-500'
                : 'text-gray-600 border-gray-500 hover:text-orange-500 hover:border-orange-500'}
            `}
          >
            <FontAwesomeIcon
              icon={faListUl}
              className={`${isListPage ? 'text-orange-500' : 'text-gray-500'}`}
            />
            List
          </button>
        </Link>

        <Link href="/pet-sitters/SearchMap">
          <button
            className={`flex items-center gap-2 text-sm py-2 px-16 rounded-md border border-solid transition-all duration-300
              ${isMapPage
                ? 'text-orange-500 border-orange-500'
                : 'text-gray-600 border-gray-500 hover:text-orange-500 hover:border-orange-500'}
            `}
          >
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className={`${isMapPage ? 'text-orange-500' : 'text-gray-500'}`}
            />
            Map
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SearchHeader;
