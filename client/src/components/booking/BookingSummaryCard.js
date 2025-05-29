import React from 'react';

const BookingSummaryCard = ({ bookingDetails }) => {
  if (!bookingDetails) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 text-gray-500">
        Loading booking summary...
      </div>
    );
  }

  const {
    name = 'N/A',
    email = 'N/A',
    phone = 'N/A',
    message = '-',
    sitterName = 'Unknown',
    sitterHouse = 'Unknown',
    date = 'Not set',
    time = 'Not set',
    duration = '-',
    pet = '-',
    total = '฿0',
  } = bookingDetails;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Booking Detail</h2>

      <div className="space-y-3 text-gray-700">
        <div className="text-sm">
          <p className="font-medium">Name:</p>
          <p className="ml-2">{name}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Email:</p>
          <p className="ml-2">{email}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Phone:</p>
          <p className="ml-2">{phone}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Message:</p>
          <p className="ml-2">{message || '-'}</p>
        </div>
        <hr className="my-2 border-gray-200" />
        <div className="text-sm">
          <p className="font-medium">Pet Sitter:</p>
          <p className="ml-2">{sitterHouse} by {sitterName}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Date & Time:</p>
          <p className="ml-2">{date} | {time}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Duration:</p>
          <p className="ml-2">{duration}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Pet:</p>
          <p className="ml-2">{pet}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 my-4 pt-4 flex justify-between items-center">
        <span className="font-bold text-lg">Total</span>
        <span className="font-bold text-orange-500 text-lg">{total}</span>
      </div>
    </div>
  );
};

export default BookingSummaryCard;
