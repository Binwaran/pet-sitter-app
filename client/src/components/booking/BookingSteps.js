import React from 'react';

const BookingSteps = ({ currentStep }) => { // เปลี่ยนชื่อ function เป็น PascalCase ตาม convention
  const steps = [
    { number: 1, name: 'Your Pet' },
    { number: 2, name: 'Information' },
    { number: 3, name: 'Payment' },
  ];

  return (
    <div className="flex justify-center items-center gap-4 md:gap-8  p-6 w-full">
      <div className="flex justify-between items-center w-full max-w-2xl gap-4">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center min-w-[90px] md:min-w-[120px]">
            <div
              className={`w-12 h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-lg md:text-base border-2 transition-all duration-200
                ${currentStep === step.number
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : step.number < currentStep
                    ? 'bg-black border-black text-orange-400'
                    : 'bg-[#F5F5F7] border-[#F5F5F7] text-gray-400'}
              `}
            >
              {step.number}
            </div>
            <span
              className={`ml-3 text-base md:text-base whitespace-nowrap transition-all duration-200
                ${currentStep === step.number
                  ? 'text-orange-500 font-semibold'
                  : step.number < currentStep
                    ? 'text-black font-semibold'
                    : 'text-gray-400'}
              `}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingSteps;