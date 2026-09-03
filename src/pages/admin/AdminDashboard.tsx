import { useState } from "react";
import { fetchApi } from "../../lib/api";
import { useQuery } from '@tanstack/react-query';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => fetchApi<{ users: number, orders: number, revenue: number }>('/admin/stats'),
  });

  const [message, setMessage] = useState('');

  const triggerSync = async () => {
    try {
      await fetchApi('/admin/sync-catalog', { method: 'POST' });
      setMessage('Catalog sync triggered!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
  };

  const triggerPoll = async () => {
    try {
      await fetchApi('/admin/poll-orders', { method: 'POST' });
      setMessage('Order polling triggered!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold font-outfit text-gray-900 mb-8">Admin Dashboard</h1>
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? '...' : stats?.users}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? '...' : stats?.orders}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">${isLoading ? '...' : stats?.revenue?.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h2 className="text-xl font-bold font-outfit text-gray-900 mb-4">Sourcing Operations</h2>
            <div className="space-y-4">
              <button onClick={triggerSync} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Force Catalog Sync (DSFulfill)
              </button>
              <button onClick={triggerPoll} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Force Order Polling
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
