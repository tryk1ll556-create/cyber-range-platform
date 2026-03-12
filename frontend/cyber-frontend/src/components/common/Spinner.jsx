import React from 'react';

const Spinner = ({ size = 'w-5 h-5', color = 'border-[#00f0ff]' }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`${size} border-2 ${color} border-t-transparent rounded-full animate-spin`}
        style={{ borderTopColor: 'transparent' }}
      ></div>
    </div>
  );
};

export default Spinner;