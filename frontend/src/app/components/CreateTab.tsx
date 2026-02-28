"use client";

import React, { useState } from 'react';
import { User, Save, CheckCircle } from 'lucide-react';
import { concertApi, Concert } from '@/lib/api';

export default function CreateTab({ onCreateSuccess }: { onCreateSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    seat: 500,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await concertApi.create({
        name: formData.name,
        seat: formData.seat,
        description: formData.description,
      });
      setSuccess(true);
      setFormData({ name: '', seat: 500, description: '' });

      setTimeout(() => {
        setSuccess(false);
        if (onCreateSuccess) onCreateSuccess();
      }, 2000);
    } catch (error) {
      console.error('Failed to create concert:', error);
      alert('Failed to create concert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-3xl font-bold text-blue-500 mb-4">Create</h2>
      <hr className="mb-8 border-gray-200" />

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
          <CheckCircle size={20} />
          <span>Concert created successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-gray-900 font-medium mb-2 text-lg">Concert Name</label>
            <input
              type="text"
              placeholder="Please input concert name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                value={formData.seat}
                onChange={(e) => setFormData({ ...formData, seat: parseInt(e.target.value) || 0 })}
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border-2 border-dashed border-blue-400 p-3 focus:outline-none resize-none text-gray-700 placeholder-gray-300"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#4a89ea] hover:bg-blue-600 text-white px-8 py-3 rounded-md flex items-center gap-2 transition shadow-sm font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save size={20} /> Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}