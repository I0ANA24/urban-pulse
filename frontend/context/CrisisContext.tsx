"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useUser } from "./UserContext";
import { useSignalR } from "./SignalRContext";
import { Cluster } from "@/types/Cluster";
import { GlobalCrisis } from "@/types/GlobalCrisis";

const API = process.env.NEXT_PUBLIC_API_URL;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface CrisisContextType {
  localCrises: Cluster[];
  globalCrises: GlobalCrisis[];
  isInLocalCrisis: boolean;
  isInGlobalCrisis: boolean;
  crisisSubTypes: string[];
  viewRegularContent: boolean;
  toggleViewRegularContent: () => void;
}

const CrisisContext = createContext<CrisisContextType>({
  localCrises: [],
  globalCrises: [],
  isInLocalCrisis: false,
  isInGlobalCrisis: false,
  crisisSubTypes: [],
  viewRegularContent: false,
  toggleViewRegularContent: () => {},
});

export const CrisisProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const { connection } = useSignalR();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [globalCrises, setGlobalCrises] = useState<GlobalCrisis[]>([]);
  const [viewRegularContent, setViewRegularContent] = useState(false);
  const [wasInCrisis, setWasInCrisis] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Promise.all([
      fetch(`${API}/api/cluster`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/crisis`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([clustersData, crisesData]) => {
        setClusters(Array.isArray(clustersData) ? clustersData : []);
        setGlobalCrises(Array.isArray(crisesData) ? crisesData : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!connection) return;

    const onClusterCreated = (cluster: Cluster) => setClusters(prev => [cluster, ...prev]);
    const onClusterResolved = (clusterId: number) => setClusters(prev => prev.filter(c => c.id !== clusterId));
    const onClusterUpdated = (cluster: Cluster) => setClusters(prev => prev.map(c => c.id === cluster.id ? cluster : c));
    const onGlobalCrisisActivated = (crisis: GlobalCrisis) => setGlobalCrises(prev => [crisis, ...prev]);
    const onGlobalCrisisDeactivated = ({ id }: { id: number }) => setGlobalCrises(prev => prev.filter(g => g.id !== id));

    connection.on("ClusterCreated", onClusterCreated);
    connection.on("ClusterResolved", onClusterResolved);
    connection.on("ClusterUpdated", onClusterUpdated);
    connection.on("GlobalCrisisActivated", onGlobalCrisisActivated);
    connection.on("GlobalCrisisDeactivated", onGlobalCrisisDeactivated);

    return () => {
      connection.off("ClusterCreated", onClusterCreated);
      connection.off("ClusterResolved", onClusterResolved);
      connection.off("ClusterUpdated", onClusterUpdated);
      connection.off("GlobalCrisisActivated", onGlobalCrisisActivated);
      connection.off("GlobalCrisisDeactivated", onGlobalCrisisDeactivated);
    };
  }, [connection]);

  const localCrises = useMemo(() => {
    if (!user?.latitude || !user?.longitude) return clusters;
    return clusters.filter(c =>
      haversineKm(user.latitude!, user.longitude!, c.centerLatitude, c.centerLongitude) <= 2.0
    );
  }, [clusters, user?.latitude, user?.longitude]);

  const isInLocalCrisis = localCrises.length > 0;
  const isInGlobalCrisis = globalCrises.length > 0;
  const isInCrisis = isInLocalCrisis || isInGlobalCrisis;

  // Reset "view regular" when a new crisis starts
  useEffect(() => {
    if (isInCrisis && !wasInCrisis) {
      setViewRegularContent(false);
    }
    setWasInCrisis(isInCrisis);
  }, [isInCrisis, wasInCrisis]);

  const toggleViewRegularContent = () => setViewRegularContent(prev => !prev);

  const crisisSubTypes = useMemo(() => {
    const types = new Set<string>();
    localCrises.forEach(c => types.add(c.subType));
    globalCrises.forEach(g => types.add(g.subType));
    return Array.from(types);
  }, [localCrises, globalCrises]);

  return (
    <CrisisContext.Provider value={{ localCrises, globalCrises, isInLocalCrisis, isInGlobalCrisis, crisisSubTypes, viewRegularContent, toggleViewRegularContent }}>
      {children}
    </CrisisContext.Provider>
  );
};

export const useCrisis = () => useContext(CrisisContext);
