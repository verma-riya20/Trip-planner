import React from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

function FinalUi({ onViewTrip,disable }: any) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6 mt-3 flex flex-col items-center text-center">

      {/* top icon */}
      <div className="mb-2">
        <Loader className="h-6 w-6 animate-spin text-orange-500" />
      </div>

      {/* heading */}
      <h2 className="text-lg font-semibold text-[#ff623d] flex items-center gap-2">
        ✈️ Planning your dream trip...
      </h2>

      {/* sub text */}
      <p className="text-gray-500 text-sm mt-1">
        Gathering best destinations, activities, and travel details for you.
      </p>

      {/* Button */}
      <Button
        disabled={disable}
        onClick={onViewTrip}
        className="bg-primary hover:bg-[#ff5b38] text-white px-6 py-2 rounded-lg mt-4 font-medium"
      >
        View Trip
      </Button>
    </div>
  );
}

export default FinalUi;
