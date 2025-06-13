import React from 'react';

// Helper to format time as HH:mm
function formatTimeHM(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

const BookingSummaryCard = ({ bookingDetails, sitterTradeName }) => {
  if (!bookingDetails) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 text-gray-500">
        Loading booking summary...
      </div>
    );
  }

  // Debug logs for checking values
  console.log('BookingSummaryCard bookingDetails:', bookingDetails);
  console.log('BookingSummaryCard sitterTradeName:', sitterTradeName);

  // Use real data from bookingDetails, fallback if missing
  const name = bookingDetails.name || 'N/A';
  const email = bookingDetails.email || 'N/A';
  const phone = bookingDetails.phone || 'N/A';
  const message = bookingDetails.message || '-';

  // Sitter info: prioritize sitterTradeName, then fallback to other fields
  const sitterHouse = sitterTradeName || bookingDetails.trade_name || bookingDetails.sitterHouse || bookingDetails.sitterHouseName || '';
  const sitterName = bookingDetails.trade_name || 'Unknown'; // Keep sitterName separate

  // Date & Time
  const date = bookingDetails.date || '-';
  // Prefer start_time/end_time for time range
  let timeRange = '-';
  if (bookingDetails.start_time && bookingDetails.end_time) {
    timeRange = `${formatTimeHM(bookingDetails.start_time)} - ${formatTimeHM(bookingDetails.end_time)}`;
  } else if (bookingDetails.time) {
    timeRange = bookingDetails.time;
  }
  // Duration
  const durationHour = bookingDetails.duration_hour || bookingDetails.duration || '-';
  // Pet: show names if pets is array, else fallback
  let petDisplay = '-';
  if (Array.isArray(bookingDetails.pets) && bookingDetails.pets.length > 0) {
    petDisplay = bookingDetails.pets.map(p => p.pet_name || p.name || p).join(', ');
  } else if (bookingDetails.pet) {
    petDisplay = bookingDetails.pet;
  }
  // Total
  const total = bookingDetails.total ? `${parseFloat(bookingDetails.total).toLocaleString(undefined, { minimumFractionDigits: 2 })} THB` : '฿0';

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
          <p className="ml-2">{sitterHouse ? `${sitterHouse} by ${sitterName}` : sitterName}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Date & Time:</p>
          <p className="ml-2">{date} | {timeRange}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Duration:</p>
          <p className="ml-2">{durationHour}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Pet:</p>
          <p className="ml-2">{petDisplay}</p>
        </div>
      </div>
      <div className="border-t border-gray-200 my-4 pt-4">
      </div>
      <div className="-mx-6 -mb-6 bg-black text-white rounded-b-2xl flex justify-between items-center px-6 py-5 text-lg font-semibold">
        <span>Total</span>
        <span>{total}</span>
      </div>
    </div>
  );
};

export default BookingSummaryCard;