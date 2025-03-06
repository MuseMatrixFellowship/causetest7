// import axios from "axios";
import dayjs from "dayjs";
import JSZip from "jszip";
import { DatasetExport } from "@/utils/constant";
import { IDBPDatabase, openDB } from "idb";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";

export function convertToCSV(arr: any[]) {
  const array = [Object.keys(arr[0] ?? {})].concat(arr);

  return array
    .map((it) => {
      return Object.values(it)
        .map((value) => {
          if (typeof value === "string" && value.includes(",")) {
            // Escape commas and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",");
    })
    .join("\n");
}

export async function writeDataToStore(dataName: string, data: any, fileTimestamp: string, storeType = "download") {
  console.log("fileTimestamp: ", fileTimestamp);

  if (storeType === "download") {
    const fileName = `${dataName}_${fileTimestamp}.csv`;
    const content = convertToCSV(data); // convert to csv format

    const hiddenElement = document.createElement("a");
    hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
    hiddenElement.target = "_blank";
    hiddenElement.download = fileName;
    hiddenElement.click();
  } else if (storeType === "remoteStorage") {
    // call the upload api
  }
}

export async function downloadDataAsZip(datasetExport: DatasetExport, zipFileName: string, unixTimestamp: dayjs.Dayjs) {
  const filePath = `${zipFileName}_${unixTimestamp.unix()}.zip`;

  const zip = new JSZip();
  for (let i = 0; i < datasetExport.dataSets.length; i++) {
    const dataSet = datasetExport.dataSets[i];
    const content = convertToCSV(dataSet); // convert to csv format
    zip.file(datasetExport.fileNames[i], content);
  }

  // download the zip file
  const downloadLink = document.createElement("a");
  const blob = await zip.generateAsync({ type: "blob" });
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${filePath}`;
  downloadLink.click();
}

export async function getCSVFile(fileName: string, dataSet: any[]): Promise<File> {
  const content = convertToCSV(dataSet); // convert to csv format
  const blob = new Blob([content], { type: "text/csv" });
  const file = new File([blob], fileName, { type: "text/csv" });
  return file;
}

/**
 * Methods for storing locally on IndexDB
 */
let dbPromise: Promise<IDBPDatabase<unknown>>;
if (typeof window !== "undefined") {
  dbPromise = openDB("casuality-network-db", 1, {
    upgrade(db) {
      db.createObjectStore("files", { keyPath: "name" });
    },
  });
}

export async function getFiles() {
  const db = await dbPromise;
  return await db.getAll("files");
}

export async function saveFile(name: string, file: File) {
  const db = await dbPromise;
  await db.put("files", { name, file });
}

export async function getFile(name: IDBValidKey | IDBKeyRange) {
  const db = await dbPromise;
  return await db.get("files", name);
}

export async function deleteFile(name: IDBValidKey | IDBKeyRange) {
  const db = await dbPromise;
  await db.delete("files", name);
}

export async function writeToLocalStorage(datasetExport: DatasetExport, unixTimestamp: dayjs.Dayjs) {
  console.log("writeToLocalStorage", datasetExport);
  const db = await dbPromise;
  const tx = db.transaction("files", "readwrite");
  const store = tx.objectStore("files");

  for (let i = 0; i < datasetExport.dataSets.length; i++) {
    const fileName = datasetExport.fileNames[i];
    const dataSet = datasetExport.dataSets[i];

    // Create a Blob from the CSV content
    const file = await getCSVFile(fileName, dataSet);

    await store.put({ name: fileName, file });
  }
  await tx.done;

  return true;
}

export async function uploadToIpfs(file: File) {
  try {
    const helia = await createHelia();
    const fs = unixfs(helia);
    const fileBuffer = await file.arrayBuffer();
    const cid = await fs.addFile({
      content: new Uint8Array(fileBuffer),
      path: `./${file.name}`,
    });
    await helia.stop();
    return cid;
  } catch (error) {
    console.error("Error uploading to IPFS", error);
  }
  
}

export async function downloadFromIpfs(cid: string) {
  try {
    if (!cid) {
      throw new Error("No CID provided");
    }
    
    const helia = await createHelia();
    const fs = unixfs(helia); 
    
    const file = await fs.cat(cid as any);
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of file) {
      chunks.push(chunk);
    }

    await helia.stop();

    const blob = new Blob(chunks, { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);

    return url;
  } catch (error) {
    console.error("Error downloading from IPFS", error);
    throw error; // Rethrow the error for further handling
  }
}

export async function uploadToCloudinary(file: File): Promise<string | null> {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "experiment_causality");
  data.append("cloud_name", "dqu56ahai"); 
  console.log("uploading file");
  
  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/dqu56ahai/image/upload", {
      method: "POST",
      body: data,
    });

    const result = await response.json();
    console.log(result);
    
    return result.secure_url;
  } catch (error) {
    console.error("Error during upload:", error);
    return null;
  }
}


export async function getFileFromCloudinary(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to retrieve file from Cloudinary");
    }

    // Get the file as a Blob
    const fileBlob = await response.blob();
    return fileBlob;
  } catch (error) {
    console.error("Error fetching file from Cloudinary:", error);
    return null;
  }
}

