"use client";
import React from "react";
import { MuseContext } from "@/hooks/muse.context";
import { useContext } from "react";

export const Preconnect = () => {
  const museContext = useContext(MuseContext);
  console.log(museContext?.museClient?.connectionStatus);
  
  return (
    <div>
      <p className="text-lg mb-10 text-offWhite font-mono">
        This is a playground for capturing EEG data with your Muse device.
      </p>

      {!museContext?.museClient && !museContext?.museClient?.connectionStatus &&(
        <button
          className="bg-white text-lightBlue px-6 py-3 font-bold rounded-md hover:bg-opacity-90"
          onClick={async () => {
            museContext?.getMuseClient();
          }}
        >
          CONNECT MUSE HEADSET
        </button>
      )}
    </div>
  );
};
