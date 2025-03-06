"use client";
import OpreationalButton from "@/components/OpreationalButton";
import { MuseContextProvider } from "@/hooks/muse.context";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ExperimentProvider } from "@/hooks/experiment.context";
import { ExperimentPlaygroundProvider } from "@/hooks/playground.context";

const PlayGroundLayout = ({ children }: { children: React.ReactNode }) => {
  const [selectedOperation, setSelectedOperation] = useState<string>("Record"); // Default to "Record"
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/playground/experiments") {
      setSelectedOperation("Experiments");
    } else if (pathname === "/playground/record") {
      setSelectedOperation("Record");
    }
  }, [pathname]);

  return (
    <div>
      <MuseContextProvider>
        <ExperimentPlaygroundProvider>
          <ExperimentProvider>
            <OpreationalButton
              selectedOperation={selectedOperation}
              setSelectedOperation={setSelectedOperation}
            />
            {children}
          </ExperimentProvider>
        </ExperimentPlaygroundProvider>
      </MuseContextProvider>
    </div>
  );
};

export default PlayGroundLayout;
