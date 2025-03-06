import React from 'react';
import Button from './Button';
import { Edit, Trash } from 'lucide-react';
import { Experiment } from '@/hooks/experiment.context';

interface Props {
  experiment: Experiment;
  onClick: () => void;
  handleRecordData: () => void
  saveAndDownloadRecordedData: () => Promise<void>
}

const ExperimentItem: React.FC<Props> = ({ experiment, onClick , handleRecordData, saveAndDownloadRecordedData}) => {
  const handleDelete = () => console.log(`Deleting ${experiment.experimentName}`);

  return (
    <div className="flex justify-between items-center border-b border-gray-700 py-4 cursor-pointer"
      onClick={onClick}
    >
      <span className="text-lg text-white">{experiment.experimentName}</span>
      <div className="flex space-x-4">
        {!experiment.isDownloaded ? (
          <Button onClick={handleRecordData}>Record Data</Button>
        ) : (
          <Button onClick={saveAndDownloadRecordedData}>Analyze Data</Button>
        )}
        <Edit className="h-5 w-5 text-gray-300 cursor-pointer" onClick={() => console.log("Edit")} />
        <Trash className="h-5 w-5 text-red-500 cursor-pointer" onClick={handleDelete} />
      </div>
    </div>
  );
};

export default ExperimentItem;
