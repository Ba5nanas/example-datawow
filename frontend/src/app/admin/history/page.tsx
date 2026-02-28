"use client";

import React, { useState, useEffect } from 'react';
import { reservationApi, Reservation } from '@/lib/api';
import { formatDateTime } from '@/lib/utils/time';

// กำหนด Interface ให้ตรงกับ Backend (ถ้าใน lib/api มีแล้ว สามารถลบออกและ import มาใช้ได้เลย)
interface PaginatedReservationResponse {
  data: Reservation[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export default function AdminHistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  useEffect(() => {
    loadReservations(page);
  }, [page]);

  const loadReservations = async (currentPage: number) => {
    setLoading(true);
    try {
      // เรียก API โดยส่ง page และ limit ไปด้วย
      const response = await reservationApi.findAll(currentPage, limit) as unknown as PaginatedReservationResponse;
      console.log(response)
      setReservations(response.data);
      setTotalPages(response.lastPage || 1);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-0 rounded-sm">
      <table className="w-full border-collapse border border-gray-300 text-left mb-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 p-4 font-bold text-gray-900 w-1/4">Date time</th>
            <th className="border border-gray-300 p-4 font-bold text-gray-900 w-1/4">Username</th>
            <th className="border border-gray-300 p-4 font-bold text-gray-900 w-1/4">Concert name</th>
            <th className="border border-gray-300 p-4 font-bold text-gray-900 w-1/4">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="border border-gray-300 p-8 text-center text-gray-500">
                Loading reservations...
              </td>
            </tr>
          ) : reservations.length === 0 ? (
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

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 bg-white border border-gray-300 rounded-b-sm">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1 text-sm rounded-md border ${
              page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-3 py-1 text-sm rounded-md border ${
              page === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}