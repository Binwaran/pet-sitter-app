import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const SearchHeader = () => {
  return (
    <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row items-center justify-between rounded-md w-full">
      <h1 className="text-xl font-semibold text-gray-800 text-center sm:text-left w-full sm:w-auto m-auto md:ml-20">
        Search For Pet Sitter
      </h1>
     
      <div className=" w-full m-auto md:mr-20 flex flex-row sm:flex-row md:flex-row lg:flex-row items-center gap-4 pt-5 sm:w-auto justify-center sm:justify-start">
     
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-500 border-solid py-2 px-16 rounded-md hover:text-orange-500 hover:border-orange-500 transition-all duration-300 ease-in-out sm:w-auto w-full justify-center">
          <FontAwesomeIcon icon={faListUl} className="text-gray-500" />
          List
        </button>

        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-500 border-solid py-2 px-16 rounded-md hover:text-orange-500 hover:border-orange-500 transition-all duration-300 ease-in-out sm:w-auto w-full justify-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500" />
          Map
        </button>
      </div>
    </div>
  );
};

export default SearchHeader;
