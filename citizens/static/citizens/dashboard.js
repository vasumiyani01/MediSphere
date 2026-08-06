let isProfileComplete = false;
let allMedicines = [];
let allDiseases = [];
let citizenAppointments = [];
let citizenOrders = JSON.parse(localStorage.getItem('citizen_orders')) || [
    { id: 1, medicine: "Metformin 500mg", qty: 2, price: 150, date: "2026-07-20", status: "Delivered" },
    { id: 2, medicine: "Amoxicillin 250mg", qty: 1, price: 90, date: "2026-07-24", status: "Dispatched" }
];
let citizenCart = JSON.parse(localStorage.getItem('citizen_cart')) || [];
let citizenGender = 'Male';
let availableTemplates = [];
let citizenReports = [];

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
    if (tabId === 'bookings') loadCitizenAppointments();
    if (tabId === 'orders') renderOrders();
    if (tabId === 'records') renderHistory();
    if (tabId === 'cart') renderCart();
    if (tabId === 'reports') loadCitizenReports();
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

    const dateInput = document.getElementById('appointment-form-date');
    const timeInput = document.getElementById('appointment-form-time');

    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.min = `${year}-${month}-${day}`;
    }

    function validateDateTimeInputs() {
        if (!dateInput || !timeInput) return true;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const selectedDate = dateInput.value;
        const selectedTime = timeInput.value;

        if (selectedDate && selectedDate < todayStr) {
            dateInput.setCustomValidity("Date cannot be in the past!");
            dateInput.reportValidity();
            return false;
        } else {
            dateInput.setCustomValidity("");
        }

        if (selectedDate === todayStr && selectedTime) {
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
            if (selectedTime <= currentTimeStr) {
                timeInput.setCustomValidity("Time must be in the future!");
                timeInput.reportValidity();
                return false;
            } else {
                timeInput.setCustomValidity("");
            }
        } else {
            timeInput.setCustomValidity("");
        }
        return true;
    }

    if (dateInput) {
        dateInput.addEventListener('change', () => {
            validateDateTimeInputs();
            if (typeof selectedDoctorId !== 'undefined' && selectedDoctorId) {
                const doc = bookingDoctors.find(d => d.id === selectedDoctorId);
                if (doc) {
                    populateTimeSelectOptions(doc);
                }
            }
        });
    }
    if (timeInput) {
        timeInput.addEventListener('change', validateDateTimeInputs);
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
                citizenGender = user.gender || 'Male';
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

                document.getElementById('closeModalBtn').style.display = 'block';

                if (!isProfileComplete) {
                    document.getElementById('profile-alert-container').style.display = 'block';
                } else {
                    document.getElementById('profile-alert-container').style.display = 'none';
                }

                // Populate modal inputs
                document.getElementById('addressInput').value = user.address || '';
                document.getElementById('cityInput').value = user.city || '';
                document.getElementById('stateInput').value = user.state || '';
                document.getElementById('pincodeInput').value = user.pincode || '';
                document.getElementById('ageInput').value = user.age || '';
                document.getElementById('genderInput').value = user.gender || '';

                // Trigger tab render based on current hash
                handleHashChange();
                loadCitizenReports();
                loadCitizenAppointments();
            }
        })
        .catch(err => {
            console.error('Error fetching user status:', err);
            window.location.href = '/';
        });

    // Block sidebar links when profile is incomplete, otherwise let default hash navigation trigger hashchange
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            const targetHref = this.getAttribute('href');
            const hash = targetHref.substring(1);
            if (!isProfileComplete && hash !== 'overview') {
                e.preventDefault();
                e.stopPropagation();
                alert("Please complete your profile details first to unlock sidebar options!");
                openProfileModal();
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
    const reportsCount = citizenReports.length;
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

function filterMedicines(exactName = '') {
    const query = exactName ? exactName.toLowerCase().trim() : document.getElementById('search-medicine-input').value.toLowerCase().trim();
    const cat = document.getElementById('filter-medicine-cat').value;

    let filtered = allMedicines.filter(m => {
        let matchesQuery;
        if (exactName) {
            const names = exactName.toLowerCase().split(',').map(n => n.trim()).filter(Boolean);
            matchesQuery = names.some(name => m.name.toLowerCase().includes(name));
        } else {
            matchesQuery = m.name.toLowerCase().includes(query) || m.manufacturer.toLowerCase().includes(query) || m.uses.toLowerCase().includes(query);
        }
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
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;"><strong style="color: var(--text-primary);">Symptoms:</strong> ${d.symptoms.length > 70 ? d.symptoms.substring(0, 70) + '...' : d.symptoms}</p>
                <p style="font-size: 12px; color: var(--text-secondary);"><strong style="color: var(--text-primary);">Treatment Medicine:</strong> ${d.medicine || 'None'}</p>
            </div>
            <button onclick="viewDiseaseDetails(${d.id})" class="btn-action" style="margin-top: 10px; text-align: center; padding: 8px; border: 1px solid var(--color-primary); background: transparent; color: var(--color-primary); width: 100%;">View Details</button>
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
function loadCitizenAppointments(query = '') {
    const url = query ? `/citizens/api/appointments/list/?search=${encodeURIComponent(query)}` : '/citizens/api/appointments/list/';
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                citizenAppointments = data.appointments || [];
                // Map fields to maintain compatibility with overview and records tab
                citizenAppointments.forEach(a => {
                    a.provider = a.doctor_name;
                    a.schedule = `${a.appointment_date}T${a.appointment_time}`;
                    if (!a.status) {
                        a.status = 'Booked';
                    }
                });
                renderAppointmentsList(citizenAppointments);
                updateOverviewCounts();
                // If records/history is currently rendered, update it too
                if (typeof renderHistory === 'function') {
                    renderHistory();
                }
            } else {
                console.error("Failed to load appointments:", data.error);
            }
        })
        .catch(err => console.error("Error loading appointments:", err));
}

function renderAppointmentsList(list = citizenAppointments) {
    const tbody = document.getElementById('appointments-tbody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 30px; text-align: center; color: var(--text-secondary);">No appointments found. Click "+ Book New Appointment" to schedule.</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(a => {
        const isConcluded = a.status === 'Completed' || a.status === 'Cancelled';

        let statusBadge = '';
        if (a.status === 'Completed') {
            statusBadge = `<span style="font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; color: #10b981; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); display: inline-block;">Completed</span>`;
        } else if (a.status === 'Accepted') {
            statusBadge = `<span style="font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; color: #3b82f6; background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); display: inline-block;">Accepted</span>`;
        } else if (a.status === 'Cancelled') {
            statusBadge = `<span style="font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; color: #ef4444; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); display: inline-block;">Cancelled</span>`;
        } else {
            statusBadge = `<span style="font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; color: #d97706; background-color: rgba(217, 119, 6, 0.1); border: 1px solid rgba(217, 119, 6, 0.3); display: inline-block;">Booked</span>`;
        }

        return `
            <tr>
                <td style="padding: 12px 16px;"><strong>${a.id}</strong></td>
                <td style="padding: 12px 16px;"><strong>${formatDoctorName(a.doctor_name)}</strong> <span style="font-size: 11px; color: var(--text-muted);">(${escapeHTML(a.specialty)})</span></td>
                <td style="padding: 12px 16px;">${escapeHTML(a.reason)}</td>
                <td style="padding: 12px 16px;">${escapeHTML(a.appointment_date)} ${escapeHTML(a.appointment_time)}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    ${statusBadge}
                </td>
                <td style="padding: 12px 16px; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        ${isConcluded ? `
                            <button class="btn-action" style="background-color: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: not-allowed;" disabled>
                                Edit
                            </button>
                            <button class="btn-action" style="background-color: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: not-allowed;" disabled>
                                Cancel
                            </button>
                        ` : `
                            <button onclick="openEditAppointmentModal(${a.id})" class="btn-action" 
                                style="background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                                onmouseover="this.style.backgroundColor='#3b82f6';this.style.color='#fff'"
                                onmouseout="this.style.backgroundColor='rgba(59, 130, 246, 0.1)';this.style.color='#3b82f6'">
                                Edit
                            </button>
                            <button onclick="deleteAppointment(${a.id})" class="btn-action" 
                                style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                                onmouseover="this.style.backgroundColor='#ef4444';this.style.color='#fff'"
                                onmouseout="this.style.backgroundColor='rgba(239, 68, 68, 0.1)';this.style.color='#ef4444'">
                                Cancel
                            </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterAppointments() {
    const query = document.getElementById('search-appointment-input').value.trim();
    loadCitizenAppointments(query);
}

function formatDoctorName(name) {
    if (!name) return '';
    let trimmed = name.trim();
    if (trimmed.toLowerCase().startsWith('dr.') || trimmed.toLowerCase().startsWith('dr ')) {
        return trimmed;
    }
    return `Dr. ${trimmed}`;
}

let bookingDoctors = [];
let selectedDoctorId = null;

function renderDoctorCards(fromTime, toTime) {
    const listContainer = document.getElementById('booking-doctors-list');
    if (!listContainer) return;

    if (bookingDoctors.length === 0) {
        listContainer.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 30px; color: var(--text-secondary); background: var(--bg-tertiary); border-radius: 12px; border: 1px dashed var(--border-color);">
                <span style="font-size: 24px; display: block; margin-bottom: 8px;">🏥</span>
                <strong>No doctors available in your pincode area.</strong>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px; margin-bottom: 0;">Please contact administrator or update your profile pincode.</p>
            </div>
        `;
        return;
    }

    const hasFilter = fromTime && toTime;

    listContainer.innerHTML = bookingDoctors.map(d => {
        let isAvailable = true;
        let unavailableReason = '';

        if (hasFilter) {
            isAvailable = false;
            if (d.appointment_slot) {
                const parts = d.appointment_slot.split(' - ');
                if (parts.length === 2) {
                    const docFrom = parse12HourTo24(parts[0]);
                    const docTo = parse12HourTo24(parts[1]);
                    // Check if citizen's range overlaps with doctor's slot
                    if (fromTime < docTo && toTime > docFrom) {
                        isAvailable = true;
                    } else {
                        unavailableReason = `Slot ${d.appointment_slot} doesn't overlap`;
                    }
                }
            } else {
                unavailableReason = 'No active slot set by doctor';
            }
        }

        const cardOpacity = (!hasFilter || isAvailable) ? '1' : '0.5';
        const cardBorder = (!hasFilter || isAvailable) ? '1px solid var(--border-color)' : '1px solid rgba(239, 68, 68, 0.2)';

        const selectButton = (!hasFilter || isAvailable)
            ? `<button type="button" onclick="selectDoctor(${d.id})" class="btn-primary" 
                    style="padding: 8px 12px; font-size: 12px; border-radius: 6px; font-weight: 700; cursor: pointer; border: none; width: 100%; height: 34px; margin-top: 6px;">
                    Select Doctor
                </button>`
            : `<div style="padding: 8px 12px; font-size: 11px; border-radius: 6px; font-weight: 700; width: 100%; height: 34px; margin-top: 6px; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">
                    ✕ ${escapeHTML(unavailableReason)}
                </div>`;

        return `
            <div style="background: var(--bg-tertiary); border: ${cardBorder}; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; justify-content: space-between; opacity: ${cardOpacity};">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <span style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${formatDoctorName(d.name)}</span>
                        <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.1); color: #2563eb; font-weight: 600;">${escapeHTML(d.specialty)}</span>
                    </div>
                    <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-secondary); text-align: left;">
                        <span><strong>Gender:</strong> ${escapeHTML(d.gender)}</span>
                        <span><strong>Mobile:</strong> ${escapeHTML(d.mobile_number)}</span>
                        <span><strong>Address:</strong> ${escapeHTML(d.address)}, ${escapeHTML(d.city)}, ${escapeHTML(d.state)} - ${escapeHTML(d.pincode)}</span>
                        <span><strong>Availability:</strong> ${d.appointment_slot ? `<span style="color: var(--color-success); font-weight: 700;">🕒 ${escapeHTML(d.appointment_slot)}</span>` : '<span style="color: var(--text-muted); font-style: italic;">No active slots set</span>'}</span>
                    </div>
                </div>
                ${selectButton}
            </div>
        `;
    }).join('');
}

function openBookAppointmentModal() {
    document.getElementById('appointment-modal-title').textContent = "Book New Appointment";
    document.getElementById('appointment-form-id').value = "";
    document.getElementById('appointment-form-doctor-id').value = "";
    document.getElementById('appointmentForm').reset();

    const filterFromEl = document.getElementById('filter-booking-from');
    const filterToEl = document.getElementById('filter-booking-to');
    if (filterFromEl) filterFromEl.value = "";
    if (filterToEl) filterToEl.value = "";

    document.getElementById('appointmentModal').style.display = 'flex';
    document.getElementById('booking-step-1').style.display = 'flex';
    document.getElementById('booking-step-2').style.display = 'none';

    const listContainer = document.getElementById('booking-doctors-list');
    listContainer.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 20px; color: var(--text-secondary);">Loading available doctors...</div>';

    fetch('/citizens/api/doctors/approved/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                bookingDoctors = data.doctors || [];
                const pincodeInfo = document.getElementById('booking-pincode-info');
                if (pincodeInfo) {
                    pincodeInfo.textContent = `Showing available doctors in your pincode area (${data.citizen_pincode || 'N/A'}).`;
                }
                renderDoctorCards(null, null);
            } else {
                alert("Failed to load doctors: " + data.error);
            }
        })
        .catch(err => console.error("Error fetching doctors:", err));
}

function filterDoctorsByDesiredTime() {
    const fromVal = document.getElementById('filter-booking-from').value;
    const toVal = document.getElementById('filter-booking-to').value;

    if (!fromVal || !toVal) {
        alert("Please select both From Time and To Time.");
        return;
    }
    if (toVal <= fromVal) {
        alert("To Time must be after From Time.");
        return;
    }
    renderDoctorCards(fromVal, toVal);
}




function selectDoctor(doctorId) {
    const doc = bookingDoctors.find(d => d.id === doctorId);
    if (!doc) return;

    selectedDoctorId = doctorId;
    document.getElementById('appointment-form-doctor-id').value = doctorId;

    // Populate Doctor Summary in Step 2
    const summaryContainer = document.getElementById('selected-doctor-summary');
    summaryContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
             <strong style="font-size: 15px; color: var(--text-primary);">Selected: ${formatDoctorName(doc.name)}</strong>
             <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.1); color: #2563eb; font-weight: 600;">${escapeHTML(doc.specialty)}</span>
        </div>
        <p style="font-size: 12px; color: var(--text-secondary); margin: 4px 0 0 0; text-align: left;">
             📍 ${escapeHTML(doc.address)}, ${escapeHTML(doc.city)}, ${escapeHTML(doc.state)} - ${escapeHTML(doc.pincode)}
        </p>
        <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0 0 0; text-align: left;">
             🕒 <strong>Doctor Available Slot:</strong> ${doc.appointment_slot ? `<span style="color: var(--color-success); font-weight: 700;">${escapeHTML(doc.appointment_slot)}</span>` : '<span style="color: var(--text-muted); font-style: italic;">No active slot set</span>'}
        </p>
    `;

    // Populate the dropdown options based on doctor slots
    populateTimeSelectOptions(doc);

    // Auto pre-fill time from step 1 filter
    const filterFrom = document.getElementById('filter-booking-from').value;
    if (filterFrom) {
        document.getElementById('appointment-form-time').value = filterFrom;
    }

    // Transition to Step 2
    document.getElementById('booking-step-1').style.display = 'none';
    document.getElementById('booking-step-2').style.display = 'flex';
}

function backToDoctorSelection() {
    document.getElementById('booking-step-1').style.display = 'flex';
    document.getElementById('booking-step-2').style.display = 'none';
}

function populateTimeSelectOptions(doc) {
    const timeSelect = document.getElementById('appointment-form-time');
    if (!timeSelect) return;

    // Clear existing options
    timeSelect.innerHTML = '';

    if (!doc || !doc.appointment_slot) {
        const opt = document.createElement('option');
        opt.value = "";
        opt.textContent = "No active slots set by doctor";
        timeSelect.appendChild(opt);
        return;
    }

    const parts = doc.appointment_slot.split(' - ');
    if (parts.length !== 2) {
        const opt = document.createElement('option');
        opt.value = "";
        opt.textContent = "No active slots set by doctor";
        timeSelect.appendChild(opt);
        return;
    }

    const start24 = parse12HourTo24(parts[0]);
    const end24 = parse12HourTo24(parts[1]);

    if (!start24 || !end24) {
        const opt = document.createElement('option');
        opt.value = "";
        opt.textContent = "No active slots set by doctor";
        timeSelect.appendChild(opt);
        return;
    }

    const dateInput = document.getElementById('appointment-form-date');
    const selectedDate = dateInput ? dateInput.value : '';

    const todayObj = new Date();
    const year = todayObj.getFullYear();
    const month = String(todayObj.getMonth() + 1).padStart(2, '0');
    const day = String(todayObj.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const isToday = selectedDate === todayStr;

    let minHour = 0;
    let minMin = 0;
    if (isToday) {
        minHour = todayObj.getHours();
        minMin = todayObj.getMinutes();
    }

    const [startHour, startMin] = start24.split(':').map(Number);
    const [endHour, endMin] = end24.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    let hasOptions = false;

    while ((currentHour * 60 + currentMin) <= endTotalMinutes) {
        const isFuture = !isToday || (currentHour > minHour || (currentHour === minHour && currentMin > minMin));

        if (isFuture) {
            const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

            let displayHour = currentHour % 12;
            if (displayHour === 0) displayHour = 12;
            const ampm = currentHour >= 12 ? 'PM' : 'AM';
            const displayMin = currentMin.toString().padStart(2, '0');
            const displayLabel = `${displayHour}:${displayMin} ${ampm}`;

            const opt = document.createElement('option');
            opt.value = timeString;
            opt.textContent = displayLabel;
            timeSelect.appendChild(opt);
            hasOptions = true;
        }

        currentMin += 30;
        if (currentMin >= 60) {
            currentHour += 1;
            currentMin -= 60;
        }
    }

    if (!hasOptions) {
        const opt = document.createElement('option');
        opt.value = "";
        opt.textContent = isToday ? "No remaining slots for today" : "No active slots set by doctor";
        timeSelect.appendChild(opt);
    }
}

function openEditAppointmentModal(id) {
    const appt = citizenAppointments.find(a => a.id === id);
    if (!appt) return;

    document.getElementById('appointment-modal-title').textContent = "Edit Appointment";
    document.getElementById('appointment-form-id').value = id;
    document.getElementById('appointment-form-doctor-id').value = appt.doctor_id;
    document.getElementById('appointment-form-reason').value = appt.reason;
    document.getElementById('appointment-form-date').value = appt.appointment_date;

    selectedDoctorId = appt.doctor_id;

    // Fetch approved doctors to show selected doctor summary
    fetch('/citizens/api/doctors/approved/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                bookingDoctors = data.doctors || [];
                const doc = bookingDoctors.find(d => d.id === appt.doctor_id);
                const summaryContainer = document.getElementById('selected-doctor-summary');
                if (doc) {
                    summaryContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="font-size: 15px; color: var(--text-primary);">Selected: ${formatDoctorName(doc.name)}</strong>
                            <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.1); color: #2563eb; font-weight: 600;">${escapeHTML(doc.specialty)}</span>
                        </div>
                        <p style="font-size: 12px; color: var(--text-secondary); margin: 4px 0 0 0; text-align: left;">
                            📍 ${escapeHTML(doc.address)}, ${escapeHTML(doc.city)}, ${escapeHTML(doc.state)} - ${escapeHTML(doc.pincode)}
                        </p>
                        <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0 0 0; text-align: left;">
                             🕒 <strong>Doctor Available Slot:</strong> ${doc.appointment_slot ? `<span style="color: var(--color-success); font-weight: 700;">${escapeHTML(doc.appointment_slot)}</span>` : '<span style="color: var(--text-muted); font-style: italic;">No active slot set</span>'}
                        </p>
                    `;
                    populateTimeSelectOptions(doc);
                } else {
                    summaryContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="font-size: 15px; color: var(--text-primary);">Selected: ${formatDoctorName(appt.doctor_name)}</strong>
                            <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.1); color: #2563eb; font-weight: 600;">${escapeHTML(appt.specialty)}</span>
                        </div>
                    `;
                }

                // Set value after options are populated
                document.getElementById('appointment-form-time').value = appt.appointment_time;

                // For editing, skip select step and show details form directly
                document.getElementById('booking-step-1').style.display = 'none';
                document.getElementById('booking-step-2').style.display = 'flex';
                document.getElementById('appointmentModal').style.display = 'flex';
            } else {
                alert("Failed to load doctors: " + data.error);
            }
        })
        .catch(err => console.error("Error fetching doctors:", err));
}

function closeAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'none';
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

function submitAppointmentForm(e) {
    e.preventDefault();
    const id = document.getElementById('appointment-form-id').value;
    const doctorId = document.getElementById('appointment-form-doctor-id').value;
    const reason = document.getElementById('appointment-form-reason').value.trim();
    const apptDate = document.getElementById('appointment-form-date').value;
    const apptTime = document.getElementById('appointment-form-time').value;

    if (!doctorId || !reason || !apptDate || !apptTime) {
        alert("Please fill in all appointment fields!");
        return;
    }

    // Check if citizen already has another active appointment at the exact same date and time
    const conflict = citizenAppointments.find(a => {
        if (id && a.id === parseInt(id)) return false;
        if (a.status === 'Cancelled') return false;

        const dateMatch = a.appointment_date === apptDate;
        const t1 = (a.appointment_time || '').substring(0, 5);
        const t2 = apptTime.substring(0, 5);
        return dateMatch && t1 === t2;
    });

    if (conflict) {
        const [h, m] = apptTime.split(':').map(Number);
        let hr = h % 12;
        if (hr === 0) hr = 12;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayTime = `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
        alert(`You have already booked another doctor appointment at this same time (${displayTime}) on ${apptDate}.`);
        return;
    }

    const doc = bookingDoctors.find(d => d.id === parseInt(doctorId));
    if (doc && doc.appointment_slot) {
        const parts = doc.appointment_slot.split(' - ');
        if (parts.length === 2) {
            const from24 = parse12HourTo24(parts[0]);
            const to24 = parse12HourTo24(parts[1]);
            if (apptTime < from24 || apptTime > to24) {
                alert(`Selected time (${apptTime}) falls outside the doctor's availability slot (${doc.appointment_slot}). Please select a time between ${parts[0]} and ${parts[1]}.`);
                return;
            }
        }
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (apptDate < todayStr) {
        alert("Appointment date cannot be in the past!");
        return;
    }

    if (apptDate === todayStr) {
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
        if (apptTime <= currentTimeStr) {
            alert("Appointment time must be in the future!");
            return;
        }
    }

    const payload = {
        doctor_id: parseInt(doctorId),
        reason: reason,
        appointment_date: apptDate,
        appointment_time: apptTime
    };

    const url = id ? `/citizens/api/appointments/edit/${id}/` : '/citizens/api/appointments/add/';
    fetch(url, {
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
                alert(id ? "Appointment updated successfully!" : "Appointment booked successfully!");
                closeAppointmentModal();
                loadCitizenAppointments();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => console.error("Error saving appointment:", err));
}

function deleteAppointment(id) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    fetch(`/citizens/api/appointments/delete/${id}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Appointment cancelled successfully!");
                loadCitizenAppointments();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => console.error("Error cancelling appointment:", err));
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
                                <div style="margin-top: 4px;"><span class="status-badge ${o.order_type.toLowerCase() === 'urgent' ? 'status-pending' : 'status-active'}" style="font-size: 9px; padding: 2px 6px;">Order Type: ${escapeHTML(o.order_type.charAt(0).toUpperCase() + o.order_type.slice(1))}</span></div>
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
    const reptbody = document.getElementById('history-reports-tbody');

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

    if (reptbody) {
        fetch('/citizens/api/reports/list/')
            .then(res => res.json())
            .then(data => {
                if (data.success && reptbody) {
                    const reports = data.reports || [];
                    if (reports.length === 0) {
                        reptbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: var(--text-secondary);">No lab reports history.</td></tr>';
                    } else {
                        reptbody.innerHTML = reports.map(r => {
                            let badgeStyle = 'background: rgba(16, 185, 129, 0.15); color: #10b981;';
                            if (r.status === 'High') badgeStyle = 'background: rgba(239, 68, 68, 0.15); color: #ef4444;';
                            if (r.status === 'Low') badgeStyle = 'background: rgba(59, 130, 246, 0.15); color: #3b82f6;';

                            return `
                                <tr>
                                    <td style="padding: 10px 12px;"><strong>${r.id}</strong></td>
                                    <td style="padding: 10px 12px;"><strong>${escapeHTML(r.name)}</strong></td>
                                    <td style="padding: 10px 12px;">${escapeHTML(r.short_name)}</td>
                                    <td style="padding: 10px 12px;">
                                        <span class="status-badge" style="font-size: 11px; padding: 4px 8px; border-radius: 6px; ${badgeStyle}">${escapeHTML(r.status)}</span>
                                    </td>
                                    <td style="padding: 10px 12px;">${escapeHTML(r.created_at || '-')}</td>
                                    <td style="padding: 10px 12px; text-align: center;">
                                        <button onclick="openViewReportModal(${r.id})" class="btn-action" style="background-color: rgba(59, 130, 246, 0.1); color: #3b82f6;">View</button>
                                    </td>
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

    const deliveryMethod = document.getElementById('checkout-delivery-method')?.value || 'pickup';

    const promises = Object.keys(ordersByPharmacy).map(pId => {
        const payload = {
            pharmacy_id: parseInt(pId),
            items: ordersByPharmacy[pId],
            order_type: 'normal',
            delivery_method: deliveryMethod
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

function viewDiseaseMedicine() {
    const medicineName = document.getElementById('dis-detail-medicine').textContent.trim();
    closeDiseaseDetailModal();
    window.location.hash = '#medicines';
    switchTab('medicines');
    if (medicineName && medicineName !== 'N/A' && medicineName !== 'None') {
        const searchInput = document.getElementById('search-medicine-input');
        if (searchInput) {
            searchInput.value = medicineName;
            filterMedicines(medicineName);
        }
    }
}

function findDiseaseDoctor() {
    closeDiseaseDetailModal();
    window.location.hash = '#bookings';
    switchTab('bookings');
}

// ============ REPORTS CRUD FUNCTIONS ============
function renderReportsList(list = citizenReports) {
    const tbody = document.getElementById('reports-tbody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 30px; text-align: center; color: var(--text-secondary);">No lab reports found. Click "+ Add New Report" to start tracking.</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(r => {
        let badgeStyle = 'background: rgba(16, 185, 129, 0.15); color: #10b981;'; // Normal green
        if (r.status === 'High') badgeStyle = 'background: rgba(239, 68, 68, 0.15); color: #ef4444;'; // High red
        if (r.status === 'Low') badgeStyle = 'background: rgba(59, 130, 246, 0.15); color: #3b82f6;'; // Low blue

        return `
            <tr>
                <td style="padding: 12px 16px;"><strong>${r.id}</strong></td>
                <td style="padding: 12px 16px;"><strong>${escapeHTML(r.name)}</strong></td>
                <td style="padding: 12px 16px;">${escapeHTML(r.short_name)}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <span class="status-badge" style="font-size: 11px; padding: 4px 8px; border-radius: 6px; ${badgeStyle}">${escapeHTML(r.status)}</span>
                </td>
                <td style="padding: 12px 16px;">${escapeHTML(r.created_at || '-')}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <div style="display: flex; justify-content: center; gap: 8px;">
                        <button onclick="openViewReportModal(${r.id})" class="btn-action" style="background-color: rgba(59, 130, 246, 0.1); color: #3b82f6;">View</button>
                        <button onclick="openEditReportModal(${r.id})" class="btn-action" style="background-color: rgba(245, 158, 11, 0.1); color: var(--color-primary);">Edit</button>
                        <button onclick="deleteReport(${r.id})" class="btn-action" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444;">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterReports() {
    const query = document.getElementById('search-report-input').value.toLowerCase().trim();
    const filtered = citizenReports.filter(r =>
        r.name.toLowerCase().includes(query) || r.short_name.toLowerCase().includes(query)
    );
    renderReportsList(filtered);
}

function openAddReportModal() {
    document.getElementById('report-form-id').value = '';
    document.getElementById('report-modal-title').textContent = 'Add Lab Report';

    // Clear and show/hide sections
    document.getElementById('template-select-wrapper').style.display = 'flex';
    document.getElementById('report-template-details-section').style.display = 'none';
    document.getElementById('report-parameters-section').style.display = 'none';
    document.getElementById('manual-report-fields').style.display = 'none';

    document.getElementById('report-template-search').value = '';
    document.getElementById('report-template-select-val').value = '';

    // Fetch available templates
    fetch('/citizens/api/reports/templates/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                availableTemplates = data.reports || [];
                renderTemplateOptions(availableTemplates);
            }
        })
        .catch(err => console.error("Error fetching templates:", err));

    document.getElementById('reportModal').style.display = 'flex';
}

function renderTemplateOptions(templates) {
    const panel = document.getElementById('report-template-dropdown-panel');
    if (!panel) return;

    if (templates.length === 0) {
        panel.innerHTML = '<div style="padding: 8px 10px; color: #94a3b8; font-size: 12px;">No templates found</div>';
        return;
    }

    panel.innerHTML = templates.map(t => `
        <div class="template-dropdown-item" data-id="${t.id}" data-name="${escapeHTML(t.name)}" data-shortname="${escapeHTML(t.short_name)}"
            style="padding: 8px 12px; cursor: pointer; font-size: 13px; color: #0f172a; transition: background 0.15s ease; border-bottom: 1px solid #f1f5f9;"
            onmouseover="this.style.backgroundColor='#f1f5f9';" onmouseout="this.style.backgroundColor='transparent';">
            <strong>${escapeHTML(t.name)}</strong> <small style="color: var(--text-muted); font-size: 11px;">(${escapeHTML(t.short_name)})</small>
        </div>
    `).join('');

    panel.querySelectorAll('.template-dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const shortName = this.getAttribute('data-shortname');

            document.getElementById('report-template-select-val').value = id;
            document.getElementById('report-template-search').value = `${name} (${shortName})`;
            panel.style.display = 'none';

            onTemplateSelected(parseInt(id));
        });
    });
}

function filterTemplateOptions() {
    const query = document.getElementById('report-template-search').value.toLowerCase().trim();
    const filtered = availableTemplates.filter(t =>
        t.name.toLowerCase().includes(query) || t.short_name.toLowerCase().includes(query)
    );
    renderTemplateOptions(filtered);
    showTemplateDropdown();
}

function showTemplateDropdown() {
    const panel = document.getElementById('report-template-dropdown-panel');
    if (panel) {
        panel.style.display = 'block';
    }
}

function onTemplateSelected(selectedId) {
    const template = availableTemplates.find(t => t.id === selectedId);
    if (!template) return;

    // Fill read-only details
    document.getElementById('report-form-name').value = template.name;
    document.getElementById('report-form-shortname').value = template.short_name;
    document.getElementById('report-form-description').value = template.description || '';

    // Show details
    document.getElementById('report-template-details-section').style.display = 'flex';

    // Render parameters
    const container = document.getElementById('report-parameters-container');
    container.innerHTML = '';

    if (template.parameters && template.parameters.length > 0) {
        template.parameters.forEach(p => {
            let minVal = '';
            let maxVal = '';

            // Check gender normal range
            if (citizenGender.toLowerCase() === 'female') {
                minVal = p.female_min;
                maxVal = p.female_max;
            } else {
                minVal = p.male_min;
                maxVal = p.male_max;
            }

            let normalRange = 'N/A';
            if (minVal && maxVal) {
                normalRange = `${minVal} - ${maxVal}`;
            } else if (minVal) {
                normalRange = `>= ${minVal}`;
            } else if (maxVal) {
                normalRange = `<= ${maxVal}`;
            }

            container.innerHTML += `
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 12px; align-items: center; background: var(--bg-tertiary); padding: 10px 12px; border-radius: 8px;">
                    <div>
                        <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${escapeHTML(p.parameter)}</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="color: var(--text-secondary); font-size: 12px;">${escapeHTML(p.unit || '-')}</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="color: var(--text-secondary); font-size: 12px; font-weight: 600;">${escapeHTML(normalRange)}</span>
                    </div>
                    <div>
                        <input type="text" class="parameter-input" data-param-id="${p.id}" data-param-name="${p.parameter}" data-param-unit="${p.unit}" data-param-min="${minVal}" data-param-max="${maxVal}" required placeholder="Result"
                            style="padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 6px; outline: none; font-size: 12px; background: #ffffff; color: #0f172a; width: 100%;">
                    </div>
                </div>
            `;
        });
        document.getElementById('report-parameters-section').style.display = 'flex';
    } else {
        document.getElementById('report-parameters-section').style.display = 'none';
    }
}

function openEditReportModal(id) {
    const r = citizenReports.find(x => x.id === id);
    if (!r) return;

    document.getElementById('report-form-id').value = r.id;
    document.getElementById('report-modal-title').textContent = 'Edit Lab Report';

    // Hide template selector (editing template type is locked, just update values)
    document.getElementById('template-select-wrapper').style.display = 'none';

    if (r.parameters && r.parameters.length > 0) {
        // Template mode
        document.getElementById('report-form-name').value = r.name;
        document.getElementById('report-form-shortname').value = r.short_name;
        document.getElementById('report-form-description').value = r.description || '';

        document.getElementById('report-template-details-section').style.display = 'flex';
        document.getElementById('manual-report-fields').style.display = 'none';

        const container = document.getElementById('report-parameters-container');
        container.innerHTML = '';

        r.parameters.forEach(p => {
            let normalRange = 'N/A';
            if (p.min && p.max) {
                normalRange = `${p.min} - ${p.max}`;
            } else if (p.min) {
                normalRange = `>= ${p.min}`;
            } else if (p.max) {
                normalRange = `<= ${p.max}`;
            }

            container.innerHTML += `
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 12px; align-items: center; background: var(--bg-tertiary); padding: 10px 12px; border-radius: 8px;">
                    <div>
                        <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${escapeHTML(p.name)}</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="color: var(--text-secondary); font-size: 12px;">${escapeHTML(p.unit || '-')}</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="color: var(--text-secondary); font-size: 12px; font-weight: 600;">${escapeHTML(normalRange)}</span>
                    </div>
                    <div>
                        <input type="text" class="parameter-input" data-param-id="${p.id || ''}" data-param-name="${p.name}" data-param-unit="${p.unit}" data-param-min="${p.min || ''}" data-param-max="${p.max || ''}" required placeholder="Result" value="${escapeHTML(p.value || '')}"
                            style="padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 6px; outline: none; font-size: 12px; background: #ffffff; color: #0f172a; width: 100%;">
                    </div>
                </div>
            `;
        });
        document.getElementById('report-parameters-section').style.display = 'flex';
    } else {
        // Manual mode (legacy report)
        document.getElementById('manual-form-name').value = r.name;
        document.getElementById('manual-form-shortname').value = r.short_name;
        document.getElementById('report-form-status').value = r.status;

        document.getElementById('report-template-details-section').style.display = 'none';
        document.getElementById('report-parameters-section').style.display = 'none';
        document.getElementById('manual-report-fields').style.display = 'flex';
    }

    document.getElementById('reportModal').style.display = 'flex';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

function loadCitizenReports() {
    fetch('/citizens/api/reports/list/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                citizenReports = data.reports || [];
                renderReportsList(citizenReports);
                updateOverviewCounts();
            }
        })
        .catch(err => console.error("Error fetching reports:", err));
}

function submitReportForm(e) {
    e.preventDefault();
    const idVal = document.getElementById('report-form-id').value;

    // Check mode
    const isTemplateMode = document.getElementById('manual-report-fields').style.display === 'none';

    let name, short_name, status, description = '', parameters = [];

    if (isTemplateMode) {
        name = document.getElementById('report-form-name').value.trim();
        short_name = document.getElementById('report-form-shortname').value.trim();
        description = document.getElementById('report-form-description').value.trim();

        let overallStatus = 'Normal';
        document.querySelectorAll('.parameter-input').forEach(input => {
            const valStr = input.value.trim();
            const val = parseFloat(valStr);
            const minVal = parseFloat(input.dataset.paramMin);
            const maxVal = parseFloat(input.dataset.paramMax);

            let status = 'Normal';
            if (!isNaN(val)) {
                if (!isNaN(minVal) && val < minVal) {
                    status = 'Low';
                } else if (!isNaN(maxVal) && val > maxVal) {
                    status = 'High';
                }
            }

            if (status === 'High') overallStatus = 'High';
            else if (status === 'Low' && overallStatus !== 'High') overallStatus = 'Low';

            parameters.push({
                name: input.dataset.paramName,
                unit: input.dataset.paramUnit,
                value: valStr,
                min: input.dataset.paramMin,
                max: input.dataset.paramMax,
                status: status
            });
        });

        status = overallStatus;
    } else {
        name = document.getElementById('manual-form-name').value.trim();
        short_name = document.getElementById('manual-form-shortname').value.trim();
        status = document.getElementById('report-form-status').value;
    }

    if (!name || !short_name || !status) {
        alert("Please fill in all fields.");
        return;
    }

    const url = idVal ? `/citizens/api/reports/edit/${idVal}/` : '/citizens/api/reports/add/';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ name, short_name, status, description, parameters })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeReportModal();
                loadCitizenReports();
                alert("Report saved successfully!");
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => console.error("Error saving report:", err));
}

function deleteReport(id) {
    if (!confirm("Are you sure you want to delete this report?")) return;

    fetch(`/citizens/api/reports/delete/${id}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadCitizenReports();
                alert("Report deleted successfully!");
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => console.error("Error deleting report:", err));
}

function openViewReportModal(id) {
    const r = citizenReports.find(x => x.id === id);
    if (!r) return;

    document.getElementById('view-report-name').textContent = r.name;
    document.getElementById('view-report-shortname').textContent = r.short_name;

    const badge = document.getElementById('view-report-status-badge');
    badge.textContent = r.status;

    let badgeStyle = 'background: rgba(16, 185, 129, 0.15); color: #10b981;'; // Normal green
    if (r.status === 'High') badgeStyle = 'background: rgba(239, 68, 68, 0.15); color: #ef4444;'; // High red
    if (r.status === 'Low') badgeStyle = 'background: rgba(59, 130, 246, 0.15); color: #3b82f6;'; // Low blue
    badge.style.cssText = `font-size: 11px; padding: 4px 8px; border-radius: 6px; ${badgeStyle}`;

    const paramSection = document.getElementById('view-report-parameters-section');
    const paramContainer = document.getElementById('view-report-parameters-container');

    if (r.parameters && r.parameters.length > 0) {
        paramContainer.innerHTML = r.parameters.map(p => {
            let pStyle = 'color: #10b981;'; // Normal green
            if (p.status === 'High') pStyle = 'color: #ef4444; font-weight: 700;'; // High red
            if (p.status === 'Low') pStyle = 'color: #3b82f6; font-weight: 700;'; // Low blue

            let normalRange = 'N/A';
            if (p.min && p.max) {
                normalRange = `${p.min} - ${p.max}`;
            } else if (p.min) {
                normalRange = `>= ${p.min}`;
            } else if (p.max) {
                normalRange = `<= ${p.max}`;
            }

            return `
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 12px; align-items: center; background: var(--bg-tertiary); padding: 8px 12px; border-radius: 8px;">
                    <div>
                        <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${escapeHTML(p.name)}</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="color: var(--text-secondary); font-size: 12px;">${escapeHTML(p.unit || '-')}</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="color: var(--text-secondary); font-size: 12px;">${escapeHTML(normalRange)}</span>
                    </div>
                    <div style="text-align: right; padding-right: 6px;">
                        <span style="font-size: 13px; ${pStyle}">${escapeHTML(p.value || '-')} <small style="font-weight: normal; font-size: 10px; color: var(--text-muted);">(${p.status})</small></span>
                    </div>
                </div>
            `;
        }).join('');
        paramSection.style.display = 'flex';
    } else {
        paramSection.style.display = 'none';
    }

    document.getElementById('viewReportModal').style.display = 'flex';
}

function closeViewReportModal() {
    document.getElementById('viewReportModal').style.display = 'none';
}

document.addEventListener('click', function (e) {
    const wrapper = document.getElementById('template-select-wrapper');
    const panel = document.getElementById('report-template-dropdown-panel');
    if (wrapper && !wrapper.contains(e.target) && panel) {
        panel.style.display = 'none';
    }
});
function closeViewReportModal() {
    document.getElementById('viewReportModal').style.display = 'none';
}

document.addEventListener('click', function (e) {
    const wrapper = document.getElementById('template-select-wrapper');
    const panel = document.getElementById('report-template-dropdown-panel');
    if (wrapper && !wrapper.contains(e.target) && panel) {
        panel.style.display = 'none';
    }
});
