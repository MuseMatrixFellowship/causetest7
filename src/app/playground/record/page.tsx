"use client";

import { Preconnect } from "@/components/Preconnect";
import Recorder from "@/components/Recorder";
import TestEEGRecording from '@/components/TestEEGRecording';
import { MuseContext } from "@/hooks/muse.context";
import ProtectedRoutes from "@/hooks/ProtectedRoutes";
import { useContext, useState } from "react";

const RecordArea: React.FC = () => {
  const museContext = useContext(MuseContext);

  return (
    <div className="flex flex-col h-screen">
      <TestEEGRecording />
      <div className="bg-darkBlue min-h-[75vh] flex flex-col items-center justify-center text-center text-white mx-10 mb-10 p-4">
        {!museContext?.museClient ? (
          <Preconnect />
        ) : (
          <Recorder />
        )}
      </div>
    </div>
  );
};

export default ProtectedRoutes(RecordArea);
