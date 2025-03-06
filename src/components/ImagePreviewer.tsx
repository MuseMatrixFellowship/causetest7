import { useExperimentPlayground } from "@/hooks/playground.context";
import React, { useState, useEffect } from "react";
import { useExperimentContext } from "@/hooks/experiment.context";

interface ImagePreviewOverlayProps {
  images: string[];
  duration: number; 
  interval: number; 
  baseline: boolean; 
  onClose: () => void; 
  experimentId: string; 
}

const ImagePreviewOverlay: React.FC<ImagePreviewOverlayProps> = ({
  images,
  duration,
  interval,
  baseline,
  onClose,
  experimentId,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(-1); 
  const [message, setMessage] = useState<string>("Starting image preview...");
  const [isPreviewing, setIsPreviewing] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(5); 
  const [showBaseline, setShowBaseline] = useState<boolean>(false); 
  const { experiments, updateExperiment } = useExperimentContext(); 
  const { startMuseRecording, updateMuseRecordingEvent, stopMuseRecording } = useExperimentPlayground();

  useEffect(() => {
    if (countdown > 0) {
      const countdownInterval = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(countdownInterval);
    } else {
      startMuseRecording(); 
      setCurrentIndex(0);    
    }
  }, [countdown]);

  
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (currentIndex === -1) {
      console.log("Starting image preview...");
      setMessage("");
    } else if (currentIndex < images.length) {
      if (baseline && interval > 0) {
        setShowBaseline(true);
        updateMuseRecordingEvent(experimentId, "Baseline", "Baseline");

        timeout = setTimeout(() => {
          setShowBaseline(false); 
          timeout = setTimeout(() => {
            setCurrentIndex((prevIndex) => prevIndex + 1); 
            updateMuseRecordingEvent(
              experimentId,
              images[currentIndex],
              `Experiment Image ${currentIndex + 1}`
            );
          }, duration * 1000); 
        }, interval * 1000); 
      } else {
        timeout = setTimeout(() => {
          setCurrentIndex((prevIndex) => prevIndex + 1); 
          updateMuseRecordingEvent(
            experimentId,
            images[currentIndex],
            `Experiment Image ${currentIndex + 1}`
          );
        }, duration * 1000); 
      }
    } else {
      
      const experiment = experiments.find((exp) => exp.id === experimentId);
      if (experiment) {
        const updatedExperiment = { ...experiment, isRecorded: false };
        updateExperiment(updatedExperiment); 
      }
      onClose(); 
    }

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
  ]);

  return (
    <div
      className={`fixed min-w-screen inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-300 p-4 ${
        isPreviewing ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className="absolute top-4 right-4 text-buttonBlue text-lg font-bold rounded px-4 py-2 cursor-pointer"
      >
        X
      </div>
      {countdown > 0 ? (
        <div className="text-center">
          <p>Ensure that the user is wearing the EEG device </p>
          <p>Experiment is starting in</p>
          <p className="text-white text-6xl font-bold">{countdown}</p>
        </div>
      ) : showBaseline ? ( 
        <div className="flex items-center justify-center w-[80%] h-[80%] border-white border-2">
          <div className="text-white text-4xl font-bold">+</div>
        </div>
      ) : message ? (
        <p className="text-white text-xl font-bold">{message}</p>
      ) : (
        <img
          src={images[currentIndex]}
          alt={`Experiment image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      )}
    </div>
  );
};

export default ImagePreviewOverlay;
