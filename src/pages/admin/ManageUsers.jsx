import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, MoreHorizontal, Activity, ShieldCheck, Mail, BookOpen } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';

const ManageUsers = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.get('/admin/users'),
    staleTime: 10 * 1000,
  });

  const users = data?.users || [];

  return (
    <div className="space-y-6 pb-16 min-h-screen animate-fadeIn">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            Resident Student Registry
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-1">Manage and view registered medical resident cohorts.</p>
        </div>
        <div className="flex bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full md:w-auto items-center">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="bg-transparent border-none outline-none text-sm font-semibold text-gray-700 w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Student Info</th>
                  <th className="py-4 px-6">Specialty & Year</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Registered</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400 text-sm font-semibold">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
                          />
                          <div>
                            <div className="font-bold text-gray-800">{user.fullName}</div>
                            <div className="text-xs font-semibold text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-bold text-gray-700">{user.specialization || 'General Psychiatry'}</div>
                        <div className="text-xs font-semibold text-gray-400 mt-0.5">{user.year || 'PG Year 1'}</div>
                      </td>
                      <td className="py-4 px-6">
                        {user.role === 'admin' ? (
                          <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" /> Admin
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                            <BookOpen className="w-3.5 h-3.5" /> Student
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-400 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
