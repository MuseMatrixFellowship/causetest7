import { useAppKit } from "@reown/appkit/react";
import { sha256 } from "fast-sha256";
import { Buffer } from "buffer";

export class CardanoService {
  private appKit: ReturnType<typeof useAppKit>;

  constructor(appKit: ReturnType<typeof useAppKit>) {
    this.appKit = appKit;
  }

  async storeDataHash(data: any): Promise<string> {
    try {
      // Convert data to buffer and hash it
      const dataString = JSON.stringify(data);
      const dataBuffer = Buffer.from(dataString);
      const hashBuffer = sha256(dataBuffer);
      const hashHex = Buffer.from(hashBuffer).toString('hex');

      // Create metadata for the transaction
      const metadata = {
        1: {
          eegDataHash: hashHex,
          timestamp: Date.now(),
          dataType: "EEG_RECORDING"
        }
      };

      // Create and submit transaction
      const tx = await this.appKit.wallet?.tx({
        metadata,
        outputs: [] // Zero-value transaction, only storing metadata
      });

      const txHash = await tx?.submit();
      
      if (!txHash) {
        throw new Error("Failed to submit transaction");
      }

      return txHash;
    } catch (error) {
      console.error("Error storing data hash on Cardano:", error);
      throw error;
    }
  }

  async verifyDataHash(data: any, txHash: string): Promise<boolean> {
    try {
      // Get transaction metadata
      const tx = await this.appKit.chain?.transaction({ hash: txHash });
      if (!tx?.metadata?.[1]?.eegDataHash) {
        return false;
      }

      // Calculate hash of current data
      const dataString = JSON.stringify(data);
      const dataBuffer = Buffer.from(dataString);
      const hashBuffer = sha256(dataBuffer);
      const currentHashHex = Buffer.from(hashBuffer).toString('hex');

      // Compare hashes
      return currentHashHex === tx.metadata[1].eegDataHash;
    } catch (error) {
      console.error("Error verifying data hash:", error);
      return false;
    }
  }
}
