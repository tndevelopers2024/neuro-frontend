import React from 'react';

// Base Skeleton element
export const Skeleton = ({ className, ...props }) => {
  return (
    <div 
      className={`animate-pulse bg-slate-200/60 rounded-md ${className}`} 
      {...props} 
    />
  );
};

// Generic Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full bg-white border border-borderLine rounded-2xl overflow-hidden shadow-soft">
      <div className="bg-secondaryBg border-b border-borderLine p-4 flex justify-between items-center">
        <Skeleton className="h-6 w-1/4 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4 border-b border-borderLine">
                  <Skeleton className="h-4 w-24 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-borderLine/50 last:border-0">
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="p-4">
                    <Skeleton className={`h-5 ${j === 0 ? 'w-3/4' : j === columns - 1 ? 'w-8 ml-auto' : 'w-1/2'} rounded`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Generic Card Skeleton
export const CardSkeleton = () => {
  return (
    <div className="bg-white border border-borderLine rounded-2xl p-6 shadow-soft flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-5 w-40 max-w-full rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-lg mt-2" />
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-borderLine border-dashed">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
};
