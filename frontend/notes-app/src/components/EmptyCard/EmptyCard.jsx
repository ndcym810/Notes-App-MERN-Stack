import React from "react";

const EmptyCard = ({ message }) => {
  return (
    <div className="flex items-center justify-center">
      <h1 className="text-2xl font-bold text-center mt-5 w-1/2">{message}</h1>
    </div>
  );
};

export default EmptyCard;
