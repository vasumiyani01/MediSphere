function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 8px; z-index: 9999;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = `
        padding: 12px 24px;
        border-radius: 8px;
        background-color: ${type === 'success' ? '#2563eb' : '#ef4444'};
        color: #ffffff;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transform: translateY(20px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        font-family: var(--font-sans);
    `;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => { toast.remove(); }, 300);
    }, 3000);
}

// Fetch user data on load
fetch('/api/accounts/user-status/')
    .then(res => res.json())
    .then(data => {
        if (!data.logged_in) {
            window.location.href = '/backend/login/';
        } else {
            // Fetch dynamic data
            loadAdminMetrics();
            loadPendingVerifications();
        }
    })
    .catch(err => {
        console.error('Error fetching user status:', err);
        window.location.href = '/backend/login/';
    });

function loadAdminMetrics() {
    fetch('/backend/api/metrics/')
        .then(res => res.json())
        .then(metrics => {
            if (metrics) {
                document.getElementById('count-citizens').textContent = metrics.citizens || 0;
                document.getElementById('count-doctors').textContent = metrics.doctors || 0;
                document.getElementById('count-pharmacies').textContent = metrics.pharmacies || 0;
                document.getElementById('count-medicines').textContent = metrics.medicines || 0;
                document.getElementById('count-diseases').textContent = metrics.diseases || 0;
                document.getElementById('count-logs').textContent = metrics.logs || 0;
                const helpdeskEl = document.getElementById('count-helpdesk-requested');
                if (helpdeskEl) helpdeskEl.textContent = metrics.helpdesk_requested || 0;
                const reportsEl = document.getElementById('count-reports');
                if (reportsEl) reportsEl.textContent = metrics.reports || 0;
            }
        })
        .catch(err => console.error('Error fetching admin metrics:', err));
}

function loadPendingVerifications() {
    const tbody = document.getElementById('pending-table-body');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 8px;">⏳</span> Loading pending applications...
            </td>
        </tr>
    `;

    fetch('/backend/api/pending-verifications/')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            try {
                if (data.success && data.users) {
                    if (data.users.length === 0) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 30px;">No pending verification applications.</td>
                            </tr>
                            `;
                        return;
                    }

                    let html = '';
                    data.users.forEach(user => {
                        html += `
                            <tr>
                                <td><strong>${escapeHTML(user.name)}</strong></td>
                                <td>
                                    <span class="role-badge role-${user.user_type}">
                                        ${escapeHTML(user.user_type)}
                                    </span>
                                </td>
                                <td><code>${escapeHTML(user.license_number)}</code></td>
                                <td>
                                    <button class="btn-action" onclick="approveUser(${user.id})">Verify Account</button>
                                </td>
                            </tr>
                        `;
                    });
                    tbody.innerHTML = html;
                } else {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="4" style="text-align: center; color: #ef4444; padding: 30px;">Failed to load applications: ${escapeHTML(data.error || 'Unknown error')}</td>
                        </tr>
                    `;
                }
            } catch (jsErr) {
                console.error('JS processing error:', jsErr);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: #ef4444; padding: 30px;">JS Render Error: ${escapeHTML(jsErr.message)}</td>
                    </tr>
                `;
            }
        })
        .catch(err => {
            console.error('Error loading pending verifications:', err);
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ef4444; padding: 30px;">Error communicating with server: ${escapeHTML(err.message)}</td>
                </tr>
            `;
        });
}

function approveUser(userId) {
    if (!confirm('Are you sure you want to approve and verify this user account?')) return;

    fetch(`/backend/api/approve-user/${userId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message || 'User approved successfully.');
                // Reload metrics and tables
                loadAdminMetrics();
                loadPendingVerifications();
                if (window.location.hash === '#users') {
                    loadUsersList();
                }
            } else {
                showToast('Error: ' + data.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error approving user:', err);
            showToast('Failed to send approval request.', 'error');
        });
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user account?')) return;
    fetch(`/backend/api/users/delete/${userId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message || 'User deleted successfully.');
                loadAdminMetrics();
                loadPendingVerifications();
                if (window.location.hash === '#users') {
                    loadUsersList();
                }
            } else {
                showToast('Error: ' + data.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error deleting user:', err);
            showToast('Failed to delete user account.', 'error');
        });
}

function deleteLog(logId) {
    if (!confirm('Are you sure you want to delete this log entry?')) return;
    fetch(`/backend/api/logs/delete/${logId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message || 'Log entry deleted successfully.');
                loadAdminMetrics();
                if (window.location.hash === '#logs') {
                    loadSystemLogs();
                }
            } else {
                showToast('Error: ' + data.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error deleting log:', err);
            showToast('Failed to delete log entry.', 'error');
        });
}

function deleteHelpdeskTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this support ticket?')) return;
    fetch(`/backend/api/helpdesk/delete/${ticketId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message || 'Support ticket deleted successfully.');
                loadAdminMetrics();
                if (window.location.hash === '#helpdesk') {
                    loadAdminHelpdeskTickets();
                }
            } else {
                showToast('Error: ' + data.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error deleting support ticket:', err);
            showToast('Failed to delete support ticket.', 'error');
        });
}

// Helper to read Django CSRF token cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function handleLogout() {
    fetch('/api/accounts/logout/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/backend/login/';
            }
        })
        .catch(err => console.error('Logout failed:', err));
}

// SPA Hash Routing
function handleRouting() {
    const hash = window.location.hash || '#overview';

    // Update active sidebar link
    document.querySelectorAll('.nav-links .nav-item').forEach(item => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === hash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Toggle sections
    const sections = {
        '#overview': 'section-overview',
        '#users': 'section-users',
        '#diseases': 'section-diseases',
        '#medicines': 'section-medicines',
        '#reports': 'section-reports',
        '#logs': 'section-logs',
        '#helpdesk': 'section-helpdesk'
    };

    Object.keys(sections).forEach(key => {
        const sectionEl = document.getElementById(sections[key]);
        if (sectionEl) {
            if (key === hash) {
                sectionEl.style.display = 'block';
            } else {
                sectionEl.style.display = 'none';
            }
        }
    });

    if (hash === '#users') {
        loadUsersList();
    } else if (hash === '#logs') {
        loadSystemLogs();
    } else if (hash === '#helpdesk') {
        loadAdminHelpdeskTickets();
    } else if (hash === '#diseases') {
        loadDiseasesList();
    } else if (hash === '#medicines') {
        loadMedicinesList();
    } else if (hash === '#reports') {
        loadReportsList();
    }
}

// Listen for routing events
window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

// Global State for Filtering
let allUsersList = [];
let activeRoleFilter = 'all';
let activeStatusFilter = 'all';

function setRoleFilter(role) {
    activeRoleFilter = role;
    document.querySelectorAll('[id^="filter-role-"]').forEach(btn => {
        if (btn.id === `filter-role-${role}`) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    filterUsers();
}

function setStatusFilter(status) {
    activeStatusFilter = status;
    document.querySelectorAll('[id^="filter-status-"]').forEach(btn => {
        if (btn.id === `filter-status-${status}`) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    filterUsers();
}

function filterUsers() {
    const query = document.getElementById('user-search').value.toLowerCase();
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const filtered = allUsersList.filter(user => {
        // Search query match
        const matchesSearch = user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.mobile_number.toLowerCase().includes(query);

        // Role filter match
        const matchesRole = activeRoleFilter === 'all' || user.user_type === activeRoleFilter;

        // Status filter match
        let matchesStatus = true;
        if (activeStatusFilter === 'pending') {
            matchesStatus = !user.is_approved;
        } else if (activeStatusFilter === 'approved') {
            matchesStatus = user.is_approved;
        }

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">No matching users found.</td>
            </tr>
        `;
        return;
    }

    let html = '';
    filtered.forEach((user, index) => {
        const actionBtn = user.is_approved
            ? `<button class="btn-action" disabled style="padding: 6px 14px; font-size: 11px; opacity: 0.5; cursor: not-allowed; background: var(--bg-tertiary); color: var(--text-muted); border: 1px solid var(--border-color);">Approved</button>`
            : `<button class="btn-action" onclick="approveUser('${user.id}')" style="padding: 6px 14px; font-size: 11px; background: var(--color-success); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Approve</button>`;
        html += `
            <tr>
                <td><code>${index + 1}</code></td>
                <td><strong>${escapeHTML(user.name)}</strong></td>
                <td>${escapeHTML(user.email)}</td>
                <td>${escapeHTML(user.mobile_number)}</td>
                <td>
                    <span class="role-badge role-${user.user_type}">
                        ${escapeHTML(user.user_type)}
                    </span>
                </td>
                <td><code>${escapeHTML(user.license_number)}</code></td>
                <td>
                    <span class="status-badge ${user.is_approved ? 'status-approved' : 'status-pending'}">
                        ${user.is_approved ? 'Approved' : 'Pending'}
                    </span>
                </td>
                <td style="color: var(--text-secondary);">${escapeHTML(user.date_joined)}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Fetch and load users list
function loadUsersList() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 8px;">⏳</span> Loading users data...
            </td>
        </tr>
    `;

    fetch('/backend/api/users/')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            try {
                if (data.success && data.users) {
                    allUsersList = data.users;
                    filterUsers();
                } else {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="9" style="text-align: center; color: #ef4444; padding: 30px;">Failed to load users: ${escapeHTML(data.error || 'Unknown error')}</td>
                        </tr>
                    `;
                }
            } catch (jsErr) {
                console.error('JS processing error:', jsErr);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center; color: #ef4444; padding: 30px;">JS Render Error: ${escapeHTML(jsErr.message)}</td>
                    </tr>
                `;
            }
        })
        .catch(err => {
            console.error('Error loading users:', err);
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; color: #ef4444; padding: 30px;">Error communicating with server: ${escapeHTML(err.message)}</td>
                </tr>
            `;
        });
}

function loadSystemLogs() {
    const tbody = document.getElementById('logs-table-body');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 8px;">⏳</span> Loading audit logs data...
            </td>
        </tr>
    `;

    fetch('/backend/api/logs/')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            try {
                if (data.success && data.logs) {
                    if (data.logs.length === 0) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">No activity logs found.</td>
                            </tr>
                          `;
                        return;
                    }

                    let html = '';
                    data.logs.forEach((log, index) => {
                        let formattedTime = '-';
                        if (log.timestamp) {
                            try {
                                const dateObj = new Date(log.timestamp);
                                if (!isNaN(dateObj.getTime())) {
                                    formattedTime = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
                                } else {
                                    formattedTime = log.timestamp;
                                }
                            } catch (e) {
                                formattedTime = log.timestamp;
                            }
                        }

                        html += `
                            <tr>
                                <td><code>${index + 1}</code></td>
                                <td>${escapeHTML(log.user_name || '-')}</td>
                                <td><strong>${escapeHTML(log.user_email)}</strong></td>
                                <td style="color: var(--text-secondary);">${escapeHTML(log.action)}</td>
                                <td style="color: var(--text-secondary);">${escapeHTML(formattedTime)}</td>
                            </tr>
                        `;
                    });
                    tbody.innerHTML = html;
                } else {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" style="text-align: center; color: #ef4444; padding: 30px;">Failed to load logs: ${escapeHTML(data.error || 'Unknown error')}</td>
                        </tr>
                    `;
                }
            } catch (jsErr) {
                console.error('JS processing error:', jsErr);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: #ef4444; padding: 30px;">JS Render Error: ${escapeHTML(jsErr.message)}</td>
                    </tr>
                `;
            }
        })
        .catch(err => {
            console.error('Error loading logs:', err);
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #ef4444; padding: 30px;">Error communicating with server: ${escapeHTML(err.message)}</td>
                </tr>
            `;
        });
}

function loadAdminHelpdeskTickets() {
    const tbody = document.getElementById('helpdesk-table-body');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 8px;">⏳</span> Loading support tickets...
            </td>
        </tr>
    `;

    fetch('/backend/api/helpdesk/all/')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.tickets) {
                // Update metrics counts
                const openCount = data.tickets.filter(t => t.status === 'open').length;
                const resolvedCount = data.tickets.filter(t => t.status === 'resolved').length;
                document.getElementById('helpdesk-open-tickets').textContent = openCount;
                document.getElementById('helpdesk-resolved-tickets').textContent = resolvedCount;
                document.getElementById('helpdesk-total-tickets').textContent = data.tickets.length;

                if (data.tickets.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 30px;">No support requests found.</td>
                        </tr>
                    `;
                    return;
                }

                let html = '';
                data.tickets.forEach((ticket, index) => {
                    let statusBadge = '';
                    let actionHtml = '';

                    if (ticket.status === 'requested' || !ticket.status) {
                        statusBadge = `<span class="role-badge role-citizen" style="background-color: var(--color-warning-glow); color: var(--color-warning);">Requested</span>`;
                        actionHtml = `
                            <button class="btn-action" onclick="adminOpenTicket(${ticket.id})">Open</button>
                            <button class="btn-action" style="margin-left: 6px; background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: transparent;" onclick="adminRejectTicket(${ticket.id})">Reject</button>
                        `;
                    } else if (ticket.status === 'open') {
                        statusBadge = `<span class="role-badge role-doctor" style="background-color: var(--color-primary-glow); color: var(--color-primary);">Open</span>`;
                        actionHtml = `
                            <button class="btn-action" style="background-color: var(--color-success-glow); color: var(--color-success); border-color: transparent;" onclick="adminResolveTicket(${ticket.id})">Resolved</button>
                        `;
                    } else if (ticket.status === 'rejected') {
                        statusBadge = `<span class="role-badge role-citizen" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444;">Rejected</span>`;
                        actionHtml = `
                            <button class="btn-action" style="opacity: 0.5; cursor: not-allowed;" disabled>Rejected</button>
                        `;
                    } else if (ticket.status === 'deleted') {
                        statusBadge = `<span class="role-badge role-citizen" style="background-color: rgba(100, 116, 139, 0.1); color: #64748b;">Deleted</span>`;
                        actionHtml = `
                            <button class="btn-action" style="opacity: 0.5; cursor: not-allowed;" disabled>Deleted</button>
                        `;
                    } else { // resolved
                        statusBadge = `<span class="role-badge role-doctor" style="background-color: var(--color-success-glow); color: var(--color-success);">Resolved</span>`;
                        actionHtml = `
                            <button class="btn-action" style="opacity: 0.5; cursor: not-allowed;" disabled>Resolved</button>
                        `;
                    }

                    html += `
                        <tr>
                            <td><strong style="color: var(--color-primary); font-family: monospace;">${escapeHTML(ticket.ticket_code)}</strong></td>
                            <td><strong>${escapeHTML(ticket.sender_name)}</strong></td>
                            <td><code>${escapeHTML(ticket.sender_email)}</code></td>
                            <td><span style="text-transform: capitalize; font-size: 13px; font-weight: 500;">${escapeHTML(ticket.sender_type)}</span></td>
                            <td style="max-width: 250px; white-space: normal; line-height: 1.4;">${escapeHTML(ticket.message)}</td>
                            <td><span style="font-size: 12px; color: var(--text-secondary);">${escapeHTML(ticket.created_at)}</span></td>
                            <td>${statusBadge}</td>
                            <td style="white-space: nowrap;">
                                ${actionHtml}
                            </td>
                        </tr>
                    `;
                });
                tbody.innerHTML = html;
            }
        })
        .catch(err => {
            console.error('Error loading admin helpdesk tickets:', err);
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: #ef4444; padding: 30px;">Error loading support tickets: ${escapeHTML(err.message)}</td>
                </tr>
            `;
        });
}

let helpdeskActionInProgress = false;

function adminOpenTicket(ticketId) {
    if (helpdeskActionInProgress) return;
    helpdeskActionInProgress = true;
    fetch(`/backend/api/helpdesk/open/${ticketId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(data => {
            helpdeskActionInProgress = false;
            if (data.success) {
                loadAdminHelpdeskTickets();
            } else {
                showToast('Error: ' + data.error, 'error');
            }
        })
        .catch(err => {
            helpdeskActionInProgress = false;
            console.error('Error opening ticket:', err);
            showToast('Failed to open ticket.', 'error');
        });
}

function adminRejectTicket(ticketId) {
    if (helpdeskActionInProgress) return;
    if (!confirm('Are you sure you want to reject this support request?')) return;
    helpdeskActionInProgress = true;
    fetch(`/backend/api/helpdesk/reject/${ticketId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(data => {
            helpdeskActionInProgress = false;
            if (data.success) {
                showToast('Ticket rejected successfully.');
                loadAdminHelpdeskTickets();
            } else {
                showToast('Error: ' + data.error, 'error');
            }
        })
        .catch(err => {
            helpdeskActionInProgress = false;
            console.error('Error rejecting ticket:', err);
            showToast('Failed to reject ticket.', 'error');
        });
}

function adminResolveTicket(ticketId) {
    if (helpdeskActionInProgress) return;
    if (!confirm('Mark this support request as Resolved?')) return;
    helpdeskActionInProgress = true;
    fetch(`/backend/api/helpdesk/resolve/${ticketId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(data => {
            helpdeskActionInProgress = false;
            if (data.success) {
                showToast(data.message || 'Ticket resolved successfully.');
                loadAdminHelpdeskTickets();
            } else {
                showToast('Error: ' + data.error, 'error');
            }
        })
        .catch(err => {
            helpdeskActionInProgress = false;
            console.error('Error resolving ticket:', err);
            showToast('Failed to resolve ticket.', 'error');
        });
}

function escapeJSVal(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'");
}

// Helper to escape HTML and prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
let allDiseases = [];

function loadDiseasesList() {
    const tbody = document.getElementById('diseases-table-body');
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="10" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 8px;">⏳</span> Loading diseases database...
            </td>
        </tr>
    `;

    fetch('/backend/api/diseases/')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.diseases) {
                allDiseases = data.diseases;
                renderDiseases(allDiseases);
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="10" style="text-align: center; color: #ef4444; padding: 30px;">Failed to load diseases: ${escapeHTML(data.error)}</td>
                    </tr>
                `;
            }
        })
        .catch(err => {
            console.error('Error fetching diseases:', err);
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; color: #ef4444; padding: 30px;">Error loading diseases data: ${escapeHTML(err.message)}</td>
                </tr>
            `;
        });
}

function renderDiseases(list) {
    const tbody = document.getElementById('diseases-table-body');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; color: var(--text-secondary); padding: 30px;">No diseases found.</td>
            </tr>
        `;
        return;
    }

    let html = '';
    list.forEach((d, index) => {
        html += `
            <tr>
                <td><code>${index + 1}</code></td>
                <td><strong>${escapeHTML(d.name)}</strong></td>
                <td style="max-width: 200px; font-size: 13px; line-height: 1.4; white-space: normal; color: var(--text-secondary);">${escapeHTML(d.description || '-')}</td>
                <td style="max-width: 150px; font-size: 13px; line-height: 1.4; white-space: normal; color: var(--text-secondary);">${escapeHTML(d.causes || '-')}</td>
                <td style="max-width: 180px; font-size: 13px; line-height: 1.4; white-space: normal; color: var(--text-secondary);">${escapeHTML(d.symptoms || '-')}</td>
                <td style="max-width: 150px; font-size: 13px; line-height: 1.4; white-space: normal; color: var(--text-secondary);">${escapeHTML(d.risk_factors || '-')}</td>
                <td style="max-width: 150px; font-size: 13px; line-height: 1.4; white-space: normal; color: var(--text-secondary);">${escapeHTML(d.complications || '-')}</td>
                <td style="max-width: 180px; font-size: 13px; line-height: 1.4; white-space: normal; color: var(--text-secondary);">${escapeHTML(d.treatment || '-')}</td>
                <td style="max-width: 150px; font-size: 13px; line-height: 1.4; white-space: normal; color: var(--text-secondary);">${escapeHTML(d.medicine || '-')}</td>
                <td style="white-space: nowrap;">
                    <button class="btn-action" onclick="editDiseaseClick('${d.id}')">Edit</button>
                    <button class="btn-action" style="margin-left: 6px; background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: transparent;" onclick="deleteDisease('${d.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function filterDiseases() {
    const query = document.getElementById('disease-search').value.toLowerCase().trim();
    if (!query) {
        renderDiseases(allDiseases);
        return;
    }

    const filtered = allDiseases.filter(d =>
        d.name.toLowerCase().includes(query) ||
        (d.description && d.description.toLowerCase().includes(query)) ||
        (d.causes && d.causes.toLowerCase().includes(query)) ||
        (d.symptoms && d.symptoms.toLowerCase().includes(query)) ||
        (d.treatment && d.treatment.toLowerCase().includes(query)) ||
        (d.medicine && d.medicine.toLowerCase().includes(query))
    );

    renderDiseases(filtered);
}

function openAddDiseaseModal() {
    document.getElementById('add-disease-form').reset();
    document.getElementById('add-disease-modal').style.display = 'flex';
}

function closeAddDiseaseModal() {
    document.getElementById('add-disease-modal').style.display = 'none';
}

function saveDisease(event) {
    event.preventDefault();
    const payload = {
        name: document.getElementById('add-dis-name').value,
        description: document.getElementById('add-dis-description').value,
        causes: document.getElementById('add-dis-causes').value,
        symptoms: document.getElementById('add-dis-symptoms').value,
        risk_factors: document.getElementById('add-dis-risk-factors').value,
        complications: document.getElementById('add-dis-complications').value,
        treatment: document.getElementById('add-dis-treatment').value,
        medicine: document.getElementById('add-dis-medicine').value
    };

    fetch('/backend/api/diseases/add/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast('Disease added successfully!');
                closeAddDiseaseModal();
                loadDiseasesList();
            } else { showToast('Error: ' + resData.error, 'error'); }
        })
        .catch(err => { console.error('Error adding disease:', err); showToast('Failed to add disease.', 'error'); });
}

function closeEditDiseaseModal() {
    document.getElementById('edit-disease-modal').style.display = 'none';
}

function editDiseaseClick(id) {
    const disease = allDiseases.find(d => String(d.id) === String(id));
    if (!disease) return;
    document.getElementById('edit-dis-id').value = disease.id;
    document.getElementById('edit-dis-name').value = disease.name || '';
    document.getElementById('edit-dis-description').value = disease.description || '';
    document.getElementById('edit-dis-causes').value = disease.causes || '';
    document.getElementById('edit-dis-symptoms').value = disease.symptoms || '';
    document.getElementById('edit-dis-risk-factors').value = disease.risk_factors || '';
    document.getElementById('edit-dis-complications').value = disease.complications || '';
    document.getElementById('edit-dis-treatment').value = disease.treatment || '';
    document.getElementById('edit-dis-medicine').value = disease.medicine || '';
    document.getElementById('edit-disease-modal').style.display = 'flex';
}

function updateDisease(event) {
    event.preventDefault();
    const diseaseId = document.getElementById('edit-dis-id').value;
    const payload = {
        name: document.getElementById('edit-dis-name').value,
        description: document.getElementById('edit-dis-description').value,
        causes: document.getElementById('edit-dis-causes').value,
        symptoms: document.getElementById('edit-dis-symptoms').value,
        risk_factors: document.getElementById('edit-dis-risk-factors').value,
        complications: document.getElementById('edit-dis-complications').value,
        treatment: document.getElementById('edit-dis-treatment').value,
        medicine: document.getElementById('edit-dis-medicine').value
    };

    fetch(`/backend/api/diseases/edit/${diseaseId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast('Disease updated successfully!');
                closeEditDiseaseModal();
                loadDiseasesList();
            } else { showToast('Error: ' + resData.error, 'error'); }
        })
        .catch(err => { console.error('Error updating disease:', err); showToast('Failed to update disease.', 'error'); });
}

function deleteDisease(disId) {
    if (!confirm('Are you sure you want to delete this disease?')) return;
    fetch(`/backend/api/diseases/delete/${disId}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast('Disease deleted successfully!');
                loadDiseasesList();
            } else { showToast('Error: ' + resData.error, 'error'); }
        })
        .catch(err => { console.error('Error deleting disease:', err); showToast('Failed to delete disease.', 'error'); });
}

let allMedicines = [];

function loadMedicinesList() {
    const tbody = document.getElementById('medicines-table-body');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 8px;">⏳</span> Loading medicines catalog...
            </td>
        </tr>
    `;

    fetch('/backend/api/medicines/')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.medicines) {
                allMedicines = data.medicines;
                renderMedicines(allMedicines);
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center; color: #ef4444; padding: 30px;">Failed to load medicines: ${escapeHTML(data.error)}</td>
                    </tr>
                `;
            }
        })
        .catch(err => {
            console.error('Error fetching medicines:', err);
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; color: #ef4444; padding: 30px;">Error loading medicines: ${escapeHTML(err.message)}</td>
                </tr>
            `;
        });
}

function renderMedicines(list) {
    const tbody = document.getElementById('medicines-table-body');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">No medicines found.</td>
            </tr>
        `;
        return;
    }

    let html = '';
    list.forEach((m, index) => {
        const imgTag = m.image_url
            ? `<img src="${escapeHTML(m.image_url)}" alt="${escapeHTML(m.name)}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.src='https://placehold.co/40x40?text=Med'"/>`
            : `<div style="width: 40px; height: 40px; border-radius: 6px; background-color: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); border: 1px solid var(--border-color); font-size: 18px;">💊</div>`;

        html += `
            <tr>
                <td><code>${index + 1}</code></td>
                <td>${imgTag}</td>
                <td><strong>${escapeHTML(m.name)}</strong></td>
                <td>${escapeHTML(m.manufacturer)}</td>
                <td><span class="role-badge role-citizen" style="text-transform: capitalize;">${escapeHTML(m.category)}</span></td>
                <td><code>${escapeHTML(m.pack_size)}</code></td>
                <td style="max-width: 200px; font-size: 13px; line-height: 1.4; white-space: normal; color: var(--text-secondary);">${escapeHTML(m.uses || '-')}</td>
                <td style="max-width: 200px; font-size: 13px; line-height: 1.4; white-space: normal; color: var(--text-secondary);">${escapeHTML(m.side_effects || '-')}</td>
                <td style="white-space: nowrap;">
                    <button class="btn-action" onclick="editMedicineClick('${m.id}')">Edit</button>
                    <button class="btn-action" style="margin-left: 6px; background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: transparent;" onclick="deleteMedicine('${m.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function editMedicineClick(id) {
    const m = allMedicines.find(x => x.id.toString() === id.toString());
    if (m) {
        openEditMedicineModal(m);
    }
}

function filterMedicines() {
    const query = document.getElementById('medicine-search').value.toLowerCase().trim();
    const category = document.getElementById('medicine-category-filter').value;

    let filtered = allMedicines;

    if (category !== 'all') {
        filtered = filtered.filter(m => m.category === category);
    }

    if (query) {
        filtered = filtered.filter(m =>
            m.name.toLowerCase().includes(query) ||
            m.manufacturer.toLowerCase().includes(query) ||
            (m.uses && m.uses.toLowerCase().includes(query)) ||
            (m.side_effects && m.side_effects.toLowerCase().includes(query))
        );
    }

    renderMedicines(filtered);
}

// Dialog Triggers
function openAddMedicineModal() {
    document.getElementById('add-medicine-form').reset();
    document.getElementById('add-medicine-modal').style.display = 'flex';
}

function closeAddMedicineModal() {
    document.getElementById('add-medicine-modal').style.display = 'none';
}

function openEditMedicineModal(m) {
    document.getElementById('edit-med-id').value = m.id;
    document.getElementById('edit-med-name').value = m.name;
    document.getElementById('edit-med-image-url').value = m.image_url || '';
    document.getElementById('edit-med-manufacturer').value = m.manufacturer;
    document.getElementById('edit-med-category').value = m.category || 'tablet';
    document.getElementById('edit-med-pack-size').value = m.pack_size || '';
    document.getElementById('edit-med-uses').value = m.uses || '';
    document.getElementById('edit-med-side-effects').value = m.side_effects || '';
    document.getElementById('edit-medicine-modal').style.display = 'flex';
}

function closeEditMedicineModal() {
    document.getElementById('edit-medicine-modal').style.display = 'none';
}

function saveMedicine(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('add-med-name').value,
        image_url: document.getElementById('add-med-image-url').value,
        manufacturer: document.getElementById('add-med-manufacturer').value,
        category: document.getElementById('add-med-category').value,
        pack_size: document.getElementById('add-med-pack-size').value,
        uses: document.getElementById('add-med-uses').value,
        side_effects: document.getElementById('add-med-side-effects').value
    };

    fetch('/backend/api/medicines/add/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast('Medicine added successfully!');
                closeAddMedicineModal();
                loadMedicinesList();
                loadAdminMetrics(); // refresh medicine count card
            } else {
                showToast('Error: ' + resData.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error adding medicine:', err);
            showToast('Failed to add medicine.', 'error');
        });
}

function updateMedicine(e) {
    e.preventDefault();
    const medId = document.getElementById('edit-med-id').value;
    const data = {
        name: document.getElementById('edit-med-name').value,
        image_url: document.getElementById('edit-med-image-url').value,
        manufacturer: document.getElementById('edit-med-manufacturer').value,
        category: document.getElementById('edit-med-category').value,
        pack_size: document.getElementById('edit-med-pack-size').value,
        uses: document.getElementById('edit-med-uses').value,
        side_effects: document.getElementById('edit-med-side-effects').value
    };

    fetch(`/backend/api/medicines/edit/${medId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast('Medicine updated successfully!');
                closeEditMedicineModal();
                loadMedicinesList();
            } else {
                showToast('Error: ' + resData.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error updating medicine:', err);
            showToast('Failed to update medicine.', 'error');
        });
}

function deleteMedicine(medId) {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    fetch(`/backend/api/medicines/delete/${medId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast('Medicine deleted successfully!');
                loadMedicinesList();
                loadAdminMetrics(); // refresh medicine count card
            } else {
                showToast('Error: ' + resData.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error deleting medicine:', err);
            showToast('Failed to delete medicine.', 'error');
        });
}

// --- REPORTS MANAGEMENT SECTION ---
let allReports = [];

function loadReportsList() {
    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 8px;">⏳</span> Loading reports catalog...
            </td>
        </tr>
    `;

    fetch('/backend/api/reports/')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.reports) {
                allReports = data.reports;
                renderReports(allReports);
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center; color: #ef4444; padding: 30px;">Failed to load reports: ${escapeHTML(data.error)}</td>
                    </tr>
                `;
            }
        })
        .catch(err => {
            console.error('Error fetching reports:', err);
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; color: #ef4444; padding: 30px;">Error loading reports: ${escapeHTML(err.message)}</td>
                </tr>
            `;
        });
}

function renderReports(list) {
    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">No report templates found.</td>
            </tr>
        `;
        return;
    }

    let html = '';
    list.forEach((r, index) => {
        const params = r.parameters || [];
        const rowSpan = params.length || 1;

        // First parameter row (or empty if no parameters)
        const p0 = params[0] || { parameter: '-', unit: '-', male_min: '-', male_max: '-', female_min: '-', female_max: '-' };
        const p0_male = (p0.male_min || p0.male_max) ? `${escapeHTML(p0.male_min)} - ${escapeHTML(p0.male_max)}` : '-';
        const p0_female = (p0.female_min || p0.female_max) ? `${escapeHTML(p0.female_min)} - ${escapeHTML(p0.female_max)}` : '-';

        html += `
            <tr>
                <td rowspan="${rowSpan}"><code>${index + 1}</code></td>
                <td rowspan="${rowSpan}"><strong>${escapeHTML(r.name)}</strong></td>
                <td rowspan="${rowSpan}"><code>${escapeHTML(r.short_name)}</code></td>
                <td rowspan="${rowSpan}"><span class="role-badge role-doctor" style="background-color: var(--color-info-glow); color: var(--color-info); text-transform: uppercase;">${escapeHTML(r.category)}</span></td>
                <td>${escapeHTML(p0.parameter)}</td>
                <td><code>${escapeHTML(p0.unit)}</code></td>
                <td>${p0_male}</td>
                <td>${p0_female}</td>
                <td rowspan="${rowSpan}" style="white-space: nowrap;">
                    <button class="btn-action" onclick="editReportClick('${r.id}')">Edit</button>
                    <button class="btn-action" style="margin-left: 6px; background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: transparent;" onclick="deleteReport('${r.id}')">Delete</button>
                </td>
            </tr>
        `;

        // Subsequent parameter rows
        for (let i = 1; i < params.length; i++) {
            const pi = params[i];
            const pi_male = (pi.male_min || pi.male_max) ? `${escapeHTML(pi.male_min)} - ${escapeHTML(pi.male_max)}` : '-';
            const pi_female = (pi.female_min || pi.female_max) ? `${escapeHTML(pi.female_min)} - ${escapeHTML(pi.female_max)}` : '-';
            html += `
                <tr>
                    <td>${escapeHTML(pi.parameter)}</td>
                    <td><code>${escapeHTML(pi.unit)}</code></td>
                    <td>${pi_male}</td>
                    <td>${pi_female}</td>
                </tr>
            `;
        }
    });
    tbody.innerHTML = html;
}

function filterReports() {
    const query = document.getElementById('report-search').value.toLowerCase().trim();
    const category = document.getElementById('report-category-filter').value;
    const sortBy = document.getElementById('report-sort-filter').value;

    let filtered = [...allReports]; // use copy so we don't mutate global order

    if (category !== 'all') {
        filtered = filtered.filter(r => r.category === category);
    }

    if (query) {
        filtered = filtered.filter(r =>
            r.name.toLowerCase().includes(query) ||
            r.short_name.toLowerCase().includes(query) ||
            r.category.toLowerCase().includes(query) ||
            (r.description && r.description.toLowerCase().includes(query))
        );
    }

    if (sortBy === 'asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'desc') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    renderReports(filtered);
}

function addParameterRow(prefix, data = null) {
    const container = document.getElementById(`${prefix}-report-parameters-container`);
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'parameter-row';
    row.style.cssText = 'display: grid; grid-template-columns: 1.5fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 30px; gap: 8px; align-items: center; background: #f8fafc; padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 8px; width: 100%; box-sizing: border-box;';

    const paramName = data ? data.parameter : '';
    const paramUnit = data ? data.unit : '';
    const paramMaleMin = data ? data.male_min : '';
    const paramMaleMax = data ? data.male_max : '';
    const paramFemaleMin = data ? data.female_min : '';
    const paramFemaleMax = data ? data.female_max : '';

    row.innerHTML = `
        <input type="text" placeholder="Parameter" value="${escapeHTML(paramName)}" required class="param-name" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #0f172a; outline: none; font-size: 13px; box-sizing: border-box;" />
        <input type="text" placeholder="Unit" value="${escapeHTML(paramUnit)}" required class="param-unit" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #0f172a; outline: none; font-size: 13px; box-sizing: border-box;" />
        <input type="text" placeholder="Male Min" value="${escapeHTML(paramMaleMin)}" required class="param-male-min" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #0f172a; outline: none; font-size: 13px; box-sizing: border-box;" />
        <input type="text" placeholder="Male Max" value="${escapeHTML(paramMaleMax)}" required class="param-male-max" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #0f172a; outline: none; font-size: 13px; box-sizing: border-box;" />
        <input type="text" placeholder="Female Min" value="${escapeHTML(paramFemaleMin)}" required class="param-female-min" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #0f172a; outline: none; font-size: 13px; box-sizing: border-box;" />
        <input type="text" placeholder="Female Max" value="${escapeHTML(paramFemaleMax)}" required class="param-female-max" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #0f172a; outline: none; font-size: 13px; box-sizing: border-box;" />
        <button type="button" onclick="this.parentElement.remove()" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 20px; font-weight: bold; text-align: center; line-height: 1; display: flex; align-items: center; justify-content: center;">&times;</button>
    `;
    container.appendChild(row);
}

function openAddReportModal() {
    document.getElementById('add-report-form').reset();
    document.getElementById('add-report-parameters-container').innerHTML = '';
    addParameterRow('add'); // start with one blank parameter row
    document.getElementById('add-report-modal').style.display = 'flex';
}

function closeAddReportModal() {
    document.getElementById('add-report-modal').style.display = 'none';
}

function closeEditReportModal() {
    document.getElementById('edit-report-modal').style.display = 'none';
}

function saveReport(e) {
    e.preventDefault();

    // Construct parameters list
    const container = document.getElementById('add-report-parameters-container');
    const rows = container.querySelectorAll('.parameter-row');
    const parameters = [];

    rows.forEach(row => {
        const parameter = row.querySelector('.param-name').value.trim();
        const unit = row.querySelector('.param-unit').value.trim();
        const male_min = row.querySelector('.param-male-min').value.trim();
        const male_max = row.querySelector('.param-male-max').value.trim();
        const female_min = row.querySelector('.param-female-min').value.trim();
        const female_max = row.querySelector('.param-female-max').value.trim();
        if (parameter) {
            parameters.push({ parameter, unit, male_min, male_max, female_min, female_max });
        }
    });

    if (parameters.length === 0) {
        showToast('Please add at least one report parameter.', 'error');
        return;
    }

    const data = {
        name: document.getElementById('add-rep-name').value.trim(),
        short_name: document.getElementById('add-rep-short-name').value.trim(),
        category: document.getElementById('add-rep-category').value,
        description: document.getElementById('add-rep-description').value.trim(),
        parameters: parameters
    };

    fetch('/backend/api/reports/add/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast('Report template added successfully!');
                closeAddReportModal();
                loadReportsList();
            } else {
                showToast('Error: ' + resData.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error adding report template:', err);
            showToast('Failed to add report template.', 'error');
        });
}

function editReportClick(id) {
    const report = allReports.find(r => String(r.id) === String(id));
    if (!report) return;

    document.getElementById('edit-rep-id').value = report.id;
    document.getElementById('edit-rep-name').value = report.name;
    document.getElementById('edit-rep-short-name').value = report.short_name;
    document.getElementById('edit-rep-category').value = report.category || 'Hematology';
    document.getElementById('edit-rep-description').value = report.description || '';

    const container = document.getElementById('edit-report-parameters-container');
    container.innerHTML = '';
    if (report.parameters && report.parameters.length > 0) {
        report.parameters.forEach(p => {
            addParameterRow('edit', p);
        });
    } else {
        addParameterRow('edit');
    }

    document.getElementById('edit-report-modal').style.display = 'flex';
}

function updateReport(e) {
    e.preventDefault();
    const reportId = document.getElementById('edit-rep-id').value;

    // Construct parameters list
    const container = document.getElementById('edit-report-parameters-container');
    const rows = container.querySelectorAll('.parameter-row');
    const parameters = [];

    rows.forEach(row => {
        const parameter = row.querySelector('.param-name').value.trim();
        const unit = row.querySelector('.param-unit').value.trim();
        const male_min = row.querySelector('.param-male-min').value.trim();
        const male_max = row.querySelector('.param-male-max').value.trim();
        const female_min = row.querySelector('.param-female-min').value.trim();
        const female_max = row.querySelector('.param-female-max').value.trim();
        if (parameter) {
            parameters.push({ parameter, unit, male_min, male_max, female_min, female_max });
        }
    });

    if (parameters.length === 0) {
        showToast('Please add at least one report parameter.', 'error');
        return;
    }

    const data = {
        name: document.getElementById('edit-rep-name').value.trim(),
        short_name: document.getElementById('edit-rep-short-name').value.trim(),
        category: document.getElementById('edit-rep-category').value,
        description: document.getElementById('edit-rep-description').value.trim(),
        parameters: parameters
    };

    fetch(`/backend/api/reports/edit/${reportId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast('Report template updated successfully!');
                closeEditReportModal();
                loadReportsList();
            } else {
                showToast('Error: ' + resData.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error updating report template:', err);
            showToast('Failed to update report template.', 'error');
        });
}

function deleteReport(id) {
    if (!confirm('Are you sure you want to delete this report template?')) return;

    fetch(`/backend/api/reports/delete/${id}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast('Report template deleted successfully!');
                loadReportsList();
            } else {
                showToast('Error: ' + resData.error, 'error');
            }
        })
        .catch(err => {
            console.error('Error deleting report template:', err);
            showToast('Failed to delete report template.', 'error');
        });
}
