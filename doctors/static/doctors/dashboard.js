let isProfileComplete = false;

function getDoctorGreetingName(fullName) {
    if (!fullName) return '';
    let parts = fullName.split(' ').filter(part => part.trim().length > 0);
    if (parts.length > 0) {
        if (parts[0].toLowerCase().replace('.', '') === 'dr') {
            parts.shift();
        }
    }
    return parts[0] || '';
}

function openProfileModal(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'flex';
}

function closeProfileModal() {
    if (!isProfileComplete) {
        alert("You must complete your profile details first to access other features!");
        return;
    }
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
}

function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
    });
    // Show target tab content
    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) {
        activeTab.style.display = 'block';
    }

    // Show/hide main greeting header depending on overview tab
    const header = document.querySelector('.main-content > header');
    if (header) {
        header.style.display = (tabId === 'overview') ? 'flex' : 'none';
    }

    // Update active state in sidebar
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        const link = li.querySelector('a');
        if (link && link.getAttribute('href') === `#${tabId}`) {
            li.classList.add('active');
        }
    });

    if (tabId === 'helpdesk' || tabId === 'today' || tabId === 'overview') {
        loadHelpdeskTickets();
    }
    if (tabId === 'today' || tabId === 'appointments' || tabId === 'overview') {
        if (typeof loadDoctorAppointments === 'function') {
            loadDoctorAppointments();
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Tab switching router
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1) || 'overview';
        if (isProfileComplete || hash === 'overview') {
            switchTab(hash);
        } else {
            window.location.hash = '#overview';
            switchTab('overview');
        }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Fetch user data on load
    fetch('/api/accounts/user-status/')
        .then(res => res.json())
        .then(data => {
            if (!data.logged_in) {
                window.location.href = '/';
            } else {
                document.getElementById('greeting').textContent = `Welcome back, Dr. ${getDoctorGreetingName(data.user.name)}!`;
                const licNoEl = document.getElementById('licenseNo');
                if (licNoEl) {
                    licNoEl.textContent = data.user.license_number || 'N/A';
                }
                const user = data.user;
                isProfileComplete = !!(user.address && user.city && user.state && user.pincode && user.license_number && user.open_from && user.closes_from && user.specialization && user.gender);

                // Populate Profile settings form
                document.getElementById('set_name').value = user.name || '';
                document.getElementById('set_license').value = user.license_number || '';
                document.getElementById('set_mobile').value = user.mobile_number || '';
                document.getElementById('set_email').value = user.email || '';
                document.getElementById('set_specialization').value = user.specialization || 'General Physician';
                document.getElementById('set_gender').value = user.gender || 'Male';
                document.getElementById('set_address').value = user.address || '';
                document.getElementById('set_city').value = user.city || '';
                document.getElementById('set_state').value = user.state || '';
                document.getElementById('set_pincode').value = user.pincode || '';
                document.getElementById('set_open_from').value = user.open_from || '';
                document.getElementById('set_closes_from').value = user.closes_from || '';

                if (user.appointment_slot && user.appointment_slot_time) {
                    localStorage.setItem('doctor_appt_slot', user.appointment_slot);
                    localStorage.setItem('doctor_appt_slot_time', user.appointment_slot_time);
                    const parts = user.appointment_slot.split(' - ');
                    if (parts.length === 2) {
                        localStorage.setItem('doctor_appt_from', parse12HourTo24(parts[0]));
                        localStorage.setItem('doctor_appt_to', parse12HourTo24(parts[1]));
                    }
                } else {
                    localStorage.removeItem('doctor_appt_slot');
                    localStorage.removeItem('doctor_appt_slot_time');
                    localStorage.removeItem('doctor_appt_from');
                    localStorage.removeItem('doctor_appt_to');
                }
                if (typeof checkAndResetAppointmentTime === 'function') {
                    checkAndResetAppointmentTime();
                }

                if (!isProfileComplete) {
                    document.getElementById('profile-alert-container').style.display = 'block';
                    document.getElementById('closeModalBtn').style.display = 'none';
                    openProfileModal();
                } else {
                    document.getElementById('profile-alert-container').style.display = 'none';
                    document.getElementById('closeModalBtn').style.display = 'block';

                    // Populate values
                    document.getElementById('specializationInput').value = user.specialization || '';
                    document.getElementById('genderInput').value = user.gender || '';
                    document.getElementById('addressInput').value = user.address || '';
                    document.getElementById('cityInput').value = user.city || '';
                    document.getElementById('stateInput').value = user.state || '';
                    document.getElementById('pincodeInput').value = user.pincode || '';
                    document.getElementById('openFromInput').value = user.open_from || '';
                    document.getElementById('closesFromInput').value = user.closes_from || '';
                }

                // Trigger tab render based on current hash
                handleHashChange();
                if (typeof loadDoctorAppointments === 'function') {
                    loadDoctorAppointments();
                }
            }
        })
        .catch(err => {
            console.error('Error fetching user status:', err);
            window.location.href = '/';
        });

    // Block sidebar links when profile is incomplete, otherwise switch tabs robustly
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            const targetHref = this.getAttribute('href');
            const hash = targetHref.substring(1);
            if (!isProfileComplete && hash !== 'overview') {
                e.preventDefault();
                e.stopPropagation();
                alert("Please complete your profile details first to unlock sidebar options!");
                openProfileModal();
            } else {
                e.preventDefault();
                window.location.hash = targetHref;
                switchTab(hash);
            }
        });
    });

    // Handle profile completion form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('set_name').value.trim();
            const mobile_number = document.getElementById('set_mobile').value.trim();
            const email = document.getElementById('set_email').value.trim();
            const license_number = document.getElementById('set_license').value.trim();
            const address = document.getElementById('addressInput').value.trim();
            const city = document.getElementById('cityInput').value.trim();
            const state = document.getElementById('stateInput').value.trim();
            const pincode = document.getElementById('pincodeInput').value.trim();
            const open_from = document.getElementById('openFromInput').value;
            const closes_from = document.getElementById('closesFromInput').value;
            const specialization = document.getElementById('specializationInput').value;
            const gender = document.getElementById('genderInput').value;

            const payload = {
                name,
                mobile_number,
                email,
                license_number,
                address,
                city,
                state,
                pincode,
                open_from,
                closes_from,
                specialization,
                gender
            };

            fetch('/doctors/update-doctor-profile/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Profile completed successfully!");
                        isProfileComplete = true;
                        document.getElementById('profile-alert-container').style.display = 'none';
                        document.getElementById('closeModalBtn').style.display = 'block';
                        document.getElementById('profileModal').style.display = 'none';
                        document.getElementById('greeting').textContent = `Welcome back, Dr. ${getDoctorGreetingName(name)}!`;
                        const licNoEl = document.getElementById('licenseNo');
                        if (licNoEl) {
                            licNoEl.textContent = license_number;
                        }

                        // Sync settings form as well
                        document.getElementById('set_specialization').value = specialization;
                        document.getElementById('set_gender').value = gender;
                        document.getElementById('set_address').value = address;
                        document.getElementById('set_city').value = city;
                        document.getElementById('set_state').value = state;
                        document.getElementById('set_pincode').value = pincode;
                        document.getElementById('set_open_from').value = open_from;
                        document.getElementById('set_closes_from').value = closes_from;
                    } else {
                        alert("Error: " + data.error);
                    }
                })
                .catch(err => {
                    console.error('Error completing profile:', err);
                    alert('Failed to complete profile.');
                });
        });
    }

    // Handle profile settings tab form submission
    const settingsForm = document.getElementById('profileSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('set_name').value.trim();
            const mobile_number = document.getElementById('set_mobile').value.trim();
            const email = document.getElementById('set_email').value.trim();
            const license_number = document.getElementById('set_license').value.trim();
            const address = document.getElementById('set_address').value.trim();
            const city = document.getElementById('set_city').value.trim();
            const state = document.getElementById('set_state').value.trim();
            const pincode = document.getElementById('set_pincode').value.trim();
            const open_from = document.getElementById('set_open_from').value;
            const closes_from = document.getElementById('set_closes_from').value;
            const specialization = document.getElementById('set_specialization').value;
            const gender = document.getElementById('set_gender').value;

            const payload = {
                name,
                mobile_number,
                email,
                license_number,
                address,
                city,
                state,
                pincode,
                open_from,
                closes_from,
                specialization,
                gender
            };

            fetch('/doctors/update-doctor-profile/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Profile settings updated successfully!");
                        isProfileComplete = true;
                        document.getElementById('profile-alert-container').style.display = 'none';
                        document.getElementById('greeting').textContent = `Welcome back, Dr. ${getDoctorGreetingName(name)}!`;
                        const licNoEl = document.getElementById('licenseNo');
                        if (licNoEl) {
                            licNoEl.textContent = license_number;
                        }

                        // Sync modal fields as well
                        document.getElementById('specializationInput').value = specialization;
                        document.getElementById('genderInput').value = gender;
                        document.getElementById('addressInput').value = address;
                        document.getElementById('cityInput').value = city;
                        document.getElementById('stateInput').value = state;
                        document.getElementById('pincodeInput').value = pincode;
                        document.getElementById('openFromInput').value = open_from;
                        document.getElementById('closesFromInput').value = closes_from;
                    } else {
                        alert("Error: " + data.error);
                    }
                })
                .catch(err => {
                    console.error('Error updating profile:', err);
                    alert('Failed to update profile settings.');
                });
        });
    }
});

// Global Patient State & Functions
let patientList = JSON.parse(localStorage.getItem('doctor_patients')) || [];

function savePatients() {
    localStorage.setItem('doctor_patients', JSON.stringify(patientList));
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function renderPatientsTable(list) {
    const tbody = document.getElementById('patientsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-secondary); padding: 20px;">No patients found matching your search.</td></tr>`;
        return;
    }

    list.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td><span class="badge ${p.gender === 'Female' ? 'badge-female' : 'badge-male'}">${p.gender}</span></td>
            <td>${p.age}</td>
            <td>${escapeHtml(p.reason)}</td>
            <td>${escapeHtml(p.treatment || 'N/A')}</td>
            <td>${escapeHtml(p.medicine || 'N/A')}</td>
            <td>${escapeHtml(p.city)}</td>
            <td>${escapeHtml(p.mobile_number || 'N/A')}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-action" onclick="openEditPatientModal(${p.id})" style="padding: 6px 12px; font-size: 11px; background-color: var(--color-info-glow); color: var(--color-info); border: 1px solid rgba(99, 102, 241, 0.25);">Edit</button>
                    <button class="btn-action" onclick="deletePatient(${p.id})" style="padding: 6px 12px; font-size: 11px; background-color: var(--color-danger-glow); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.25);">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterAndSortPatients() {
    const query = document.getElementById('patientSearchInput').value.toLowerCase().trim();
    const sortBy = document.getElementById('patientSortSelect').value;

    let filtered = patientList.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.reason.toLowerCase().includes(query) ||
        (p.treatment && p.treatment.toLowerCase().includes(query)) ||
        (p.medicine && p.medicine.toLowerCase().includes(query)) ||
        (p.mobile_number && p.mobile_number.includes(query))
    );

    filtered.sort((a, b) => {
        if (sortBy === 'asc') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'desc') {
            return b.name.localeCompare(a.name);
        } else {
            return a.id - b.id;
        }
    });

    renderPatientsTable(filtered);
}

function updateTotalPatientsCount() {
    const el = document.getElementById('totalPatientsCount');
    if (el) {
        el.textContent = patientList.length;
    }
}

function openAddPatientModal() {
    document.getElementById('patientModalTitle').textContent = "Add Patient Record";
    document.getElementById('patient_id_field').value = "";
    document.getElementById('patient_name_field').value = "";
    document.getElementById('patient_gender_field').value = "Male";
    document.getElementById('patient_age_field').value = "";
    document.getElementById('patient_city_field').value = "";
    document.getElementById('patient_reason_field').value = "";
    document.getElementById('patient_mobile_field').value = "";
    document.getElementById('patient_treatment_field').value = "";
    document.getElementById('patient_medicine_field').value = "";
    document.getElementById('patientModal').style.display = 'flex';
}

function openEditPatientModal(id) {
    const p = patientList.find(x => x.id === id);
    if (!p) return;
    document.getElementById('patientModalTitle').textContent = "Edit Patient Record";
    document.getElementById('patient_id_field').value = p.id;
    document.getElementById('patient_name_field').value = p.name;
    document.getElementById('patient_gender_field').value = p.gender || "Male";
    document.getElementById('patient_age_field').value = p.age;
    document.getElementById('patient_city_field').value = p.city;
    document.getElementById('patient_reason_field').value = p.reason;
    document.getElementById('patient_mobile_field').value = p.mobile_number || "";
    document.getElementById('patient_treatment_field').value = p.treatment || "";
    document.getElementById('patient_medicine_field').value = p.medicine || "";
    document.getElementById('patientModal').style.display = 'flex';
}

function closePatientModal() {
    document.getElementById('patientModal').style.display = 'none';
}

function deletePatient(id) {
    if (confirm("Are you sure you want to delete this patient record?")) {
        patientList = patientList.filter(x => x.id !== id);
        savePatients();
        filterAndSortPatients();
        updateTotalPatientsCount();
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateTotalPatientsCount();
    filterAndSortPatients();

    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('patient_id_field').value;
            const name = document.getElementById('patient_name_field').value.trim();
            const gender = document.getElementById('patient_gender_field').value;
            const age = parseInt(document.getElementById('patient_age_field').value);
            const city = document.getElementById('patient_city_field').value.trim();
            const reason = document.getElementById('patient_reason_field').value.trim();
            const mobile_number = document.getElementById('patient_mobile_field').value.trim();
            const treatment = document.getElementById('patient_treatment_field').value.trim();
            const medicine = document.getElementById('patient_medicine_field').value.trim();

            if (id) {
                const idx = patientList.findIndex(x => x.id === parseInt(id));
                if (idx !== -1) {
                    patientList[idx] = { id: parseInt(id), name, gender, age, reason, city, mobile_number, treatment, medicine };
                }
            } else {
                const nextId = patientList.length > 0 ? Math.max(...patientList.map(x => x.id)) + 1 : 1;
                patientList.push({ id: nextId, name, gender, age, reason, city, mobile_number, treatment, medicine });
            }

            savePatients();
            filterAndSortPatients();
            updateTotalPatientsCount();
            closePatientModal();
        });
    }
});

function handleLogout() {
    fetch('/api/accounts/logout/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/';
            }
        })
        .catch(err => console.error('Logout failed:', err));
}

function toggleChatWindow() {
    const win = document.getElementById('chatWindow');
    win.classList.toggle('open');
    if (win.classList.contains('open')) {
        loadChatHistory();
    }
}

function handleChatKeyPress(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
}

function loadChatHistory() {
    fetch('/api/accounts/helpdesk/my-tickets/')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.tickets) {
                const box = document.getElementById('chatMessages');
                let html = '<div class="chat-msg received">Hello! How can we help you today? Feel free to ask the administrator to add medicines, reports, or resolve account settings.</div>';

                data.tickets.forEach(ticket => {
                    let statusText = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
                    html += `
                        <div class="chat-msg sent">
                            ${escapeHTML(ticket.message)}
                            <div style="font-size: 9px; opacity: 0.75; text-align: right; margin-top: 4px; font-weight: 500;">
                                ● ${statusText}
                            </div>
                        </div>`;
                });
                box.innerHTML = html;
                box.scrollTop = box.scrollHeight;
            }
        })
        .catch(err => console.error('Error loading chat:', err));
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    fetch('/api/accounts/helpdesk/send/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ message: message })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                input.value = '';
                loadChatHistory();
                loadHelpdeskTickets();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => {
            console.error('Error sending message:', err);
            alert('Failed to send message.');
        });
}

// Helpers
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

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

function loadHelpdeskTickets() {
    fetch('/api/accounts/helpdesk/my-tickets/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const tickets = data.tickets || [];
                const total = tickets.length;
                const open = tickets.filter(t => t.status === 'requested' || t.status === 'open').length;
                const completed = tickets.filter(t => t.status === 'resolved').length;

                const totEl = document.getElementById('helpdesk_total_count');
                const openEl = document.getElementById('helpdesk_open_count');
                const compEl = document.getElementById('helpdesk_completed_count');
                if (totEl) totEl.textContent = total;
                if (openEl) openEl.textContent = open;
                if (compEl) compEl.textContent = completed;

                const overviewHelpdeskEl = document.getElementById('overviewHelpdeskTicketsCount');
                if (overviewHelpdeskEl) overviewHelpdeskEl.textContent = total;

                const bodies = [
                    document.getElementById('helpdesk_tickets_tbody'),
                    document.getElementById('helpdesk_tickets_tbody_today')
                ];

                bodies.forEach(tbody => {
                    if (!tbody) return;

                    if (tickets.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="4" style="padding: 40px; text-align: center; color: var(--text-secondary);"><svg width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 8px;"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg><br>No tickets yet. Click <b>New Ticket</b> or use the floating chat to create one.</td></tr>';
                        return;
                    }

                    tbody.innerHTML = tickets.map(t => {
                        let statusColor, statusBg, statusLabel;
                        if (t.status === 'resolved') {
                            statusColor = '#10b981'; statusBg = 'rgba(16,185,129,0.1)'; statusLabel = 'Completed';
                        } else if (t.status === 'open') {
                            statusColor = '#f59e0b'; statusBg = 'rgba(245,158,11,0.1)'; statusLabel = 'Open';
                        } else if (t.status === 'rejected') {
                            statusColor = '#ef4444'; statusBg = 'rgba(239,68,68,0.1)'; statusLabel = 'Rejected';
                        } else if (t.status === 'deleted') {
                            statusColor = '#64748b'; statusBg = 'rgba(100,116,139,0.1)'; statusLabel = 'Deleted';
                        } else {
                            statusColor = '#6366f1'; statusBg = 'rgba(99,102,241,0.1)'; statusLabel = 'Requested';
                        }
                        const msgTruncated = t.message.length > 80 ? t.message.substring(0, 80) + '...' : t.message;
                        return `
                            <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;">
                                <td style="padding: 14px 16px; font-weight: 700; color: var(--text-primary); white-space: nowrap;">${t.ticket_code}</td>
                                <td style="padding: 14px 16px; color: var(--text-secondary); max-width: 300px;">${escapeHTML(t.message)}</td>
                                <td style="padding: 14px 16px; text-align: center;">
                                    <span style="background: ${statusBg}; color: ${statusColor}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">${statusLabel}</span>
                                </td>
                                <td style="padding: 14px 16px; text-align: center;">
                                    ${t.status === 'requested' || !t.status ? `
                                        <button onclick="deleteHelpdeskTicket(${t.id})" style="background: rgba(239,68,68,0.1); color: #ef4444; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s ease;" onmouseover="this.style.background='#ef4444';this.style.color='white';" onmouseout="this.style.background='rgba(239,68,68,0.1)';this.style.color='#ef4444';">
                                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 2px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                            Delete
                                        </button>
                                    ` : `
                                        <button style="background: #f1f5f9; color: #94a3b8; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 700; cursor: not-allowed; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #e2e8f0;" disabled>
                                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="opacity: 0.5;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                            Delete
                                        </button>
                                    `}
                                </td>
                            </tr>
                        `;
                    }).join('');
                });
            }
        })
        .catch(err => console.error("Error loading helpdesk tickets:", err));
}

function deleteHelpdeskTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    fetch('/api/accounts/helpdesk/delete/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ ticket_id: ticketId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadHelpdeskTickets();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => {
            console.error('Failed to delete ticket:', err);
            alert('Failed to delete ticket.');
        });
}

let doctorAppointments = [];

function loadDoctorAppointments(query = '') {
    const url = query ? `/doctors/api/appointments/list/?search=${encodeURIComponent(query)}` : '/doctors/api/appointments/list/';
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                doctorAppointments = data.appointments || [];
                renderDoctorAppointmentsList();
                updateOverviewStats();
            } else {
                console.error("Failed to load appointments:", data.error);
            }
        })
        .catch(err => console.error("Error loading appointments:", err));
}

function getStatusBadgeHTML(status) {
    if (status === 'Completed') {
        return `<span class="status-badge status-active" style="font-size: 11px; padding: 4px 8px; border-radius: 6px;">Completed</span>`;
    } else if (status === 'Accepted') {
        return `<span class="status-badge" style="font-size: 11px; padding: 4px 8px; border-radius: 6px; background-color: rgba(59, 130, 246, 0.1); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.3);">Accepted</span>`;
    } else if (status === 'Cancelled') {
        return `<span class="status-badge" style="font-size: 11px; padding: 4px 8px; border-radius: 6px; background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);">Cancelled</span>`;
    } else {
        return `<span class="status-badge status-pending" style="font-size: 11px; padding: 4px 8px; border-radius: 6px;">Booked</span>`;
    }
}

function getActionButtonHTML(a) {
    if (a.status === 'Completed') {
        return `<span style="color: var(--text-muted); font-size: 12px; font-weight: 600;">Concluded</span>`;
    } else if (a.status === 'Accepted') {
        return `<button onclick="markAppointmentCompleted(${a.id})" class="btn-action" style="background-color: var(--color-success-glow); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.25);">Complete</button>`;
    } else if (a.status === 'Cancelled') {
        return `<span style="color: #ef4444; font-size: 12px; font-weight: 600;">Cancelled</span>`;
    } else {
        return `<button onclick="acceptAppointment(${a.id})" class="btn-action" style="background-color: rgba(59, 130, 246, 0.08); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.25);">Accept</button>`;
    }
}

function renderDoctorAppointmentsList() {
    const tbodyAll = document.getElementById('appointments-tbody');
    const tbodyToday = document.getElementById('appointments-tbody-today');

    // Get today's date formatted as YYYY-MM-DD in local time
    const todayObj = new Date();
    const year = todayObj.getFullYear();
    const month = String(todayObj.getMonth() + 1).padStart(2, '0');
    const day = String(todayObj.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Render All Appointments
    if (tbodyAll) {
        if (doctorAppointments.length === 0) {
            tbodyAll.innerHTML = '<tr><td colspan="9" style="padding: 20px; text-align: center; color: var(--text-secondary);">No appointments found.</td></tr>';
        } else {
            tbodyAll.innerHTML = doctorAppointments.map(a => {
                return `
                    <tr>
                        <td style="padding: 12px 16px;"><strong>${a.id}</strong></td>
                        <td style="padding: 12px 16px;"><strong>${escapeHTML(a.patient_name)}</strong></td>
                        <td style="padding: 12px 16px;"><span class="badge ${a.patient_gender === 'Female' ? 'badge-female' : 'badge-male'}">${escapeHTML(a.patient_gender)}</span></td>
                        <td style="padding: 12px 16px;">${a.patient_age || ''}</td>
                        <td style="padding: 12px 16px;">${escapeHTML(a.reason)}</td>
                        <td style="padding: 12px 16px;">${escapeHTML(a.patient_mobile)}</td>
                        <td style="padding: 12px 16px;">${escapeHTML(a.appointment_date)} ${escapeHTML(a.appointment_time)}</td>
                        <td style="padding: 12px 16px; text-align: center;">
                            ${getStatusBadgeHTML(a.status)}
                        </td>
                        <td style="padding: 12px 16px; text-align: center;">
                            ${getActionButtonHTML(a)}
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Render Today's Appointments
    if (tbodyToday) {
        const todayAppts = doctorAppointments.filter(a => a.appointment_date === todayStr);
        if (todayAppts.length === 0) {
            tbodyToday.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--text-secondary);">No appointments scheduled for today.</td></tr>';
        } else {
            tbodyToday.innerHTML = todayAppts.map(a => {
                return `
                    <tr>
                        <td style="padding: 12px 16px;"><strong>${escapeHTML(a.patient_name)}</strong></td>
                        <td style="padding: 12px 16px;">${escapeHTML(a.reason)}</td>
                        <td style="padding: 12px 16px;">${escapeHTML(a.appointment_time)}</td>
                        <td style="padding: 12px 16px;">${getActionButtonHTML(a)}</td>
                    </tr>
                `;
            }).join('');
        }
    }
}

function acceptAppointment(apptId) {
    if (!confirm("Are you sure you want to Accept this appointment?")) return;

    fetch(`/doctors/api/appointments/accept/${apptId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Appointment Accepted successfully!");
                loadDoctorAppointments();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => {
            console.error("Error accepting appointment:", err);
            alert("Failed to accept appointment.");
        });
}

function markAppointmentCompleted(apptId) {
    if (!confirm("Are you sure you want to mark this appointment as Completed?")) return;

    fetch(`/doctors/api/appointments/complete/${apptId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Appointment marked as Completed successfully!");
                loadDoctorAppointments();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => {
            console.error("Error completing appointment:", err);
            alert("Failed to complete appointment.");
        });
}

function filterDoctorAppointments() {
    const query = document.getElementById('appointmentSearchInput').value.trim();
    loadDoctorAppointments(query);
}

function updateOverviewStats() {
    const todayObj = new Date();
    const year = todayObj.getFullYear();
    const month = String(todayObj.getMonth() + 1).padStart(2, '0');
    const day = String(todayObj.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const totalApptsCount = doctorAppointments.length;
    const todayApptsCount = doctorAppointments.filter(a => a.appointment_date === todayStr).length;

    // Unique patient IDs/Names from the appointment list
    const uniquePatientIds = new Set(doctorAppointments.map(a => a.patient_id));
    const uniquePatientsCount = uniquePatientIds.size;

    // Let's update the card values:
    const elTotalPatients = document.getElementById('totalPatientsCount');
    if (elTotalPatients) elTotalPatients.textContent = uniquePatientsCount;

    const elTodayAppts = document.getElementById('todayAppointmentsCount');
    if (elTodayAppts) elTodayAppts.textContent = todayApptsCount;

    const elTotalAppts = document.getElementById('totalAppointmentsCountCard');
    if (elTotalAppts) elTotalAppts.textContent = totalApptsCount;

    // Count pending vs completed based on status field
    let completedCount = doctorAppointments.filter(a => a.status === 'Completed').length;
    let pendingCount = doctorAppointments.filter(a => a.status === 'Booked' || !a.status).length;

    const elPending = document.getElementById('pendingAppointmentsCount');
    if (elPending) elPending.textContent = pendingCount;

    const elCompleted = document.getElementById('completedAppointmentsCount');
    if (elCompleted) elCompleted.textContent = completedCount;
}

function markAppointmentCompleted(apptId) {
    if (!confirm("Are you sure you want to mark this appointment as Completed?")) return;

    fetch(`/doctors/api/appointments/complete/${apptId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Appointment marked as Completed successfully!");
                loadDoctorAppointments();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => {
            console.error("Error completing appointment:", err);
            alert("Failed to complete appointment.");
        });
}

function convertTo12Hour(timeStr) {
    if (!timeStr) return '';
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
}

function parse12HourTo24(time12h) {
    if (!time12h) return '';
    let [time, modifier] = time12h.trim().split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (hours === 12) {
        hours = 0;
    }
    if (modifier === 'PM') {
        hours = hours + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function openSetAppointmentTimeModal() {
    const modal = document.getElementById('appointmentTimeModal');
    if (modal) {
        modal.style.display = 'flex';
        const fromTimeEl = document.getElementById('appt_from_time_input');
        const toTimeEl = document.getElementById('appt_to_time_input');
        if (fromTimeEl) {
            fromTimeEl.value = localStorage.getItem('doctor_appt_from') || '';
        }
        if (toTimeEl) {
            toTimeEl.value = localStorage.getItem('doctor_appt_to') || '';
        }
    }
}

function closeSetAppointmentTimeModal() {
    const modal = document.getElementById('appointmentTimeModal');
    if (modal) modal.style.display = 'none';
}

function checkAndResetAppointmentTime() {
    const savedTime = localStorage.getItem('doctor_appt_slot_time');
    const displayContainer = document.getElementById('appointment-time-display');
    const displaySpan = document.getElementById('saved-appointment-time');

    if (savedTime) {
        const timeElapsed = Date.now() - parseInt(savedTime);
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (timeElapsed >= twentyFourHours) {
            localStorage.removeItem('doctor_appt_slot');
            localStorage.removeItem('doctor_appt_from');
            localStorage.removeItem('doctor_appt_to');
            localStorage.removeItem('doctor_appt_slot_time');
            if (displayContainer) displayContainer.style.display = 'none';

            fetch('/doctors/api/appointment-slot/update/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ slot: '' })
            }).catch(e => console.error("Error resetting server slot:", e));
        } else {
            const savedSlot = localStorage.getItem('doctor_appt_slot');
            if (displayContainer && displaySpan && savedSlot) {
                displaySpan.textContent = savedSlot;
                displayContainer.style.display = 'block';
            }
        }
    } else {
        if (displayContainer) displayContainer.style.display = 'none';
    }
}

function initAppointmentSettings() {
    checkAndResetAppointmentTime();
    setInterval(checkAndResetAppointmentTime, 60000);

    const form = document.getElementById('appointmentTimeForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const fromTimeEl = document.getElementById('appt_from_time_input');
            const toTimeEl = document.getElementById('appt_to_time_input');
            const openFromEl = document.getElementById('set_open_from');
            const closesFromEl = document.getElementById('set_closes_from');

            if (!fromTimeEl || !toTimeEl) return;

            const fromTime = fromTimeEl.value;
            const toTime = toTimeEl.value;

            const openFrom = openFromEl ? openFromEl.value : '';
            const closesFrom = closesFromEl ? closesFromEl.value : '';

            if (!openFrom || !closesFrom) {
                alert("Please complete and save your profile availability hours (Open From / Closes From) first!");
                return;
            }

            if (fromTime < openFrom) {
                alert(`Selected Start Time (${convertTo12Hour(fromTime)}) cannot be earlier than your profile opening time (${convertTo12Hour(openFrom)})!`);
                return;
            }

            if (toTime > closesFrom) {
                alert(`Selected End Time (${convertTo12Hour(toTime)}) cannot be later than your profile closing time (${convertTo12Hour(closesFrom)})!`);
                return;
            }

            if (toTime <= fromTime) {
                alert("End Time must be later than the Start Time!");
                return;
            }

            const slotValue = `${convertTo12Hour(fromTime)} - ${convertTo12Hour(toTime)}`;

            fetch('/doctors/api/appointment-slot/update/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ slot: slotValue })
            })
                .then(res => res.json())
                .then(apiData => {
                    if (apiData.success) {
                        localStorage.setItem('doctor_appt_from', fromTime);
                        localStorage.setItem('doctor_appt_to', toTime);
                        localStorage.setItem('doctor_appt_slot', slotValue);
                        localStorage.setItem('doctor_appt_slot_time', Date.now().toString());

                        checkAndResetAppointmentTime();
                        closeSetAppointmentTimeModal();
                        alert('Appointment availability slot saved successfully!');
                    } else {
                        alert('Error saving slot: ' + apiData.error);
                    }
                })
                .catch(err => {
                    console.error("Error saving slot to server:", err);
                    alert("Failed to save slot to server.");
                });
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initAppointmentSettings);
} else {
    initAppointmentSettings();
}

