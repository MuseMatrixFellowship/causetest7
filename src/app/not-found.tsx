"use client"
import { useState, useEffect } from "react";
import Overlay from "@/components/Overlay";

const formatTime = (timeInSeconds: number) => {
  const days = Math.floor(timeInSeconds / 86400);
  const hours = Math.floor((timeInSeconds % 86400) / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  return days > 0
    ? `${days}d ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    : `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-mono text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Content is under development!</h1>
    </div>
  );
};

export default Home;
