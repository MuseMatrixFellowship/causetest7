"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-customDark text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Causality.network</h1>
        <p className="text-xl mb-8">Record and Analyze your brain waves</p>
        <a 
          href="/playground/record" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
