"use client";

import React, { useState, useEffect } from 'react';
import { User, Trash2, AlertCircle } from 'lucide-react';
import { concertApi, Concert } from '@/lib/api';

interface OverviewTabProps {
  onStatsUpdate?: () => void;
}

export default function OverviewTab({ onStatsUpdate }: OverviewTabProps) {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [concertToDelete, setConcertToDelete] = useState<Concert | null>(null);

  useEffect(() => {
    loadConcerts();
  }, []);

  const loadConcerts = async () => {
    try {
      const data = await concertApi.findAll();
      setConcerts(data);
    } catch (error) {
      console.error('Failed to load concerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!concertToDelete) return;

    try {
      await concertApi.delete(concertToDelete.id);
      await loadConcerts();
      setConcertToDelete(null);
      // Trigger stats update
      if (onStatsUpdate) {
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Failed to delete concert:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading concerts...</div>;
  }

  return (
    <div className="space-y-6 relative z-0">
      {concerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No concerts found</p>
          <p className="text-sm mt-2">Create a new concert to get started</p>
        </div>
      ) : (
        concerts.map((concert) => (
          <div key={concert.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-bold text-blue-500 mb-4">{concert.name}</h3>
            <hr className="mb-4 border-gray-100" />
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {concert.description || 'No description provided'}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={18} />
                <span className="font-semibold">{concert.seat}</span>
              </div>
              <button
                onClick={() => setConcertToDelete(concert)}
                className="bg-[#ef4444] hover:bg-red-600 text-white px-4 py-2 rounded-xs flex items-center gap-2 transition shadow-sm font-medium"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* --- Modal --- */}
      {concertToDelete && (
        <div className="fixed inset-0 bg-black opacity-50 z-40 transition-opacity m-0"></div>
      )}

      {concertToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md text-center transform transition-all scale-100">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
              Are you sure to delete?
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                You are about to delete <span className="font-bold text-gray-800">"{concertToDelete.name}"</span>. This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                onClick={() => setConcertToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm flex items-center gap-2"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={18} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}