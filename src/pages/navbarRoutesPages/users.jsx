import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Navbar from "../../components/navbar.jsx";
import {
    authFetch,
    formatYearLevel,
    getCourseLabel,
    getPositionLabel,
} from "../../components/export/utility.jsx";

import "../../styles/navbarRoutes/users.css";

const USER_CATEGORIES = [
    { id: "studentOfficer", label: "Student Officer" },
    { id: "schoolFaculty", label: "School Admin" },
];

const readUsersResponse = async (response) => {
    if (!response.ok) throw new Error("Could not load users.");

    const data = await response.json();
    if (Array.isArray(data)) return data;

    const users = data?.users || data?.registeredUsers || data?.data;
    return Array.isArray(users) ? users : [];
};

const getFullName = (user) => {
    return `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "-";
};

const getSectionValue = (section) => {
    return String(section ?? "").trim().replace(/^section\s+/i, "") || "-";
};

const getUserId = (user) => {
    return user?.id || user?._id;
};

function Users(){
    const [role, setRole] = useState("studentOfficer");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const selectedCategory = USER_CATEGORIES.find(category => category.id === role);

    const fetchUsers = async () => {
        setLoading(true);

        try {
            const response = await authFetch(`/registered-users?role=${role}`);
            const data = await readUsersResponse(response);
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Could not load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [role]);

    const handleDeleteUser = async () => {
        const userId = getUserId(deleteTarget);

        if (!userId) {
            toast.error("Cannot delete user without an id.");
            return;
        }

        setDeleting(true);

        try {
            const response = await authFetch(`/registered-user/${userId}`, {
                method: "DELETE",
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete user.");
            }

            toast.success("User deleted.");
            setUsers(prev => prev.filter(user => getUserId(user) !== userId));
            setDeleteTarget(null);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Could not delete user.");
        } finally {
            setDeleting(false);
        }
    };

    return(
        <>
            <Navbar/>

            <header className="users-select">
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    {USER_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                </select>
            </header>

            <main className="users-page">
                <section className="users-table-container">
                    <h1>{selectedCategory?.label || "Registered Users"}</h1>
                    <hr/>

                    <table className="users-table">
                        <thead className="users-table-header">
                            <tr>
                                <th>No.</th>
                                <th>NAME</th>
                                <th>EMAIL</th>
                                {role === "studentOfficer" && (
                                    <>
                                        <th>COURSE</th>
                                        <th>YEAR</th>
                                        <th>SECTION</th>
                                        <th>POSITION</th>
                                    </>
                                )}
                                {role === "schoolFaculty" && <th>ROLE</th>}
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="users-table-body">
                            {loading ? (
                                <tr>
                                    <td colSpan={role === "studentOfficer" ? 8 : 5}>Loading users...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={role === "studentOfficer" ? 8 : 5}>No users found.</td>
                                </tr>
                            ) : users.map((user, index) => (
                                <tr key={getUserId(user) || user.email}>
                                    <td>{index + 1}</td>
                                    <td>{getFullName(user)}</td>
                                    <td>{user.email || "-"}</td>
                                    {role === "studentOfficer" && (
                                        <>
                                            <td>{getCourseLabel(user.course) || "-"}</td>
                                            <td>{formatYearLevel(user.year) || "-"}</td>
                                            <td>{getSectionValue(user.section)}</td>
                                            <td>{getPositionLabel(user.position) || "-"}</td>
                                        </>
                                    )}
                                    {role === "schoolFaculty" && <td>School Admin</td>}
                                    <td>
                                        <button
                                            className="delete-user-btn"
                                            type="button"
                                            onClick={() => setDeleteTarget(user)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>

            {deleteTarget && (
                <div className="modal-overlay">
                    <div className="delete-user-modal">
                        <h2>Delete User?</h2>
                        <p>
                            This will permanently delete {getFullName(deleteTarget)} from the database.
                        </p>
                        <div className="delete-user-modal-actions">
                            <button
                                className="cancel-delete-user-btn"
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-delete-user-btn"
                                type="button"
                                onClick={handleDeleteUser}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Users
