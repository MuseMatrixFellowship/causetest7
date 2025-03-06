import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { signData } from '../services/signer.service';
import { ethers } from 'ethers';
import ProtectedRoutes from '@/hooks/ProtectedRoutes';

interface AcademiaModalProps {
  onClose: () => void;
}

const AcademiaModal: React.FC<AcademiaModalProps> = ({ onClose }) => {
  const { address, isConnected } = useAccount();
  const [form, setForm] = useState({
    contentHash: '',
    name: '',
    startTimestamp: '',
    endTimestamp: '',
    additionalMeta: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      console.error('Wallet is not connected');
      return;
    }

    try {
      setIsSubmitting(true);
      const { contentHash, name, startTimestamp, endTimestamp, additionalMeta } = form;

      // Add '0x' prefix if it's missing from the contentHash
      const formattedContentHash = contentHash.startsWith('0x') ? contentHash : `0x${contentHash}`;

      if (!/^0x([A-Fa-f0-9]{64})$/.test(formattedContentHash)) {
        throw new Error('Invalid content hash. Please provide a valid bytes32 value.');
      }

      const startTs = parseInt(startTimestamp, 10);
      const endTs = parseInt(endTimestamp, 10);

      if (isNaN(startTs) || isNaN(endTs)) {
        throw new Error('Invalid start or end timestamp. Please provide valid numbers.');
      }

      const additionalMetaObj = additionalMeta ? JSON.parse(additionalMeta) : {};

      if (typeof (window as any).ethereum !== 'undefined') {
        const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x2105') {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x2105',
                rpcUrls: ['https://mainnet.base.org'],
                chainName: 'Base Mainnet',
                nativeCurrency: {
                  name: 'Base',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://basescan.org/'],
              },
            ],
          });
        }
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      if (!signer) {
        throw new Error('No signer found');
      }

      const attestationUID = await signData(name, startTs, endTs, formattedContentHash, additionalMetaObj);
      console.log('Attestation successful. UID:', attestationUID);
      onClose();
    } catch (err) {
      console.error('Error creating attestation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 font-mono">
        <form className="bg-black text-white w-full max-w-2xl md:max-w-3xl p-8 relative border-2 border-buttonBlue">
          <div className="border-b-2 border-buttonBlue mb-6">
            {!isSubmitting && (
              <button onClick={onClose} className="absolute top-8 right-8 text-white">
                X
              </button>
            )}
            <h2 className="text-xl mb-4 text-center font-semibold">
              Academia Attestation Form
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">Content Hash</label>
            <input
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
              name="contentHash"
              value={form.contentHash}
              onChange={handleChange}
              placeholder="Content Hash (bytes32)"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">Name</label>
            <input
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">Start Timestamp</label>
            <input
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
              name="startTimestamp"
              value={form.startTimestamp}
              onChange={handleChange}
              placeholder="Start Timestamp"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">End Timestamp</label>
            <input
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
              name="endTimestamp"
              value={form.endTimestamp}
              onChange={handleChange}
              placeholder="End Timestamp"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center mb-4">
            <label className="block text-sm w-full md:w-1/2 mb-2 md:mb-0">Additional Meta</label>
            <input
              className="w-full md:w-1/2 p-2 bg-gray-800 text-white border border-gray-600 rounded"
              name="additionalMeta"
              value={form.additionalMeta}
              onChange={handleChange}
              placeholder="Additional Meta (JSON format)"
            />
          </div>

          <div className="text-center">
            <button
              className="bg-white text-buttonBlue py-2 rounded hover:bg-gray-200 px-12"
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Attesting..." : "Attest"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProtectedRoutes(AcademiaModal);
