"use client";
import { MuseClient } from "muse-js";
import { useState, createContext } from "react";
import { MuseEEGService } from "@/services/integrations/muse.service";
import { mockedMuseClient } from "@/services/integrations/mock";

export const MuseContext = createContext<null | {
  museClient: MuseClient | null;
  getMuseClient: () => void;
  museService: MuseEEGService | null;
  disconnectMuseClient: () => void;
  setMockMuseClient: () => void;
}>(null);

export const MuseContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [museClient, setMuseClient] = useState<MuseClient | null>(null);
  const [museService, setMuseService] = useState<MuseEEGService | null>(null);

  const getMuseClient = async () => {
    console.log("connecting muse device");
    const museClient = new MuseClient();

    try {
      museClient.enablePpg = true; 
      await museClient.connect(); 
      const museEEGService = new MuseEEGService(museClient);
      setMuseService(museEEGService);
      setMuseClient(museClient);
    } catch (error) {
      console.error("Error connecting to Muse device:", error);
      setMuseClient(null); 
      setMuseService(null); 
    }
  };

  const disconnectMuseClient = async () => {
    setMuseService(null);
    setMuseClient(null);
  }

  const setMockMuseClient = async () => {
    //@ts-ignore
    setMuseService(mockedMuseClient?.museClient);
    //@ts-ignore
    setMuseClient(mockedMuseClient?.museService);
  }

  return <MuseContext.Provider value={{ museClient, getMuseClient, museService, disconnectMuseClient, setMockMuseClient }}>{children}</MuseContext.Provider>;
};
