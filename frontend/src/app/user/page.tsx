"use client";

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { concertApi, Concert, reservationApi, Reservation } from '@/lib/api';

// SweetAlert2 is loaded via CDN
declare const Swal: any;

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserHomePage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success) {
        setCurrentUser(result.user);
      } else {
        // Not authenticated, redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
      window.location.href = '/login';
    }
  };

  const loadData = async () => {
    try {
      const [concertsData, reservationsData] = await Promise.all([
        concertApi.findAll(),
        reservationApi.findAll(),
      ]);
      setConcerts(concertsData);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (concertId: number) => {
    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please login first',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const seats = 1; // Default to 1 seat for now

    try {
      await reservationApi.create({
        concertId,
        seats,
      });
      await loadData();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Reservation successful!',
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      console.error('Failed to reserve:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reserve. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleCancel = async (reservationId: number) => {
    if (!currentUser) return;

    try {
      await reservationApi.cancel(reservationId);
      await loadData();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Reservation cancelled successfully!',
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      console.error('Failed to cancel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to cancel. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const getReservationForConcert = (concertId: number) => {
    return reservations.find((r) => r.concertId === concertId && r.status === 'reserved');
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading concerts...</div>;
  }

  return (
    <div className="space-y-6">
      {concerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No concerts available</p>
          <p className="text-sm mt-2">Please check back later</p>
        </div>
      ) : (
        concerts.map((concert) => {
          const reservation = getReservationForConcert(concert.id);
          const isReserved = !!reservation;

          return (
            <div key={concert.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <h3 className="text-2xl font-bold text-[#1ea1f2] mb-4">{concert.name}</h3>
              <hr className="mb-4 border-gray-100" />
              <p className="text-gray-800 text-sm leading-relaxed mb-6">
                {concert.description || 'No description provided'}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-700">
                  <User size={20} />
                  <span className="font-semibold text-lg">{concert.seat}</span>
                </div>
                {isReserved ? (
                  <button
                    onClick={() => handleCancel(reservation!.id)}
                    className="bg-[#f45c5c] hover:bg-red-600 text-white px-8 py-2.5 rounded-md transition shadow-sm font-medium text-lg"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => handleReserve(concert.id)}
                    className="bg-[#208deb] hover:bg-blue-600 text-white px-8 py-2.5 rounded-md transition shadow-sm font-medium text-lg"
                  >
                    Reserve
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}