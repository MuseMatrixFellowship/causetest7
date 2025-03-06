const MainSection: React.FC = () => {
    return (
      <div className="bg-darkBlue min-h-[80vh] flex flex-col items-center justify-center text-center text-white px-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <div className="text-primary font-bold text-lg">Record</div>
          <div className="text-white font-bold text-lg">Analyze</div>
        </div>
  
        {/* Main Message */}
        <p className="text-lg mb-10 text-offWhite">
          This is a playground for capturing EEG data with your Muse device.
        </p>
  
        {/* Connect Button */}
        <button className="bg-white text-lightBlue px-6 py-3 font-bold rounded-md hover:bg-opacity-90">
          CONNECT MUSE HEADSET
        </button>
      </div>
    );
  }
  
  export default MainSection;
  