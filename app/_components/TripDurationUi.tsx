import React, { useState } from "react";

function TripDurationUi({ onSelectedOption }: any) {
  const [days, setDays] = useState(7);

  const increase = () => setDays(days + 1);
  const decrease = () => {
    if (days > 1) setDays(days - 1);
  };

  const handleConfirm = () => {
    onSelectedOption(`${days} Days`);
  };

  return (
    <div className="mt-3 flex flex-col items-center gap-3">
      <p className="text-gray-700 font-medium text-sm">
        How many days do you want to travel?
      </p>

      <div className="flex items-center gap-6 bg-white shadow-md rounded-2xl px-6 py-4 border">
        {/* Decrease Button */}
        <button
          onClick={decrease}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex justify-center items-center text-lg font-bold"
        >
          −
        </button>

        {/* Day Counter */}
        <span className="text-lg font-semibold">{days} Days</span>

        {/* Increase Button */}
        <button
          onClick={increase}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex justify-center items-center text-lg font-bold"
        >
          +
        </button>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        className="bg-[#ff4d22] hover:bg-[#ff2e00] text-white font-medium px-6 py-2 rounded-lg shadow"
      >
        Confirm
      </button>
    </div>
  );
}

export default TripDurationUi;
