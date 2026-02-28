"use client";

import React, { useState, useEffect } from 'react';
import { reservationApi, Reservation } from '@/lib/api';

export default function AdminHistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await reservationApi.findAll();
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading reservations...</div>;
  }

  return (
    <div className="bg-white p-0 rounded-sm">
      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 p-4 font-bold text-gray-900 w-1/4">Date time</th>
            <th className="border border-gray-300 p-4 font-bold text-gray-900 w-1/4">Username</th>
            <th className="border border-gray-300 p-4 font-bold text-gray-900 w-1/4">Concert name</th>
            <th className="border border-gray-300 p-4 font-bold text-gray-900 w-1/4">Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr>
              <td colSpan={4} className="border border-gray-300 p-4 text-center text-gray-500">
                No reservations found
              </td>
            </tr>
          ) : (
            reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-gray-50 transition">
                <td className="border border-gray-300 p-4 text-gray-800 text-sm">
                  {formatDateTime(reservation.createdAt)}
                </td>
                <td className="border border-gray-300 p-4 text-gray-800 text-sm">
                  {reservation.user?.name || `User ${reservation.userId}`}
                </td>
                <td className="border border-gray-300 p-4 text-gray-800 text-sm">
                  {reservation.concert?.name || `Concert ${reservation.concertId}`}
                </td>
                <td className="border border-gray-300 p-4 text-gray-800 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reservation.status === 'reserved'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}