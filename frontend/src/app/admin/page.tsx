"use client";

import React, { useState, useEffect } from 'react';
import { User, Award, XCircle } from 'lucide-react';
import OverviewTab from '@/app/components/OverviewTab';
import CreateTab from '@/app/components/CreateTab';
import { concertApi, reservationApi, dashboardApi } from '@/lib/api';

export default function AdminDashboard() {
  // State to control which tab is currently active
  const [activeTab, setActiveTab] = useState<'overview' | 'create'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    totalSeats: 0,
    totalReservations: 0,
    totalCancellations: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const [stats] = await Promise.all([
        dashboardApi.getStats(),
      ]);

      // Calculate total seats from all concerts
      const totalSeats = stats.totalSeats;

      // Calculate total reservations and cancellations
      const totalReservations = stats.totalReserve;
      const totalCancellations = stats.totalCancel;

      setStats({
        totalSeats,
        totalReservations,
        totalCancellations,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('overview');
  };

  return (
    <div>
      {/* Stat Cards (displayed regardless of which tab is active) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0077b6] text-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center h-40">
          <User className="mb-2" size={28} />
          <p className="text-sm opacity-90 font-medium">Total of seats</p>
          <h2 className="text-5xl font-bold mt-2">
            {loadingStats ? '...' : stats.totalSeats}
          </h2>
        </div>
        <div className="bg-[#00a896] text-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center h-40">
          <Award className="mb-2" size={28} />
          <p className="text-sm opacity-90 font-medium">Reserve</p>
          <h2 className="text-5xl font-bold mt-2">
            {loadingStats ? '...' : stats.totalReservations}
          </h2>
        </div>
        <div className="bg-[#ef4444] text-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center h-40">
          <XCircle className="mb-2" size={28} />
          <p className="text-sm opacity-90 font-medium">Cancel</p>
          <h2 className="text-5xl font-bold mt-2">
            {loadingStats ? '...' : stats.totalCancellations}
          </h2>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6 flex gap-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2 font-medium px-2 transition ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`pb-2 font-medium px-2 transition ${
            activeTab === 'create'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
          }`}
        >
          Create
        </button>
      </div>

      {/* Render Component based on selected Tab */}
      {activeTab === 'overview' ? (
        <OverviewTab key={refreshKey} onStatsUpdate={loadStats} />
      ) : (
        <CreateTab onCreateSuccess={handleCreateSuccess} />
      )}

    </div>
  );
}