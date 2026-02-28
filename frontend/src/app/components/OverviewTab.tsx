"use client";

import React, { useState, useEffect } from 'react';
import { User, Trash2, AlertCircle, Edit3, Save, X, CheckCircle } from 'lucide-react';
import { concertApi, Concert } from '@/lib/api';

interface OverviewTabProps {
  onStatsUpdate?: () => void;
}

export default function OverviewTab({ onStatsUpdate }: OverviewTabProps) {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // State สำหรับ Modal ต่างๆ
  const [concertToDelete, setConcertToDelete] = useState<Concert | null>(null);
  const [concertToEdit, setConcertToEdit] = useState<Concert | null>(null);
  
  // State สำหรับ Form แก้ไข
  const [editForm, setEditForm] = useState({
    name: '',
    seat: 500,
    description: '',
  });

  useEffect(() => {
    loadConcerts();
  }, []);

  const loadConcerts = async () => {
    try {
      setLoading(true);
      const response = await concertApi.findAll();
      const concertsData = response.data || [];
      setConcerts(concertsData);
    } catch (error) {
      console.error('Failed to load concerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // เปิด Modal แก้ไข และ Set ค่าเริ่มต้นใน Form
  const handleEditClick = (concert: Concert) => {
    setConcertToEdit(concert);
    setEditForm({
      name: concert.name,
      seat: concert.seat,
      description: concert.description || '',
    });
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleUpdateConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concertToEdit) return;

    setActionLoading(true);
    try {
      await concertApi.update(concertToEdit.id, {
        name: editForm.name,
        seat: editForm.seat,
        description: editForm.description,
      });
      
      await loadConcerts(); // โหลดข้อมูลใหม่
      setConcertToEdit(null); // ปิด Modal
      
      if (onStatsUpdate) {
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Failed to update concert:', error);
      alert('Failed to update concert. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!concertToDelete) return;

    setActionLoading(true);
    try {
      await concertApi.delete(concertToDelete.id);
      await loadConcerts();
      setConcertToDelete(null);
      
      if (onStatsUpdate) {
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 animate-pulse text-lg font-medium">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6 relative z-0">
      {concerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-lg">ไม่พบข้อมูลคอนเสิร์ต</p>
          <p className="text-sm mt-2">สร้างคอนเสิร์ตใหม่เพื่อเริ่มต้นใช้งาน</p>
        </div>
      ) : (
        concerts.map((concert) => (
          <div key={concert.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-bold text-blue-500 mb-4">{concert.name}</h3>
            <hr className="mb-4 border-gray-100" />
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {concert.description || 'ไม่มีคำอธิบาย'}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={18} />
                <span className="font-semibold">{concert.seat}</span>
              </div>
              
              <div className="flex gap-3">
                {/* ปุ่ม Edit */}
                <button
                  onClick={() => handleEditClick(concert)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition shadow-sm font-medium"
                >
                  <Edit3 size={18} /> Edit
                </button>
                
                {/* ปุ่ม Delete */}
                <button
                  onClick={() => setConcertToDelete(concert)}
                  className="bg-[#ef4444] hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition shadow-sm font-medium"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* --- Backdrop (Overlay) --- */}
      {(concertToDelete || concertToEdit) && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => {
            if (!actionLoading) {
              setConcertToDelete(null);
              setConcertToEdit(null);
            }
          }}
        ></div>
      )}

      {/* --- EDIT MODAL (สไตล์ล้อตามหน้า Create) --- */}
      {concertToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden pointer-events-auto transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="p-8 pb-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-blue-500">Edit Concert</h2>
                <button 
                  onClick={() => setConcertToEdit(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={28} />
                </button>
              </div>
              <hr className="border-gray-200" />
            </div>

            <form onSubmit={handleUpdateConfirm} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-gray-900 font-medium mb-2 text-lg">Concert Name</label>
                  <input
                    type="text"
                    placeholder="Please input concert name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2 text-lg">Total of seat</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={editForm.seat}
                      onChange={(e) => setEditForm({ ...editForm, seat: parseInt(e.target.value) || 0 })}
                      required
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                      <User size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-900 font-medium mb-2 text-lg">Description</label>
                <div className="border-2 border-blue-400 p-[2px] rounded-sm">
                  <textarea
                    placeholder="Please input description"
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full border-2 border-dashed border-blue-400 p-3 focus:outline-none resize-none text-gray-700 placeholder-gray-300"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setConcertToEdit(null)}
                  className="px-8 py-3 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-medium text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#4a89ea] hover:bg-blue-600 text-white px-8 py-3 rounded-md flex items-center gap-2 transition shadow-sm font-medium text-lg disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : (
                    <>
                      <Save size={20} /> Update Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {concertToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md text-center transform transition-all animate-in zoom-in duration-150 pointer-events-auto">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg leading-6 font-bold text-gray-900">
              Confirm Delete ?
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                  You are about to delete <span className="font-bold text-gray-800">"{concertToDelete.name}"</span>. This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:w-auto sm:text-sm transition"
                onClick={() => setConcertToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:w-auto sm:text-sm flex items-center gap-2 transition disabled:opacity-50"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={18} /> {actionLoading ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}