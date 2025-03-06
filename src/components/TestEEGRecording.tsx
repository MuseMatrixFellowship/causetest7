import React, { useContext, useState } from 'react';
import { MuseContext } from '@/hooks/muse.context';
import { useAppKit } from '@reown/appkit/react';

const TestEEGRecording: React.FC = () => {
  const museContext = useContext(MuseContext);
  const [isRecording, setIsRecording] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const appKit = useAppKit();

  const handleStartRecording = async () => {
    if (!museContext?.museService) {
      console.error('MUSE service not initialized');
      return;
    }

    try {
      await museContext.museService.startRecording({
        id: "test-1",
        name: "Test Recording",
        description: "Testing EEG recording with Cardano integration"
      });
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopAndSave = async () => {
    if (!museContext?.museService) return;

    try {
      await museContext.museService.stopRecording();
      const result = await museContext.museService.dowloadOrSaveRecordedData(true, false);
      setTransactionHash(museContext.museService.transactionHash);
      setIsRecording(false);
      console.log('Recording saved, transaction hash:', museContext.museService.transactionHash);
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  };

  const handleVerifyData = async () => {
    if (!museContext?.museService) return;

    try {
      const isValid = await museContext.museService.verifyDataIntegrity();
      setVerificationResult(isValid);
      console.log('Data verification result:', isValid);
    } catch (error) {
      console.error('Failed to verify data:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await appKit.wallet?.connect();
      console.log('Wallet connected:', appKit.wallet?.isConnected);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Test EEG Recording with Cardano</h2>
      
      {/* Wallet Connection */}
      <div className="mb-4">
        <button
          onClick={handleConnectWallet}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
        <p className="mt-2">
          Wallet Status: {appKit.wallet?.isConnected ? 'Connected' : 'Not Connected'}
        </p>
      </div>

      {/* MUSE Connection Status */}
      <div className="mb-4">
        <p>MUSE Status: {museContext?.museClient ? 'Connected' : 'Not Connected'}</p>
      </div>

      {/* Recording Controls */}
      <div className="space-x-4">
        <button
          onClick={handleStartRecording}
          disabled={isRecording || !museContext?.museService || !appKit.wallet?.isConnected}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Start Recording
        </button>
        <button
          onClick={handleStopAndSave}
          disabled={!isRecording}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Stop & Save
        </button>
      </div>

      {/* Transaction Hash Display */}
      {transactionHash && (
        <div className="mt-4">
          <p>Transaction Hash: {transactionHash}</p>
          <button
            onClick={handleVerifyData}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Verify Data
          </button>
        </div>
      )}

      {/* Verification Result */}
      {verificationResult !== null && (
        <div className="mt-4">
          <p>
            Verification Result:{' '}
            <span className={verificationResult ? 'text-green-500' : 'text-red-500'}>
              {verificationResult ? 'Valid' : 'Invalid'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TestEEGRecording;
