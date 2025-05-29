// src/components/booking/BookingSteps.js
import React from 'react';

const bookingSteps = ({ currentStep }) => {
  const steps = [
    { number: 1, name: 'Your Pet' },
    { number: 2, name: 'Information' },
    { number: 3, name: 'Payment' },
  ];

  return (
    <div className="flex justify-center items-center gap-4 md:gap-8 mb-8">
      {steps.map((step) => (
        <div key={step.number} className="flex items-center flex-col md:flex-row gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${currentStep === step.number ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}
              ${currentStep > step.number ? 'bg-green-500 text-white' : ''}
            `}
          >
            {step.number}
          </div>
          <span
            className={`text-sm md:text-base whitespace-nowrap
              ${currentStep === step.number ? 'font-semibold text-gray-800' : 'text-gray-500'}
            `}
          >
            {step.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default bookingSteps;