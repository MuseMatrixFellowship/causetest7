import React from "react";
import ImagePreviewOverlay from "./ImagePreviewer";

interface ExperimentDetailsProps {
  experiment: {
    id: string;
    experimentName: string;
    images: string[];
    duration: number;
    interval: number;
    baselineMeasurement: boolean;
    isRecorded: boolean;
    isDownloaded: boolean
  };
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isPreviewing: boolean;
  handleRecordData: () => void;
  closePreview: () => void;
  saveAndDownloadRecordedData: () => Promise<void>
}

const ExperimentDetails: React.FC<ExperimentDetailsProps> = ({
  experiment,
  onBack,
  onDelete,
  onEdit,
  isPreviewing,
  handleRecordData,
  closePreview,
  saveAndDownloadRecordedData
}) => {
  return (
    <>
    <div className="text-white rounded-lg shadow-lg space-y-10 font-mono">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="text-md text-gray-300 hover:underline"
        >
          ← Back
        </button>
      </div>
      <div className="border-1 p-8 space-y-7 text-md w-full max-w-2xl md:max-w-3xl relative">
        <div className="space-y-6">
          <div className="flex justify-between">
            <span>Name of experiment</span>
            <span>{experiment.experimentName}</span>
          </div>

          <div className="flex justify-between">
            <span>Images ({experiment.images.length})</span>
            <div className="flex space-x-2">
              {experiment.images.map((url, index) =>
                url ? (
                  <img
                    key={index}
                    src={url}
                    alt={`img-${index}`}
                    className="w-8 h-8 rounded"
                  />
                ) : (
                  <div key={index} className="w-8 h-8 rounded bg-gray-800" />
                )
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <span>Duration of each image</span>
            <span>{experiment.duration}s</span>
          </div>

          <div className="flex justify-between">
            <span>Interval between images</span>
            <span>{experiment.interval}s</span>
          </div>

          <div className="flex justify-between">
            <span>Baseline measurement</span>
            <span>{experiment.baselineMeasurement ? "Yes" : "No"}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-around space-y-4 items-start sm:items-center py-2">
          <button
            className="bg-buttonBlue text-white py-2 rounded px-12"
            onClick={!experiment.isDownloaded ? handleRecordData: saveAndDownloadRecordedData}
          >
            {!experiment.isDownloaded ? 'RECORD DATA' : 'ANALYZE RECORD'}
          </button>
          <button
            className="bg-transparent text-white py-2 rounded px-12 border-1"
            onClick={onEdit}
          >
            EDIT
          </button>
          <button
            className="bg-transparent text-red-500 py-2 rounded px-12 border-1"
            onClick={onDelete}
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
    {isPreviewing && experiment.images.length && (
        <ImagePreviewOverlay
          experimentId={experiment.id}
          images={experiment.images}
          baseline={experiment.baselineMeasurement}
          duration={experiment.duration}
          interval={experiment.interval}
          onClose={closePreview}
        />
      )}
    </>

  );
};

export default ExperimentDetails;
