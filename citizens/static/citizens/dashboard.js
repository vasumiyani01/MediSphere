let isProfileComplete = false;
let allMedicines = [];
let allDiseases = [];
let citizenAppointments = JSON.parse(localStorage.getItem('citizen_appointments')) || [
    { id: 1, provider: "Dr. Jessica Miller", specialty: "Cardiologist", schedule: "2026-07-25T10:00", status: "Active" },
    { id: 2, provider: "Metro Diagnostics", specialty: "Blood Scan", schedule: "2026-07-28T08:30", status: "Pending" }
];
let citizenOrders = JSON.parse(localStorage.getItem('citizen_orders')) || [
    { id: 1, medicine: "Metformin 500mg", qty: 2, price: 150, date: "2026-07-20", status: "Delivered" },
    { id: 2, medicine: "Amoxicillin 250mg", qty: 1, price: 90, date: "2026-07-24", status: "Dispatched" }
];
let citizenCart = JSON.parse(localStorage.getItem('citizen_cart')) || [];

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

    // Load tab-specific data
    if (tabId === 'medicines') loadMedicines();
    if (tabId === 'diseases') loadDiseases();
    if (tabId === 'bookings') renderAppointments();
    if (tabId === 'orders') renderOrders();
    if (tabId === 'records') renderHistory();
    if (tabId === 'cart') renderCart();
}

document.addEventListener("DOMContentLoaded", function () {
    // Tab switching router
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1) || 'overview';
        const validTabs = ['overview', 'medicines', 'diseases', 'reports', 'bookings', 'cart', 'orders', 'records', 'profile'];
        if (validTabs.includes(hash)) {
            if (isProfileComplete || hash === 'overview') {
                switchTab(hash);
            } else {
                window.location.hash = '#overview';
                switchTab('overview');
            }
        }
    };
    window.addEventListener('hashchange', handleHashChange);

    const qtyInput = document.getElementById('order-qty');
    if (qtyInput) {
        qtyInput.addEventListener('input', updatePopupTotalPrice);
    }

    // Fetch user data on load
    fetch('/api/accounts/user-status/')
        .then(res => res.json())
        .then(data => {
            if (!data.logged_in) {
                window.location.href = '/';
            } else {
                document.getElementById('greeting').textContent = `Welcome back, ${data.user.name}!`;

                const user = data.user;
                isProfileComplete = !!(user.address && user.city && user.state && user.pincode && user.age && user.gender);

                // Populate Profile settings form
                document.getElementById('set_name').value = user.name || '';
                document.getElementById('set_mobile').value = user.mobile_number || '';
                document.getElementById('set_email').value = user.email || '';
                document.getElementById('set_age').value = user.age || '';
                document.getElementById('set_gender').value = user.gender || 'Male';
                document.getElementById('set_address').value = user.address || '';
                document.getElementById('set_city').value = user.city || '';
                document.getElementById('set_state').value = user.state || '';
                document.getElementById('set_pincode').value = user.pincode || '';

                if (!isProfileComplete) {
                    document.getElementById('profile-alert-container').style.display = 'block';
                    document.getElementById('closeModalBtn').style.display = 'none';
                    openProfileModal();
                } else {
                    document.getElementById('profile-alert-container').style.display = 'none';
                    document.getElementById('closeModalBtn').style.display = 'block';

                    // Populate modal inputs
                    document.getElementById('addressInput').value = user.address || '';
                    document.getElementById('cityInput').value = user.city || '';
                    document.getElementById('stateInput').value = user.state || '';
                    document.getElementById('pincodeInput').value = user.pincode || '';
                    document.getElementById('ageInput').value = user.age || '';
                    document.getElementById('genderInput').value = user.gender || '';
                }

                // Trigger tab render based on current hash
                handleHashChange();
                updateOverviewCounts();
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

            const address = document.getElementById('addressInput').value.trim();
            const city = document.getElementById('cityInput').value.trim();
            const state = document.getElementById('stateInput').value.trim();
            const pincode = document.getElementById('pincodeInput').value.trim();
            const age = document.getElementById('ageInput').value;
            const gender = document.getElementById('genderInput').value;

            const payload = {
                name,
                mobile_number,
                email,
                address,
                city,
                state,
                pincode,
                age,
                gender
            };

            fetch('/citizens/update-citizen-profile/', {
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

                        // Sync settings form as well
                        document.getElementById('set_address').value = address;
                        document.getElementById('set_city').value = city;
                        document.getElementById('set_state').value = state;
                        document.getElementById('set_pincode').value = pincode;
                        document.getElementById('set_age').value = age;
                        document.getElementById('set_gender').value = gender;
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
            const address = document.getElementById('set_address').value.trim();
            const city = document.getElementById('set_city').value.trim();
            const state = document.getElementById('set_state').value.trim();
            const pincode = document.getElementById('set_pincode').value.trim();
            const age = document.getElementById('set_age').value;
            const gender = document.getElementById('set_gender').value;

            const payload = {
                name,
                mobile_number,
                email,
                address,
                city,
                state,
                pincode,
                age,
                gender
            };

            fetch('/citizens/update-citizen-profile/', {
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

                        // Sync modal fields as well
                        document.getElementById('addressInput').value = address;
                        document.getElementById('cityInput').value = city;
                        document.getElementById('stateInput').value = state;
                        document.getElementById('pincodeInput').value = pincode;
                        document.getElementById('ageInput').value = age;
                        document.getElementById('genderInput').value = gender;
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

// ============ OVERVIEW UPDATES ============
function updateOverviewCounts() {
    const apptsCount = citizenAppointments.length;
    const ordersCount = citizenOrders.length;
    const reportsCount = 4;
    const historyCount = apptsCount + ordersCount;

    const elAppts = document.getElementById('count-appointments-total');
    const elOrders = document.getElementById('count-orders-total');
    const elReports = document.getElementById('count-reports');
    const elHistory = document.getElementById('count-history-total');

    if (elAppts) elAppts.textContent = apptsCount;
    if (elOrders) elOrders.textContent = ordersCount;
    if (elReports) elReports.textContent = reportsCount;
    if (elHistory) elHistory.textContent = historyCount;

    // Fetch medicines count if empty, otherwise update UI
    const elMed = document.getElementById('count-medicines');
    if (elMed) {
        if (allMedicines.length > 0) {
            elMed.textContent = allMedicines.length;
        } else {
            fetch('/citizens/api/medicines/')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        allMedicines = data.medicines || [];
                        elMed.textContent = allMedicines.length;
                    }
                })
                .catch(err => console.error("Error fetching medicines count:", err));
        }
    }

    // Fetch diseases count if empty, otherwise update UI
    const elDis = document.getElementById('count-diseases');
    if (elDis) {
        if (allDiseases.length > 0) {
            elDis.textContent = allDiseases.length;
        } else {
            fetch('/citizens/api/diseases/')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        allDiseases = data.diseases || [];
                        elDis.textContent = allDiseases.length;
                    }
                })
                .catch(err => console.error("Error fetching diseases count:", err));
        }
    }
}


// ============ MEDICINES TAB ============
function loadMedicines() {
    const container = document.getElementById('medicines-container');
    if (!container) return;

    if (allMedicines.length > 0) {
        renderMedicines(allMedicines);
        return;
    }

    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Loading medicines...</p>';
    fetch('/citizens/api/medicines/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                allMedicines = data.medicines || [];
                // Show pincode filter info banner
                const infoEl = document.getElementById('medicines-pincode-info');
                if (infoEl) {
                    if (data.pincode && data.pharmacy_count > 0) {
                        infoEl.innerHTML = `<span style="font-size: 13px;">📍 Showing medicines available from <strong>${data.pharmacy_count}</strong> pharmacy(s) near pincode <strong>${data.pincode}</strong></span>`;
                        infoEl.style.display = 'block';
                    } else if (data.pincode && data.pharmacy_count === 0) {
                        infoEl.innerHTML = `<span style="font-size: 13px;">⚠️ No pharmacies found near pincode <strong>${data.pincode}</strong>. Update your profile pincode to see medicines.</span>`;
                        infoEl.style.display = 'block';
                    } else {
                        infoEl.innerHTML = `<span style="font-size: 13px;">ℹ️ Complete your profile with a pincode to see medicines from nearby pharmacies.</span>`;
                        infoEl.style.display = 'block';
                    }
                }
                renderMedicines(allMedicines);
            } else {
                container.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 40px;">Failed to load medicines.</p>';
            }
        })
        .catch(err => {
            console.error('Error fetching medicines:', err);
            container.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 40px;">Failed to load medicines.</p>';
        });
}

function renderMedicines(list) {
    const container = document.getElementById('medicines-container');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px; grid-column: 1/-1;">No medicines match your search.</p>';
        return;
    }

    container.innerHTML = list.map(m => {
        const displayPrice = m.price || 0;
        const fallbackImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80';
        const imgUrl = m.image_url && m.image_url.trim() !== '' ? m.image_url : fallbackImage;
        const stockLabel = m.total_stock > 0 ? `In Stock (${m.total_stock})` : 'Out of Stock';
        const stockColor = m.total_stock > 0 ? '#22c55e' : '#ef4444';
        return `
        <div class="card" style="display: flex; flex-direction: column; gap: 0; transition: transform 0.2s ease; overflow: hidden; padding: 0; height: 100%;">
            <div style="width: 100%; height: 200px; overflow: hidden; background-color: var(--bg-tertiary); position: relative; border-bottom: 1px solid var(--border-color);">
                <img src="${imgUrl}" alt="${m.name}" style="width: 100%; height: 100%; object-fit: cover;">
                <span class="status-badge status-active" style="position: absolute; top: 12px; right: 12px; font-size: 10px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">${m.category}</span>
            </div>
            <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px; flex-grow: 1;">
                <div>
                    <h3 style="font-family: var(--font-display); font-weight: 700; font-size: 16px; color: var(--text-primary); margin: 0;">${m.name}</h3>
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; display: block; margin-top: 2px;">${m.manufacturer}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <p style="font-size: 12px; color: var(--text-muted); margin: 0;"><strong>Pack Size:</strong> ${m.pack_size}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <p style="font-size: 13px; color: var(--color-primary); font-weight: 700; margin: 0;">Price: ₹${displayPrice}</p>
                        <span style="font-size: 11px; color: ${stockColor}; font-weight: 600;">${stockLabel}</span>
                    </div>
                    ${m.pharmacy_names ? `<p style="font-size: 11px; color: var(--text-muted); margin: 0;">🏪 ${m.pharmacy_names}</p>` : ''}
                    <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin: 0;"><strong style="color: var(--text-primary);">Uses:</strong> ${m.uses.length > 70 ? m.uses.substring(0, 70) + '...' : m.uses}</p>
                </div>
                <div style="display: flex; gap: 8px; margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 12px;">
                    <button onclick="viewMedicineDetails(${m.id})" class="btn-action" style="flex: 1; text-align: center; padding: 8px; border: 1px solid var(--color-primary); background: transparent; color: var(--color-primary);">View Details</button>
                    <button onclick="openOrderModal(${m.id})" class="btn-primary" style="flex: 1.5; font-size: 12px; padding: 8px 12px; border-radius: 6px; box-shadow: none;">Add to Cart</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function filterMedicines() {
    const query = document.getElementById('search-medicine-input').value.toLowerCase();
    const cat = document.getElementById('filter-medicine-cat').value;

    let filtered = allMedicines.filter(m => {
        const matchesQuery = m.name.toLowerCase().includes(query) || m.manufacturer.toLowerCase().includes(query) || m.uses.toLowerCase().includes(query);
        const matchesCat = cat === 'all' || m.category === cat;
        return matchesQuery && matchesCat;
    });

    renderMedicines(filtered);
}

function viewMedicineDetails(id) {
    const m = allMedicines.find(x => x.id === id);
    if (!m) return;

    const fallbackImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80';
    const imgUrl = m.image_url && m.image_url.trim() !== '' ? m.image_url : fallbackImage;

    document.getElementById('med-detail-image').src = imgUrl;
    document.getElementById('med-detail-name').textContent = m.name;
    document.getElementById('med-detail-manufacturer').textContent = m.manufacturer;
    document.getElementById('med-detail-category').textContent = m.category;
    document.getElementById('med-detail-pack').textContent = m.pack_size;
    document.getElementById('med-detail-uses').textContent = m.uses;
    document.getElementById('med-detail-sideeffects').textContent = m.side_effects || 'None reported';

    // Price
    const priceEl = document.getElementById('med-detail-price');
    priceEl.textContent = m.price ? `₹${m.price}` : '₹0';

    // Stock
    const stockEl = document.getElementById('med-detail-stock');
    const totalStock = m.total_stock || 0;
    stockEl.textContent = totalStock;
    stockEl.style.color = totalStock > 0 ? '#22c55e' : '#ef4444';

    // Seller / Pharmacy info
    const sellerEl = document.getElementById('med-detail-seller');
    if (m.pharmacy_names && m.pharmacy_names.trim() !== '') {
        const pharmacies = m.pharmacy_names.split(',').map(p => p.trim());
        sellerEl.innerHTML = pharmacies.map(p =>
            `<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                <span style="font-size: 16px;">🏪</span>
                <span style="font-weight: 600; color: var(--text-primary);">${p}</span>
                <span class="status-badge status-active" style="font-size: 9px; margin-left: auto;">In Stock</span>
            </div>`
        ).join('');
    } else {
        sellerEl.innerHTML = '<span style="color: var(--text-muted);">No seller information available</span>';
    }

    document.getElementById('medDetailModal').style.display = 'flex';
}

function closeMedDetailModal() {
    document.getElementById('medDetailModal').style.display = 'none';
}

// ============ DISEASES TAB ============
function loadDiseases() {
    const container = document.getElementById('diseases-container');
    if (!container) return;

    if (allDiseases.length > 0) {
        renderDiseases(allDiseases);
        return;
    }

    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Loading classified diseases...</p>';
    fetch('/citizens/api/diseases/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                allDiseases = data.diseases || [];
                renderDiseases(allDiseases);
            } else {
                container.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 40px;">Failed to load diseases.</p>';
            }
        })
        .catch(err => {
            console.error('Error fetching diseases:', err);
            container.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 40px;">Failed to load diseases.</p>';
        });
}

function renderDiseases(list) {
    const container = document.getElementById('diseases-container');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px; grid-column: 1/-1;">No diseases match your search.</p>';
        return;
    }

    container.innerHTML = list.map(d => `
        <div class="card" style="display: flex; flex-direction: column; gap: 12px; transition: transform 0.2s ease;">
            <div>
                <h3 style="font-family: var(--font-display); font-weight: 700; font-size: 16px; color: var(--text-primary);">${d.name}</h3>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; margin-top: 6px;">${d.description.length > 120 ? d.description.substring(0, 120) + '...' : d.description}</p>
            </div>
            <div style="flex-grow: 1; border-top: 1px dashed var(--border-color); padding-top: 10px; margin-top: 6px;">
                <p style="font-size: 12px; color: var(--text-secondary);"><strong style="color: var(--text-primary);">Symptoms:</strong> ${d.symptoms.length > 70 ? d.symptoms.substring(0, 70) + '...' : d.symptoms}</p>
            </div>
            <button onclick="viewDiseaseDetails(${d.id})" class="btn-action" style="margin-top: 10px; text-align: center; padding: 8px; border: 1px solid var(--color-primary); background: transparent; color: var(--color-primary); width: 100%;">View Complete Profile</button>
        </div>
    `).join('');
}

function filterDiseases() {
    const query = document.getElementById('search-disease-input').value.toLowerCase();

    let filtered = allDiseases.filter(d => {
        return d.name.toLowerCase().includes(query) || d.description.toLowerCase().includes(query) || d.symptoms.toLowerCase().includes(query);
    });

    renderDiseases(filtered);
}

function viewDiseaseDetails(id) {
    const d = allDiseases.find(x => x.id === id);
    if (!d) return;

    document.getElementById('dis-detail-name').textContent = d.name;
    document.getElementById('dis-detail-desc').textContent = d.description || 'N/A';
    document.getElementById('dis-detail-causes').textContent = d.causes || 'N/A';
    document.getElementById('dis-detail-symptoms').textContent = d.symptoms || 'N/A';
    document.getElementById('dis-detail-risk').textContent = d.risk_factors || 'N/A';
    document.getElementById('dis-detail-complications').textContent = d.complications || 'N/A';
    document.getElementById('dis-detail-treatment').textContent = d.treatment || 'N/A';
    document.getElementById('dis-detail-medicine').textContent = d.medicine || 'N/A';

    document.getElementById('diseaseDetailModal').style.display = 'flex';
}

function closeDiseaseDetailModal() {
    document.getElementById('diseaseDetailModal').style.display = 'none';
}

// ============ BOOKINGS TAB (APPOINTMENTS) ============
function renderAppointments() {
    const tbody = document.getElementById('appointments-tbody');
    if (!tbody) return;

    if (citizenAppointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 30px; text-align: center; color: var(--text-secondary);">No appointments found. Use the form below to book one!</td></tr>';
        return;
    }

    tbody.innerHTML = citizenAppointments.map(a => {
        let badgeClass = 'status-active';
        if (a.status === 'Pending') badgeClass = 'status-pending';
        if (a.status === 'Cancelled') badgeClass = 'status-pending';

        const dateFormatted = a.schedule.replace('T', ' ');

        return `
            <tr>
                <td style="padding: 12px 16px;"><strong>${a.provider}</strong></td>
                <td style="padding: 12px 16px;">${a.specialty}</td>
                <td style="padding: 12px 16px;">${dateFormatted}</td>
                <td style="padding: 12px 16px;"><span class="status-badge ${badgeClass}">${a.status}</span></td>
                <td style="padding: 12px 16px; text-align: center;">
                    ${a.status !== 'Cancelled' ? `<button onclick="cancelAppointment(${a.id})" class="btn-action" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444;">Cancel</button>` : `<span style="color: var(--text-muted); font-size: 11px;">N/A</span>`}
                </td>
            </tr>
        `;
    }).join('');
}

function bookAppointment(e) {
    e.preventDefault();
    const provider = document.getElementById('appt-doctor').value;
    const specialty = document.getElementById('appt-specialty').value;
    const schedule = document.getElementById('appt-time').value;

    if (!provider || !specialty || !schedule) {
        alert("Please fill in all appointment fields!");
        return;
    }

    const nextId = citizenAppointments.length > 0 ? Math.max(...citizenAppointments.map(x => x.id)) + 1 : 1;
    citizenAppointments.push({ id: nextId, provider, specialty, schedule, status: "Pending" });

    localStorage.setItem('citizen_appointments', JSON.stringify(citizenAppointments));
    renderAppointments();
    updateOverviewCounts();
    e.target.reset();
    alert("Appointment request submitted successfully!");
}

function cancelAppointment(id) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    const idx = citizenAppointments.findIndex(x => x.id === id);
    if (idx !== -1) {
        citizenAppointments[idx].status = 'Cancelled';
        localStorage.setItem('citizen_appointments', JSON.stringify(citizenAppointments));
        renderAppointments();
        updateOverviewCounts();
    }
}

// ============ ORDERS TAB ============
let currentPopupBasePrice = 75;

function updatePopupTotalPrice() {
    const qtyInput = document.getElementById('order-qty');
    const totalEl = document.getElementById('order-popup-total-price');
    if (qtyInput && totalEl) {
        const qty = parseInt(qtyInput.value) || 1;
        totalEl.textContent = `₹${qty * currentPopupBasePrice}`;
    }
}

function openOrderModal(medId) {
    const m = allMedicines.find(x => x.id === medId);
    if (!m) return;

    currentPopupBasePrice = m.price || 0;

    document.getElementById('order-med-id').value = m.id;
    document.getElementById('order-med-name').textContent = m.name;
    document.getElementById('order-med-manufacturer').textContent = m.manufacturer;
    document.getElementById('order-qty').value = 1;
    document.getElementById('order-type').value = 'Normal';
    updatePopupTotalPrice();
    document.getElementById('orderModal').style.display = 'flex';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function submitOrder(e) {
    e.preventDefault();
    const medId = parseInt(document.getElementById('order-med-id').value);
    const qty = parseInt(document.getElementById('order-qty').value);
    const orderType = document.getElementById('order-type').value;

    const m = allMedicines.find(x => x.id === medId);
    if (!m) return;

    const basePrice = m.price || 0;
    const totalPrice = basePrice * qty;

    // Check if item already in cart with same orderType
    const existingItemIdx = citizenCart.findIndex(item => item.medicineId === medId && item.orderType === orderType);
    if (existingItemIdx !== -1) {
        citizenCart[existingItemIdx].qty += qty;
        citizenCart[existingItemIdx].price = basePrice * citizenCart[existingItemIdx].qty;
    } else {
        const pIds = m.pharmacy_ids ? m.pharmacy_ids.split(',') : [];
        const pharmacyId = pIds.length > 0 ? parseInt(pIds[0]) : null;

        citizenCart.push({
            medicineId: m.id,
            medicine: m.name,
            manufacturer: m.manufacturer,
            qty: qty,
            price: totalPrice,
            basePrice: basePrice,
            orderType: orderType,
            pharmacyId: pharmacyId
        });
    }

    localStorage.setItem('citizen_cart', JSON.stringify(citizenCart));
    closeOrderModal();
    alert(`${qty}x ${m.name} (${orderType}) added to cart!`);

    // Switch to cart page
    window.location.hash = '#cart';
    switchTab('cart');
}

function renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="padding: 30px; text-align: center; color: var(--text-secondary);">⏳ Loading orders...</td></tr>';

    fetch('/pharmacies/orders/user/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const orders = data.orders || [];
                if (orders.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="padding: 30px; text-align: center; color: var(--text-secondary);">No medicine orders found. Navigate to Medicines to place an order!</td></tr>';
                    return;
                }

                tbody.innerHTML = orders.map(o => {
                    let badgeClass = 'status-pending';
                    if (o.status.toLowerCase() === 'delivered') badgeClass = 'status-active';
                    if (o.status.toLowerCase() === 'cancelled') badgeClass = 'status-pending';
                    
                    const itemsText = o.items.map(item => `${item.medicine_name} x${item.quantity}`).join(', ');

                    return `
                        <tr>
                            <td style="padding: 12px 16px;"><strong>${escapeHTML(o.order_id)}</strong></td>
                            <td style="padding: 12px 16px;">
                                <div><strong>${escapeHTML(itemsText)}</strong></div>
                                <div style="margin-top: 4px;"><span class="status-badge ${o.order_type.toLowerCase() === 'urgent' ? 'status-pending' : 'status-active'}" style="font-size: 9px; padding: 2px 6px;">${escapeHTML(o.order_type.charAt(0).toUpperCase() + o.order_type.slice(1))}</span></div>
                            </td>
                            <td style="padding: 12px 16px; text-align: center;">${o.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                            <td style="padding: 12px 16px;">₹${o.total_price.toFixed(2)}</td>
                            <td style="padding: 12px 16px;">${escapeHTML(o.created_at)}</td>
                            <td style="padding: 12px 16px;"><span class="status-badge ${badgeClass}">${escapeHTML(o.status.charAt(0).toUpperCase() + o.status.slice(1))}</span></td>
                        </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="padding: 30px; text-align: center; color: #ef4444;">Failed to load orders: ${escapeHTML(data.error)}</td></tr>`;
            }
        })
        .catch(err => {
            console.error('Error fetching citizen orders:', err);
            tbody.innerHTML = '<tr><td colspan="6" style="padding: 30px; text-align: center; color: #ef4444;">Error connecting to server.</td></tr>';
        });
}

// ============ MEDICAL HISTORY (RECORDS) TAB ============
function renderHistory() {
    const apptbody = document.getElementById('history-appts-tbody');
    const ordtbody = document.getElementById('history-orders-tbody');

    if (apptbody) {
        if (citizenAppointments.length === 0) {
            apptbody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--text-secondary);">No medical consultation logs.</td></tr>';
        } else {
            apptbody.innerHTML = citizenAppointments.map(a => `
                <tr>
                    <td style="padding: 10px 12px;"><strong>${a.provider}</strong></td>
                    <td style="padding: 10px 12px;">${a.specialty}</td>
                    <td style="padding: 10px 12px;">${a.schedule.replace('T', ' ')}</td>
                    <td style="padding: 10px 12px;"><span class="status-badge status-active">${a.status}</span></td>
                </tr>
            `).join('');
        }
    }

    if (ordtbody) {
        fetch('/pharmacies/orders/user/')
            .then(res => res.json())
            .then(data => {
                if (data.success && ordtbody) {
                    const orders = data.orders || [];
                    if (orders.length === 0) {
                        ordtbody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--text-secondary);">No medicine purchase history.</td></tr>';
                    } else {
                        ordtbody.innerHTML = orders.map(o => {
                            const itemsText = o.items.map(item => `${item.medicine_name} x${item.quantity}`).join(', ');
                            return `
                                <tr>
                                    <td style="padding: 10px 12px;"><strong>${escapeHTML(o.order_id)}</strong></td>
                                    <td style="padding: 10px 12px;">${escapeHTML(itemsText)}</td>
                                    <td style="padding: 10px 12px;">${escapeHTML(o.created_at)}</td>
                                    <td style="padding: 10px 12px;">₹${o.total_price.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('');
                    }
                }
            })
            .catch(err => console.error(err));
    }
}

function renderCart() {
    const tbody = document.getElementById('cart-tbody');
    const totalPriceEl = document.getElementById('cart-total-price');
    if (!tbody) return;

    if (citizenCart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 40px; text-align: center; color: var(--text-secondary);">Your cart is empty. Go to <a href="#medicines" onclick="window.location.hash=\'#medicines\'; switchTab(\'medicines\');">Medicines</a> to browse items.</td></tr>';
        if (totalPriceEl) totalPriceEl.textContent = '₹0';
        return;
    }

    let total = 0;
    tbody.innerHTML = citizenCart.map((item, idx) => {
        total += item.price;
        return `
            <tr>
                <td style="padding: 12px 16px;"><strong>${item.medicine}</strong></td>
                <td style="padding: 12px 16px;">${item.manufacturer}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <span class="status-badge ${item.orderType === 'Urgent' ? 'status-pending' : 'status-active'}" style="font-size: 10px; border-radius: 6px;">${item.orderType || 'Normal'}</span>
                </td>
                <td style="padding: 12px 16px; text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <button onclick="updateCartQty(${idx}, -1)" style="width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--border-color); background: transparent; cursor: pointer; color: var(--text-primary); font-weight: bold;">-</button>
                        <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.qty}</span>
                        <button onclick="updateCartQty(${idx}, 1)" style="width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--border-color); background: transparent; cursor: pointer; color: var(--text-primary); font-weight: bold;">+</button>
                    </div>
                </td>
                <td style="padding: 12px 16px;">₹${item.price}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <button onclick="removeFromCart(${idx})" class="btn-action" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444;">Remove</button>
                </td>
            </tr>
        `;
    }).join('');

    if (totalPriceEl) totalPriceEl.textContent = `₹${total}`;
}

function updateCartQty(idx, delta) {
    if (citizenCart[idx]) {
        citizenCart[idx].qty += delta;
        if (citizenCart[idx].qty <= 0) {
            removeFromCart(idx);
            return;
        }
        citizenCart[idx].price = citizenCart[idx].basePrice * citizenCart[idx].qty;
        localStorage.setItem('citizen_cart', JSON.stringify(citizenCart));
        renderCart();
    }
}

function removeFromCart(idx) {
    citizenCart.splice(idx, 1);
    localStorage.setItem('citizen_cart', JSON.stringify(citizenCart));
    renderCart();
}

function checkoutCart() {
    if (citizenCart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const invalidItem = citizenCart.find(item => !item.pharmacyId);
    if (invalidItem) {
        alert("Some items in your cart do not have an associated pharmacy. Please re-add them.");
        return;
    }

    const ordersByPharmacy = {};
    citizenCart.forEach(item => {
        const pId = item.pharmacyId;
        if (!ordersByPharmacy[pId]) {
            ordersByPharmacy[pId] = [];
        }
        ordersByPharmacy[pId].push({
            medicine_id: item.medicineId,
            quantity: item.qty,
            price: item.basePrice
        });
    });

    const promises = Object.keys(ordersByPharmacy).map(pId => {
        const payload = {
            pharmacy_id: parseInt(pId),
            items: ordersByPharmacy[pId],
            order_type: 'normal',
            delivery_method: 'pickup'
        };

        return fetch('/pharmacies/orders/place/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.error || 'Failed to place order');
            }
            return data;
        });
    });

    Promise.all(promises)
        .then(results => {
            alert("Orders placed successfully!");
            citizenCart = [];
            localStorage.setItem('citizen_cart', JSON.stringify(citizenCart));
            renderCart();
            updateOverviewCounts();
            
            window.location.hash = '#orders';
            switchTab('orders');
        })
        .catch(err => {
            console.error('Checkout error:', err);
            alert("Error during checkout: " + err.message);
        });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
