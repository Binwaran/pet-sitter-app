import React from 'react';

const bookingSteps = ({ currentStep }) => {
  const steps = [
    { number: 1, name: 'Your Pet' },
    { number: 2, name: 'Information' },
    { number: 3, name: 'Payment' },
  ];

  return (
    <div className="flex justify-center items-center gap-0 md:gap-8 mb-8">
      {steps.map((step) => (
        <div key={step.number} className="flex items-center min-w-[120px]">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base border-2 transition-all duration-200
              ${currentStep === step.number ? 'bg-orange-500 border-orange-500 text-white' :
                'bg-[#F5F5F7] border-[#F5F5F7] text-gray-400'}
            `}
          >
            {step.number}
          </div>
          <span
            className={`ml-3 text-base whitespace-nowrap transition-all duration-200
              ${currentStep === step.number ? 'text-orange-500 font-semibold' : 'text-gray-400'}
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