import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../../../config/supabase';
import { FiUsers, FiLock, FiUnlock, FiSearch } from 'react-icons/fi';

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiUrl}/users`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleBlockUser = async (userId, isBanned) => {
        if (!confirm(`Are you sure you want to ${isBanned ? 'unblock' : 'block'} this user?`)) return;
        
        setActionLoading(userId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const endpoint = isBanned ? 'unblock' : 'block';
            
            await axios.put(`${apiUrl}/users/${userId}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            
            // Re-fetch users
            await fetchUsers();
        } catch (error) {
            console.error(`Error ${isBanned ? 'unblocking' : 'blocking'} user:`, error);
            alert(`Failed to ${isBanned ? 'unblock' : 'block'} user.`);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Users Management</h2>
                <div className="relative w-full sm:w-auto min-w-[300px]">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-text/60">
                    <FiUsers className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No users found matching your search.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="py-4 px-6 font-semibold text-gray-600">User</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600">Joined</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600">Status</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                                <span className="text-sm text-gray-500">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                user.is_banned 
                                                ? 'bg-red-100 text-red-800' 
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.is_banned ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => toggleBlockUser(user.id, user.is_banned)}
                                                disabled={actionLoading === user.id}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    user.is_banned
                                                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {actionLoading === user.id ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : user.is_banned ? (
                                                    <><FiUnlock className="w-4 h-4" /> Unblock</>
                                                ) : (
                                                    <><FiLock className="w-4 h-4" /> Block</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersTab;
