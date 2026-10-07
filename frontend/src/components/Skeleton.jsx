import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm animate-pulse flex flex-col gap-4">
      <div className="w-full h-40 bg-gray-200 rounded-2xl"></div>
      <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
      <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
      <div className="flex justify-between items-center mt-2">
        <div className="h-4 bg-gray-200 rounded-full w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded-full w-1/3"></div>
      </div>
    </div>
  );
};

export const BookingSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm animate-pulse flex flex-col md:flex-row justify-between gap-4">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-200 rounded-full w-32"></div>
          <div className="h-3 bg-gray-200 rounded-full w-48"></div>
          <div className="h-3 bg-gray-200 rounded-full w-24"></div>
        </div>
      </div>
      <div className="flex flex-col md:items-end justify-between gap-2">
        <div className="h-4 bg-gray-200 rounded-full w-16"></div>
        <div className="h-8 bg-gray-200 rounded-full w-28"></div>
      </div>
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-200 flex-shrink-0"></div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </div>
    </div>
  );
};
