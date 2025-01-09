import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', role: '' });

    // Fetch users from backend on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            const response = await axios.get("http://127.0.0.1:5000/users");
            setUsers(response.data);
        };
        fetchUsers();
    }, []);

    const handleAddUser = async () => {
        if (!newUser.email || !newUser.role) {
            return alert('Please fill out all fields');
        }
        try {
            const response = await axios.post("http://127.0.0.1:5000/add_user", newUser);
            setUsers([...users, response.data.user]);  // Update the users list after adding
            setNewUser({ email: '', role: '' });  // Clear the input fields
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const handleRemoveUser = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/remove_user/${id}`);
            setUsers(users.filter((user) => user.id !== id));
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        setUsers(users.map((user) => (user.id === id ? { ...user, role: newRole } : user)));
        try {
            await axios.post("http://127.0.0.1:5000/assignRole", { userId: id, role: newRole });
            alert("Role assigned successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

            {/* Add User Form */}
            <div className="mb-6">
                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 mr-2"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <select
                    className="border p-2 mr-2"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Trainer">Trainer</option>
                    <option value="Employee">Employee</option>
                </select>
                <button className="bg-green-500 text-white px-4 py-2" onClick={handleAddUser}>
                    Add User
                </button>
            </div>

            {/* User List */}
            <div>
                {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between mb-4 border-b pb-2">
                        <span>
                            {user.email} - {user.role}
                        </span>
                        <div>
                            <select
                                className="border p-2 mr-2"
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            >
                                <option value="Admin">Admin</option>
                                <option value="Trainer">Trainer</option>
                                <option value="Employee">Employee</option>
                            </select>
                            <button
                                className="bg-red-500 text-white px-4 py-2"
                                onClick={() => handleRemoveUser(user.id)}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ManageUsers;
