"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ExperimentModal from "./AddExperimentModal";
import ProtectedRoutes from "@/hooks/ProtectedRoutes";

interface OpreationalButtonProps {
  selectedOperation: string;
  setSelectedOperation: (operation: string) => void;
}

const OpreationalButton: React.FC<OpreationalButtonProps> = ({
  selectedOperation,
  setSelectedOperation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const handleClick = (operation: string) => {
    setSelectedOperation(operation);
    if (operation === "Record") {
      router.push("/playground/record");
    } else if (operation === "Experiments") {
      router.push("/playground/experiments");
    }
  };

  return (
    <>
      {isOpen && <ExperimentModal toggleModal={toggleModal}/>}
      <div className="flex justify-between mt-6 mb-4">
        <div className="flex justify-left space-x-4 text-white lg:ml-12 ml-6">
          <button
            className={`${
              selectedOperation === "Record"
                ? "font-semibold bg-white/25 text-highLight"
                : "text-gray-300"
            } border border-transparent rounded-md hover:font-semibold hover:bg-white/25 transition duration-300 px-4`}
            onClick={() => handleClick("Record")}
          >
            Record
          </button>
          <div className="bg-white w-px self-center h-4"></div>
          <button
            className={`${
              selectedOperation === "Experiments"
                ? "font-semibold bg-white/25 text-highLight"
                : "text-gray-300"
            } border border-transparent rounded-md hover:font-semibold hover:bg-white/25 transition duration-300 px-4`}
            onClick={() => handleClick("Experiments")}
          >
            Experiments
          </button>
        </div>
        <div className="flex justify-right space-x-4 text-white lg:mr-12 mr-6">
          <button
            className="text-white border rounded-lg p-3"
            onClick={toggleModal}
          >
            Setup an experiment
          </button>
        </div>
      </div>
    </>
  );
};

export default ProtectedRoutes(OpreationalButton);
