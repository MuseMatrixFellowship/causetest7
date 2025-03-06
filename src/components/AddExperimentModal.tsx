import { useExperimentContext } from "@/hooks/experiment.context";
import { uploadToCloudinary } from "@/services/storage.service";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ExperimentModal({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  const { addExperiment, experiments } = useExperimentContext();
  const [experimentName, setExperimentName] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [duration, setDuration] = useState(10);
  const [interval, setInterval] = useState(5);
  const [baselineMeasurement, setBaselineMeasurement] = useState(true);
  const [loading, setLoading] = useState(false); // New loading state

  const uploadImage = async (file: File) => {
    const url = await uploadToCloudinary(file);
    return url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSaveExperiment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); // Set loading to true when the form is submitted

    try {
      const url = await Promise.all(images.map((file) => uploadImage(file)));
      const newExperiment = {
        id: uuidv4(),
        experimentName,
        images: url,
        duration,
        interval,
        baselineMeasurement,
        isRecorded: false,
        isDownloaded: false,
      };
      console.log(newExperiment);

      addExperiment(newExperiment);
      setExperimentName('');
      setImages([]);
      setDuration(10);
      setInterval(5);
      setBaselineMeasurement(true);
      toggleModal();
    } catch (error) {
      console.error("Error saving experiment:", error);
    } finally {
      setLoading(false); // Set loading to false when the operation is complete
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 font-mono">
        <form
          className="bg-black text-white w-full max-w-2xl md:max-w-3xl p-8 relative border-2 border-buttonBlue"
          onSubmit={handleSaveExperiment}
        >
          <div className="border-b-2 border-buttonBlue mb-6">
          {!loading && <button
              onClick={toggleModal}
              className="absolute top-8 right-8 text-white"
            >
              X
            </button>}
            <h2 className="text-xl mb-4 text-center font-semibold">
              Setup an experiment
            </h2>
          </div>

          {/* Name of experiment */}
          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">
              Name of experiment
            </label>
            <input
              type="text"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
              required
            />
          </div>

          {/* Choose images */}
          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">
              Choose images
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
            />
          </div>

          {/* Duration of each image */}
          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">
              Duration of each image
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
            >
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
            </select>
          </div>

          {/* Interval between each image */}
          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">
              Interval between each image
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
            >
              <option value={1}>1s</option>
              <option value={2}>2s</option>
              <option value={3}>3s</option>
              <option value={4}>4s</option>
              <option value={5}>5s</option>
            </select>
          </div>

          {/* Baseline measurement */}
          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">
              Baseline measurement (fixation cross)
            </label>
            <select
              value={baselineMeasurement ? "Yes" : "No"}
              onChange={(e) => setBaselineMeasurement(e.target.value === "Yes")}
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="text-center">
            <button
              className="bg-white text-buttonBlue py-2 rounded hover:bg-gray-200 px-12"
              type="submit"
              disabled={loading} // Disable button when loading
            >
              {loading ? "Saving..." : "Save"} {/* Show loader text */}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
