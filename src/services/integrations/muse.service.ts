// import "hazardous";
import { release } from "os";
import { MuseClient } from "@/lib/muse";
import { CardanoService } from "@/services/cardano.service";
import { useAppKit } from "@reown/appkit/react";
import dayjs from "dayjs";
// import { createHash } from "crypto";
import { getFileHash, signData } from "../signer.service";
import { DatasetExport, EventData, IExperiment } from "@/utils/constant";
import { getCSVFile } from "../storage.service";

export const MUSE_SAMPLING_RATE = 256;
export const MUSE_CHANNELS = ["TP9", "AF7", "AF8", "TP10"];
export const PLOTTING_INTERVAL = 250; // ms

const INTER_SAMPLE_INTERVAL = (1 / 256) * 1000;

export enum SIGNAL_QUALITY {
  BAD = "#ed5a5a",
  OK = "#FFCD39",
  GREAT = "#66B0A9",
  DISCONNECTED = "#BFBFBF",
}

export enum SIGNAL_QUALITY_THRESHOLDS {
  BAD = 15,
  OK = 10,
  GREAT = 1.5,
}

export interface Device {
  // Human readable
  name?: string;
  // Unique ID
  id: string;
}

export interface EEGData {
  data: Array<number>;
  timestamp: number;
  marker?: string | number;
}

export interface PipesEpoch {
  data: number[][];
  signalQuality: { [channelName: string]: number };
  info: {
    samplingRate: number;
    startTime: number;
    channelNames?: string[];
  };
}

if (process.platform === "win32" && parseInt(release().split(".")[0], 10) < 10) {
  console.error("Muse EEG not available in Windows 7");
}

interface MuseEEGReadings {
  index: number;
  electrode: number;
  samples: number[];
  timestamp: number;
}

export interface CausalityNetworkParsedEEG {
  index: number;
  unixTimestamp: number;
  [channelName: string]: number;
}

export class MuseEEGService {
  museClient: MuseClient;
  dataStorageMode: "local" | "remote" = "local";
  recordingStatus: "not-started" | "started" | "stopped" = "not-started";
  recordingStartTimestamp = 0;
  cardanoService: CardanoService | null = null;
  transactionHash: string | null = null;

  ppgSeries: any = [];
  accelerometerSeries: any = [];
  rawBrainwaveSeries: any = {};
  rawBrainwavesParsed: CausalityNetworkParsedEEG[] = [];

  eventSeries: EventData[] = [];

  channelNames: string[] = ["TP9", "AF7", "AF8", "TP10"];

  private subscribers: Array<(data: any) => void> = [];

  constructor(museClient: MuseClient) {
    this.museClient = museClient;
    const appKit = useAppKit();
    this.cardanoService = new CardanoService(appKit);

    this.museClient.eegReadings.subscribe((eegReadings: MuseEEGReadings) => {
      if (!this.rawBrainwaveSeries[eegReadings.timestamp]) {
        this.rawBrainwaveSeries[eegReadings.timestamp] = {
          0: [],
          1: [],
          2: [],
          3: [],
        };
      }

      // Update the samples for the specific electrode at this timestamp
      this.rawBrainwaveSeries[eegReadings.timestamp][eegReadings.electrode] = eegReadings.samples;

      // first check that all the data for timestamp exists..
      if (
        this.rawBrainwaveSeries[eegReadings.timestamp][0].length == eegReadings.samples.length &&
        this.rawBrainwaveSeries[eegReadings.timestamp][1].length == eegReadings.samples.length &&
        this.rawBrainwaveSeries[eegReadings.timestamp][2].length == eegReadings.samples.length &&
        this.rawBrainwaveSeries[eegReadings.timestamp][3].length == eegReadings.samples.length
      ) {
        // Iterate over each electrode key in the timestamp
        let sampleIndex = 0;
        for (sampleIndex; sampleIndex < this.rawBrainwaveSeries[eegReadings.timestamp][0].length; sampleIndex++) {
          const brainwaveEntry: any = {};
          brainwaveEntry["index"] = sampleIndex;
          brainwaveEntry["unixTimestamp"] = eegReadings.timestamp + sampleIndex * INTER_SAMPLE_INTERVAL;
          if(this.eventSeries[0]?.data.experimentName){
            brainwaveEntry["experimentName"] = this.eventSeries[0]?.data?.experimentName ?? "Unknown";
            brainwaveEntry["experimentImage"] = this.eventSeries[0]?.data?.experimentImage ?? "No Image";
          }

          let chIndex = 0;
          for (chIndex; chIndex < this.channelNames.length; chIndex++) {
            brainwaveEntry[this.channelNames[chIndex]] =
              this.rawBrainwaveSeries[eegReadings.timestamp][chIndex][sampleIndex];
          }
          this.rawBrainwavesParsed.push(brainwaveEntry);
        }
        // drop the entry from the rawBrainwaveSeries
        delete this.rawBrainwaveSeries[eegReadings.timestamp];
        this.notifySubscribers(this.rawBrainwavesParsed);
      }
    });
  }

  // Notify all subscribers with the new data
  private notifySubscribers(data: any): void {
    this.subscribers.forEach((callback) => callback(data));
  }

  // Method for components to call to subscribe to new data updates
  public onUpdate(callback: (data: any) => void): () => void {
    this.subscribers.push(callback);

    // Return an unsubscribe function that removes the callback from the subscribers list
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  async startRecording(experiment: IExperiment) {
    // @ts-ignore
    this.recordingStartTimestamp = dayjs().unix();
    this.recordingStatus = "started";

    /**
     * Add experiment data to the store
     */
    const eventEntry: EventData = {
      startTimestamp: this.recordingStartTimestamp,
      duration: experiment.duration ?? 0,
      data: JSON.stringify(experiment),
    };
    this.eventSeries.push(eventEntry);

    this.museClient.start();
  }

  async stopRecording() {
    this.museClient.pause();
    // prepare files for download
    const datasetExport: DatasetExport = {
      fileNames: [`rawBrainwaves_${this.recordingStartTimestamp}.csv`, `events_${this.recordingStartTimestamp}.csv`],
      dataSets: [this.rawBrainwavesParsed, this.eventSeries],
    };

    return datasetExport;
  }

  async dowloadOrSaveRecordedData(withDownload = false, signDataset = false){
    const datasetExport: DatasetExport = {
      fileNames: [`rawBrainwaves_${this.recordingStartTimestamp}.csv`, `events_${this.recordingStartTimestamp}.csv`],
      dataSets: [this.rawBrainwavesParsed, this.eventSeries],
    };

    try {
      // Store data hash on Cardano blockchain before saving locally
      if (this.cardanoService) {
        this.transactionHash = await this.cardanoService.storeDataHash({
          rawBrainwaves: this.rawBrainwavesParsed,
          events: this.eventSeries,
          timestamp: this.recordingStartTimestamp
        });
        console.log("Data hash stored on Cardano blockchain, transaction:", this.transactionHash);
      }

      if (signDataset) {
        const brainwavesCSV = await getCSVFile(
          `rawBrainwaves_${this.recordingStartTimestamp}.csv`,
          this.rawBrainwavesParsed
        );
        const contentHash = await getFileHash(brainwavesCSV);

        try {
          const signature = await signData(
            `rawBrainwaves_${this.recordingStartTimestamp}.csv`,
            this.recordingStartTimestamp,
            dayjs().valueOf(),
            contentHash,
            {
              deviceId: this.museClient.deviceName!,
            }
          );
          console.log("attestation, saving dataset", signature);
          if(signature){
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(brainwavesCSV);
            downloadLink.download = `rawBrainwaves_${this.recordingStartTimestamp}.csv`;
            downloadLink.click();
          }
        } catch (e) {
          console.log("error signing data", e);
        } finally {
          this.ppgSeries = [];
          this.rawBrainwaveSeries = {};
          this.rawBrainwavesParsed = [];
          this.eventSeries = [];
          this.accelerometerSeries = [];
          this.recordingStartTimestamp = 0;
          this.recordingStatus = "stopped";
        }
      }

      if (withDownload) {
        const brainwavesCSV = await getCSVFile(
          `rawBrainwaves_${this.recordingStartTimestamp}.csv`,
          this.rawBrainwavesParsed
        );
        const eventsCSV = await getCSVFile(
          `events_${this.recordingStartTimestamp}.csv`,
          this.eventSeries
        );

        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(brainwavesCSV);
        downloadLink.download = `rawBrainwaves_${this.recordingStartTimestamp}.csv`;
        downloadLink.click();

        const downloadLink2 = document.createElement("a");
        downloadLink2.href = URL.createObjectURL(eventsCSV);
        downloadLink2.download = `events_${this.recordingStartTimestamp}.csv`;
        downloadLink2.click();
      }

      return datasetExport;
    } catch (error) {
      console.error("Error saving data:", error);
      throw error;
    }
  }

  async verifyDataIntegrity(): Promise<boolean> {
    if (!this.cardanoService || !this.transactionHash) {
      return false;
    }

    return await this.cardanoService.verifyDataHash({
      rawBrainwaves: this.rawBrainwavesParsed,
      events: this.eventSeries,
      timestamp: this.recordingStartTimestamp
    }, this.transactionHash);
  }
}
