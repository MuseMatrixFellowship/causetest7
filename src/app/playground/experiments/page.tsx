"use client";
import React from 'react';
import ExperimentList from '@/components/ExperimentList';
import ProtectedRoutes from '@/hooks/ProtectedRoutes';

const Experiments: React.FC = () => {
  return (
    <div className="bg-darkBlue min-h-[75vh] flex flex-col items-center justify-start text-white py-8 px-4 mx-10 mb-10 overflow-y-scroll">
      <ExperimentList />
    </div>
  );
};

export default ProtectedRoutes(Experiments);
