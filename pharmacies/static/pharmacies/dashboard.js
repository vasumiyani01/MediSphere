let isProfileComplete = false;
let dbMedicines = []; // Pharmacy's actual inventory
let globalMedicines = []; // All medicines in public database
let renderInventory;
let renderDropdownOptions;

function goToLowStockInventory() {
    switchTab('inventory');
    window.location.hash = '#inventory';
    const checkbox = document.getElementById('inv_low_stock');
    if (checkbox) {
        checkbox.checked = true;
    }
    if (typeof renderInventory === 'function') {
        renderInventory();
    }
}

function goToExpiredInventory() {
    switchTab('inventory');
    window.location.hash = '#inventory';
    const checkbox = document.getElementById('inv_low_stock');
    if (checkbox) checkbox.checked = false;
    if (typeof renderInventory === 'function') {
        renderInventory();
    }
}

function loadPharmacyInventory() {
    fetch('/pharmacies/inventory/list/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                dbMedicines = data.inventory || [];

                // Update overview card count
                const countEl = document.getElementById('overview_inventory_count');
                if (countEl) countEl.textContent = dbMedicines.length;

                // Calculate low stock count (<= 5)
                const lowStockCount = dbMedicines.filter(m => parseInt(m.quantity) <= 5).length;
                const lowStockEl = document.getElementById('overview_low_stock');
                if (lowStockEl) lowStockEl.textContent = lowStockCount;

                // Calculate expired count (expiry date < today)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const expiredCount = dbMedicines.filter(m => {
                    if (!m.expiry_date) return false;
                    const exp = new Date(m.expiry_date);
                    exp.setHours(0, 0, 0, 0);
                    return exp < today;
                }).length;
                const expiredEl = document.getElementById('overview_expired_medicines');
                if (expiredEl) expiredEl.textContent = expiredCount;

                renderInventory();
            }
        })
        .catch(err => console.error("Error loading inventory:", err));
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

                document.getElementById('helpdesk_total_count').textContent = total;
                document.getElementById('helpdesk_open_count').textContent = open;
                document.getElementById('helpdesk_completed_count').textContent = completed;

                const tbody = document.getElementById('helpdesk_tickets_tbody');
                if (!tbody) return;

                if (tickets.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="padding: 40px; text-align: center; color: var(--text-secondary);"><svg width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 8px;"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg><br>No tickets yet. Click <b>New Ticket</b> to create one.</td></tr>';
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
                            <td style="padding: 14px 16px; color: var(--text-secondary); max-width: 300px;">${msgTruncated}</td>
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

// ============ POS BILLING SYSTEM JAVASCRIPT ============

let pharmacyBillsList = [];

function loadPharmacyBills() {
    fetch('/pharmacies/bills/list/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                pharmacyBillsList = data.bills || [];
                renderPharmacyBills();

                // Update overview card counts dynamically
                const billCountEl = document.getElementById('overview_billing_system');
                if (billCountEl) billCountEl.textContent = pharmacyBillsList.length;

                let revenue = 0;
                pharmacyBillsList.forEach(b => {
                    revenue += parseFloat(b.total_price) || 0;
                });
                const revEl = document.getElementById('overview_total_revenue');
                if (revEl) revEl.textContent = '₹ ' + revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        })
        .catch(err => console.error("Error loading bills:", err));
}

function renderPharmacyBills() {
    const tbody = document.getElementById('billing_tbody');
    if (!tbody) return;

    const searchQuery = (document.getElementById('bill_search_input')?.value || '').toLowerCase().trim();
    const dateFilter = document.getElementById('bill_date_filter')?.value || '';
    const sortOption = document.getElementById('bill_sort_select')?.value || 'default';

    // 1. Filter
    let filtered = pharmacyBillsList.filter(b => {
        const matchesSearch = b.customer_name.toLowerCase().includes(searchQuery) || b.bill_no.toLowerCase().includes(searchQuery);
        const matchesDate = !dateFilter || b.bill_date === dateFilter;
        return matchesSearch && matchesDate;
    });

    // 2. Sort
    if (sortOption === 'low-to-high') {
        filtered.sort((a, b) => parseFloat(a.total_price) - parseFloat(b.total_price));
    } else if (sortOption === 'high-to-low') {
        filtered.sort((a, b) => parseFloat(b.total_price) - parseFloat(a.total_price));
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="padding: 40px; text-align: center; color: var(--text-secondary);"><svg width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 8px;"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg><br>No matching POS bills found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(b => {
        const isOnline = b.bill_type === 'online';
        const typeBg = isOnline ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)';
        const typeColor = isOnline ? '#3b82f6' : '#d97706';
        const typeLabel = isOnline ? 'Online' : 'In Store';

        let payBg = 'rgba(16, 185, 129, 0.1)';
        let payColor = '#10b981';
        if (b.payment_method === 'UPI' || b.payment_method === 'Online') {
            payBg = 'rgba(99, 102, 241, 0.1)'; payColor = '#6366f1';
        } else if (b.payment_method === 'Card') {
            payBg = 'rgba(139, 92, 246, 0.1)'; payColor = '#8b5cf6';
        }

        return `
            <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;">
                <td style="padding: 14px 16px; font-weight: 700; color: var(--text-primary); white-space: nowrap; font-family: monospace;">${b.bill_no}</td>
                <td style="padding: 14px 16px; color: var(--text-primary); font-weight: 600;">${escapeHTML(b.customer_name)}</td>
                <td style="padding: 14px 16px; color: var(--text-secondary); max-width: 250px;">${escapeHTML(b.medicine_name)}</td>
                <td style="padding: 14px 16px; text-align: center; color: var(--text-primary); font-weight: 600;">${b.quantity}</td>
                <td style="padding: 14px 16px; text-align: right; font-weight: 700; color: var(--text-primary);">₹ ${parseFloat(b.total_price).toFixed(2)}</td>
                <td style="padding: 14px 16px; text-align: center;">
                    <span style="background: ${typeBg}; color: ${typeColor}; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">${typeLabel}</span>
                </td>
                <td style="padding: 14px 16px; text-align: center; color: var(--text-secondary); white-space: nowrap;">${b.bill_date}</td>
                <td style="padding: 14px 16px; text-align: center;">
                    <span style="background: ${payBg}; color: ${payColor}; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">${b.payment_method}</span>
                </td>
                <td style="padding: 14px 16px; text-align: center; white-space: nowrap;">
                    <button onclick="openEditBillModal(${b.id})" style="background: transparent; color: var(--color-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; margin-right: 4px;" onmouseover="this.style.background='var(--color-primary-glow)'" onmouseout="this.style.background='transparent'">
                        Edit
                    </button>
                    <button onclick="deleteBillItem(${b.id})" style="background: transparent; color: #ef4444; border: 1px solid var(--border-color); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; margin-right: 4px;" onmouseover="this.style.background='rgba(239,68,68,0.05)'" onmouseout="this.style.background='transparent'">
                        Delete
                    </button>
                    <button onclick="printBillReceipt(${b.id})" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 6px; padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.15);">
                        Print
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

let createBillItemsList = [];
let editBillItemsList = [];

function calculateCreateBillTotal() {
    let subtotal = 0;
    createBillItemsList.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    document.getElementById('bill_subtotal').value = subtotal.toFixed(2);

    const sgstPercent = parseFloat(document.getElementById('bill_sgst').value) || 0;
    const cgstPercent = parseFloat(document.getElementById('bill_cgst').value) || 0;
    const discountPercent = parseFloat(document.getElementById('bill_discount').value) || 0;

    const sgstAmount = subtotal * (sgstPercent / 100);
    const cgstAmount = subtotal * (cgstPercent / 100);
    const discountAmount = subtotal * (discountPercent / 100);

    const grandTotal = subtotal + sgstAmount + cgstAmount - discountAmount;
    document.getElementById('bill_total').value = grandTotal.toFixed(2);
}

function renderCreateBillItems() {
    const tbody = document.getElementById('create_bill_items_tbody');
    if (!tbody) return;
    if (createBillItemsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary);">No items added yet.</td></tr>';
        document.getElementById('bill_subtotal').value = '0.00';
        document.getElementById('bill_total').value = '0.00';
        return;
    }
    let html = '';
    createBillItemsList.forEach((item, idx) => {
        const subtotal = item.price * item.quantity;
        html += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; color: var(--text-primary); font-weight: 600;">${escapeHTML(item.medicine_name)}</td>
                <td style="padding: 8px 10px; text-align: right; color: var(--text-primary);">₹ ${item.price.toFixed(2)}</td>
                <td style="padding: 8px 10px; text-align: center; color: var(--text-primary); font-weight: 600;">${item.quantity}</td>
                <td style="padding: 8px 10px; text-align: right; color: var(--text-primary); font-weight: 700;">₹ ${subtotal.toFixed(2)}</td>
                <td style="padding: 8px 10px; text-align: center;">
                    <button type="button" onclick="removeMedicineFromCreateBill(${idx})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; font-weight: bold;">✕</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
    calculateCreateBillTotal();
}

function renderCreateBillMedicineDropdown(filtered) {
    const panel = document.getElementById('bill_medicine_dropdown_panel');
    if (!panel) return;
    if (filtered.length === 0) {
        panel.innerHTML = '<div style="padding: 8px 10px; color: #94a3b8; font-size: 12px;">No medicines found</div>';
        return;
    }
    panel.innerHTML = filtered.map(m => `
        <div class="create-bill-dropdown-item" data-id="${m.medicine_id}" data-price="${m.price}" data-name="${escapeHTML(m.name)}" style="padding: 8px 10px; cursor: pointer; font-size: 12px; color: #0f172a; transition: background 0.15s ease; border-bottom: 1px solid #f1f5f9;">
            <strong style="color: #0f172a;">${escapeHTML(m.name)}</strong>
            <span style="color: #d97706; font-weight: 600; margin-left: 6px;">₹${parseFloat(m.price).toFixed(2)}</span>
            <span style="color: #64748b; font-size: 10px; margin-left: 6px;">(Stock: ${m.quantity})</span>
        </div>
    `).join('');

    panel.querySelectorAll('.create-bill-dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const price = this.getAttribute('data-price');
            const name = this.getAttribute('data-name');

            document.getElementById('bill_medicine_select').value = id;
            document.getElementById('bill_medicine_select').setAttribute('data-price', price);
            document.getElementById('bill_medicine_search').value = `${name} (₹${parseFloat(price).toFixed(2)})`;

            panel.style.display = 'none';
        });
    });
}

function renderEditBillMedicineDropdown(filtered) {
    const panel = document.getElementById('edit_bill_medicine_dropdown_panel');
    if (!panel) return;
    if (filtered.length === 0) {
        panel.innerHTML = '<div style="padding: 8px 10px; color: #94a3b8; font-size: 12px;">No medicines found</div>';
        return;
    }
    panel.innerHTML = filtered.map(m => `
        <div class="edit-bill-dropdown-item" data-id="${m.medicine_id}" data-price="${m.price}" data-name="${escapeHTML(m.name)}" style="padding: 8px 10px; cursor: pointer; font-size: 12px; color: #0f172a; transition: background 0.15s ease; border-bottom: 1px solid #f1f5f9;">
            <strong style="color: #0f172a;">${escapeHTML(m.name)}</strong>
            <span style="color: #d97706; font-weight: 600; margin-left: 6px;">₹${parseFloat(m.price).toFixed(2)}</span>
            <span style="color: #64748b; font-size: 10px; margin-left: 6px;">(Stock: ${m.quantity})</span>
        </div>
    `).join('');

    panel.querySelectorAll('.edit-bill-dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const price = this.getAttribute('data-price');
            const name = this.getAttribute('data-name');

            document.getElementById('edit_bill_medicine_select').value = id;
            document.getElementById('edit_bill_medicine_select').setAttribute('data-price', price);
            document.getElementById('edit_bill_medicine_search').value = `${name} (₹${parseFloat(price).toFixed(2)})`;

            panel.style.display = 'none';
        });
    });
}

function addMedicineToCreateBillList() {
    const hiddenInput = document.getElementById('bill_medicine_select');
    const qtyInput = document.getElementById('bill_quantity');

    if (!hiddenInput || !hiddenInput.value) {
        alert('Please select a medicine first!');
        return;
    }
    const medId = parseInt(hiddenInput.value);
    const price = parseFloat(hiddenInput.getAttribute('data-price')) || 0;
    const qty = parseInt(qtyInput.value) || 1;

    const dbMed = dbMedicines.find(m => m.medicine_id === medId);
    const medName = dbMed ? dbMed.name : 'Unknown';

    if (qty <= 0) {
        alert('Quantity must be greater than 0!');
        return;
    }

    const existing = createBillItemsList.find(item => item.medicine_id === medId);
    if (existing) {
        existing.quantity += qty;
    } else {
        createBillItemsList.push({
            medicine_id: medId,
            medicine_name: medName,
            price: price,
            quantity: qty
        });
    }
    renderCreateBillItems();

    hiddenInput.value = '';
    hiddenInput.removeAttribute('data-price');
    document.getElementById('bill_medicine_search').value = '';
    qtyInput.value = 1;
}

function removeMedicineFromCreateBill(idx) {
    createBillItemsList.splice(idx, 1);
    renderCreateBillItems();
}

function calculateEditBillTotal() {
    let subtotal = 0;
    editBillItemsList.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    document.getElementById('edit_bill_subtotal').value = subtotal.toFixed(2);

    const sgstPercent = parseFloat(document.getElementById('edit_bill_sgst').value) || 0;
    const cgstPercent = parseFloat(document.getElementById('edit_bill_cgst').value) || 0;
    const discountPercent = parseFloat(document.getElementById('edit_bill_discount').value) || 0;

    const sgstAmount = subtotal * (sgstPercent / 100);
    const cgstAmount = subtotal * (cgstPercent / 100);
    const discountAmount = subtotal * (discountPercent / 100);

    const grandTotal = subtotal + sgstAmount + cgstAmount - discountAmount;
    document.getElementById('edit_bill_total').value = grandTotal.toFixed(2);
}

function renderEditBillItems() {
    const tbody = document.getElementById('edit_bill_items_tbody');
    if (!tbody) return;
    if (editBillItemsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary);">No items added yet.</td></tr>';
        document.getElementById('edit_bill_subtotal').value = '0.00';
        document.getElementById('edit_bill_total').value = '0.00';
        return;
    }
    let html = '';
    editBillItemsList.forEach((item, idx) => {
        const subtotal = item.price * item.quantity;
        html += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; color: var(--text-primary); font-weight: 600;">${escapeHTML(item.medicine_name)}</td>
                <td style="padding: 8px 10px; text-align: right; color: var(--text-primary);">₹ ${item.price.toFixed(2)}</td>
                <td style="padding: 8px 10px; text-align: center; color: var(--text-primary); font-weight: 600;">${item.quantity}</td>
                <td style="padding: 8px 10px; text-align: right; color: var(--text-primary); font-weight: 700;">₹ ${subtotal.toFixed(2)}</td>
                <td style="padding: 8px 10px; text-align: center;">
                    <button type="button" onclick="removeMedicineFromEditBill(${idx})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; font-weight: bold;">✕</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
    calculateEditBillTotal();
}

function addMedicineToEditBillList() {
    const hiddenInput = document.getElementById('edit_bill_medicine_select');
    const qtyInput = document.getElementById('edit_bill_quantity');

    if (!hiddenInput || !hiddenInput.value) {
        alert('Please select a medicine first!');
        return;
    }
    const medId = parseInt(hiddenInput.value);
    const price = parseFloat(hiddenInput.getAttribute('data-price')) || 0;
    const qty = parseInt(qtyInput.value) || 1;

    const dbMed = dbMedicines.find(m => m.medicine_id === medId);
    const medName = dbMed ? dbMed.name : 'Unknown';

    if (qty <= 0) {
        alert('Quantity must be greater than 0!');
        return;
    }

    const existing = editBillItemsList.find(item => item.medicine_id === medId);
    if (existing) {
        existing.quantity += qty;
    } else {
        editBillItemsList.push({
            medicine_id: medId,
            medicine_name: medName,
            price: price,
            quantity: qty
        });
    }
    renderEditBillItems();

    hiddenInput.value = '';
    hiddenInput.removeAttribute('data-price');
    document.getElementById('edit_bill_medicine_search').value = '';
    qtyInput.value = 1;
}

function removeMedicineFromEditBill(idx) {
    editBillItemsList.splice(idx, 1);
    renderEditBillItems();
}

function populateMedicinesDropdowns() {
    // Replaced with custom searchable medicine dropdown panels
}

function openCreateBillModal() {
    const modal = document.getElementById('createBillModal');
    if (modal) {
        document.getElementById('createBillForm').reset();
        createBillItemsList = [];

        document.getElementById('bill_sgst').value = '0';
        document.getElementById('bill_cgst').value = '0';
        document.getElementById('bill_discount').value = '0';
        document.getElementById('bill_subtotal').value = '0.00';
        document.getElementById('bill_total').value = '0.00';

        document.getElementById('bill_medicine_select').value = '';
        document.getElementById('bill_medicine_select').removeAttribute('data-price');
        document.getElementById('bill_medicine_search').value = '';

        renderCreateBillItems();

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bill_date').value = today;

        modal.style.display = 'flex';
    }
}

function closeCreateBillModal() {
    const modal = document.getElementById('createBillModal');
    if (modal) modal.style.display = 'none';
}

function openEditBillModal(billId) {
    const bill = pharmacyBillsList.find(b => b.id === billId);
    if (!bill) return;

    document.getElementById('edit_bill_id').value = bill.id;
    document.getElementById('edit_bill_cust_name').value = bill.customer_name;

    editBillItemsList = (bill.items || []).map(item => ({
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        price: item.price,
        quantity: item.quantity
    }));

    document.getElementById('edit_bill_sgst').value = bill.sgst || 0;
    document.getElementById('edit_bill_cgst').value = bill.cgst || 0;
    document.getElementById('edit_bill_discount').value = bill.discount || 0;

    document.getElementById('edit_bill_medicine_select').value = '';
    document.getElementById('edit_bill_medicine_select').removeAttribute('data-price');
    document.getElementById('edit_bill_medicine_search').value = '';

    renderEditBillItems();

    document.getElementById('edit_bill_date').value = bill.bill_date;
    document.getElementById('edit_bill_type_select').value = bill.bill_type;
    document.getElementById('edit_bill_payment').value = bill.payment_method;

    const modal = document.getElementById('editBillModal');
    if (modal) modal.style.display = 'flex';
}

function closeEditBillModal() {
    const modal = document.getElementById('editBillModal');
    if (modal) modal.style.display = 'none';
}

function deleteBillItem(billId) {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
    fetch('/pharmacies/bills/delete/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ id: billId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadPharmacyBills();
                loadPharmacyInventory();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => {
            console.error('Failed to delete invoice:', err);
            alert('Failed to delete invoice.');
        });
}

function printBillReceipt(billId) {
    const bill = pharmacyBillsList.find(b => b.id === billId);
    if (!bill) return;

    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the receipt.');
        return;
    }

    const storeName = document.getElementById('overview_pharmacy_name')?.textContent || 'Pharmacy Store';
    const address = document.getElementById('addressInput')?.value || '';
    const city = document.getElementById('cityInput')?.value || '';
    const pincode = document.getElementById('pincodeInput')?.value || '';
    const licenseNumber = document.getElementById('set_license')?.value || 'N/A';

    let dateFormatted = bill.bill_date;
    try {
        const dObj = new Date(bill.bill_date);
        if (!isNaN(dObj.getTime())) {
            dateFormatted = dObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    } catch (e) { }

    let itemsHTML = '';
    (bill.items || []).forEach((item, index) => {
        itemsHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHTML(item.medicine_name)}</strong></td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹ ${parseFloat(item.subtotal || (item.price * item.quantity)).toFixed(2)}</td>
            </tr>
        `;
    });

    const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice ${bill.bill_no}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; font-size: 14px; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
            .store-title { font-size: 24px; font-weight: 800; color: #d97706; margin: 0; }
            .store-details { font-size: 12px; color: #666; margin-top: 5px; line-height: 1.4; }
            .inv-meta { text-align: right; line-height: 1.6; }
            .inv-meta h2 { margin: 0 0 5px 0; color: #1e293b; font-size: 20px; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .details-table th { background: #f8fafc; color: #475569; text-transform: uppercase; font-size: 11px; font-weight: 700; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
            .details-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
            .total-row { display: flex; justify-content: flex-end; margin-top: 30px; font-size: 16px; font-weight: bold; }
            .total-box { border-top: 2px solid #1e293b; padding-top: 10px; width: 250px; text-align: right; }
            .footer { text-align: center; margin-top: 50px; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            @media print {
                body { padding: 0; }
                .invoice-box { border: none; box-shadow: none; padding: 0; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="header">
                <div>
                    <div class="store-title">${escapeHTML(storeName)}</div>
                    <div class="store-details">
                        ${escapeHTML(address)}<br>
                        ${escapeHTML(city)} - ${escapeHTML(pincode)}<br>
                        License No: ${escapeHTML(licenseNumber)}
                    </div>
                </div>
                <div class="inv-meta">
                    <h2>INVOICE</h2>
                    <strong>Invoice No:</strong> ${escapeHTML(bill.bill_no)}<br>
                    <strong>Date:</strong> ${escapeHTML(dateFormatted)}<br>
                    <strong>Type:</strong> ${escapeHTML(bill.bill_type.toUpperCase())}<br>
                    <strong>Payment:</strong> ${escapeHTML(bill.payment_method)}
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="margin: 0 0 5px 0; color: #475569;">Billed To:</h4>
                <strong style="font-size: 15px; color: #0f172a;">${escapeHTML(bill.customer_name)}</strong>
            </div>
            
            <table class="details-table">
                <thead>
                    <tr>
                        <th style="width: 10%;">#</th>
                        <th style="width: 50%;">Medicine Name / Description</th>
                        <th style="width: 15%; text-align: center;">Qty</th>
                        <th style="width: 25%; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <div class="total-row">
                <div class="total-box" style="width: 320px; border-top: 2px solid #1e293b; padding-top: 15px;">
                    <table style="width: 100%; font-size: 14px; line-height: 1.8;">
                        <tr>
                            <td style="text-align: left; color: #475569;">Subtotal:</td>
                            <td style="text-align: right; font-weight: 600;">₹ ${parseFloat(bill.subtotal || bill.total_price).toFixed(2)}</td>
                        </tr>
                        ${parseFloat(bill.sgst) > 0 ? `
                        <tr>
                            <td style="text-align: left; color: #475569;">SGST (${bill.sgst}%):</td>
                            <td style="text-align: right; font-weight: 600;">+ ₹ ${(parseFloat(bill.subtotal || bill.total_price) * parseFloat(bill.sgst) / 100).toFixed(2)}</td>
                        </tr>` : ''}
                        ${parseFloat(bill.cgst) > 0 ? `
                        <tr>
                            <td style="text-align: left; color: #475569;">CGST (${bill.cgst}%):</td>
                            <td style="text-align: right; font-weight: 600;">+ ₹ ${(parseFloat(bill.subtotal || bill.total_price) * parseFloat(bill.cgst) / 100).toFixed(2)}</td>
                        </tr>` : ''}
                        ${parseFloat(bill.discount) > 0 ? `
                        <tr>
                            <td style="text-align: left; color: #475569;">Discount (${bill.discount}%):</td>
                            <td style="text-align: right; font-weight: 600; color: #16a34a;">- ₹ ${(parseFloat(bill.subtotal || bill.total_price) * parseFloat(bill.discount) / 100).toFixed(2)}</td>
                        </tr>` : ''}
                        <tr style="border-top: 2px solid #e2e8f0; font-size: 16px; font-weight: bold;">
                            <td style="text-align: left; padding-top: 10px;">Grand Total:</td>
                            <td style="text-align: right; padding-top: 10px; color: #d97706;">₹ ${parseFloat(bill.total_price).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <div class="footer">
                Thank you for your business!<br>
                Wish you a speedy recovery.
            </div>
        </div>
        <script>
            window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
            }
        <\/script>
    </body>
    </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
}

// ============ DOM CONTENT LOADED BINDINGS FOR BILLING ============

document.addEventListener("DOMContentLoaded", function () {
    const createForm = document.getElementById('createBillForm');
    if (createForm) {
        createForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (createBillItemsList.length === 0) {
                alert('Please add at least one medicine to the bill!');
                return;
            }
            const body = {
                customer_name: document.getElementById('bill_cust_name').value,
                user_id: null,
                bill_date: document.getElementById('bill_date').value,
                bill_type: document.getElementById('bill_type_select').value,
                payment_method: document.getElementById('bill_payment').value,
                sgst: parseFloat(document.getElementById('bill_sgst').value) || 0,
                cgst: parseFloat(document.getElementById('bill_cgst').value) || 0,
                discount: parseFloat(document.getElementById('bill_discount').value) || 0,
                items: createBillItemsList
            };

            fetch('/pharmacies/bills/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(body)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        closeCreateBillModal();
                        loadPharmacyBills();
                        loadPharmacyInventory();
                    } else {
                        alert('Error: ' + data.error);
                    }
                })
                .catch(err => {
                    console.error('Error generating bill:', err);
                    alert('Failed to generate bill.');
                });
        });
    }

    const editForm = document.getElementById('editBillForm');
    if (editForm) {
        editForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (editBillItemsList.length === 0) {
                alert('Please add at least one medicine to the bill!');
                return;
            }
            const body = {
                id: parseInt(document.getElementById('edit_bill_id').value),
                customer_name: document.getElementById('edit_bill_cust_name').value,
                user_id: null,
                bill_date: document.getElementById('edit_bill_date').value,
                bill_type: document.getElementById('edit_bill_type_select').value,
                payment_method: document.getElementById('edit_bill_payment').value,
                sgst: parseFloat(document.getElementById('edit_bill_sgst').value) || 0,
                cgst: parseFloat(document.getElementById('edit_bill_cgst').value) || 0,
                discount: parseFloat(document.getElementById('edit_bill_discount').value) || 0,
                items: editBillItemsList
            };

            fetch('/pharmacies/bills/edit/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(body)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        closeEditBillModal();
                        loadPharmacyBills();
                        loadPharmacyInventory();
                    } else {
                        alert('Error: ' + data.error);
                    }
                })
                .catch(err => {
                    console.error('Error updating bill:', err);
                    alert('Failed to update bill.');
                });
        });
    }

    // Searchable medicine dropdown for Create Bill
    const createMedSearch = document.getElementById('bill_medicine_search');
    const createDropdownPanel = document.getElementById('bill_medicine_dropdown_panel');
    if (createMedSearch && createDropdownPanel) {
        createMedSearch.addEventListener('focus', function () {
            createDropdownPanel.style.display = 'block';
            renderCreateBillMedicineDropdown(dbMedicines);
        });
        createMedSearch.addEventListener('input', function () {
            createDropdownPanel.style.display = 'block';
            const query = this.value.toLowerCase().trim();
            const filtered = dbMedicines.filter(m =>
                m.name.toLowerCase().includes(query)
            );
            renderCreateBillMedicineDropdown(filtered);
        });
    }

    // Searchable medicine dropdown for Edit Bill
    const editMedSearch = document.getElementById('edit_bill_medicine_search');
    const editDropdownPanel = document.getElementById('edit_bill_medicine_dropdown_panel');
    if (editMedSearch && editDropdownPanel) {
        editMedSearch.addEventListener('focus', function () {
            editDropdownPanel.style.display = 'block';
            renderEditBillMedicineDropdown(dbMedicines);
        });
        editMedSearch.addEventListener('input', function () {
            editDropdownPanel.style.display = 'block';
            const query = this.value.toLowerCase().trim();
            const filtered = dbMedicines.filter(m =>
                m.name.toLowerCase().includes(query)
            );
            renderEditBillMedicineDropdown(filtered);
        });
    }

    // Close POS medicine dropdowns when clicking outside
    document.addEventListener('click', function (e) {
        if (createMedSearch && createDropdownPanel) {
            if (!createMedSearch.contains(e.target) && !createDropdownPanel.contains(e.target)) {
                createDropdownPanel.style.display = 'none';
            }
        }
        if (editMedSearch && editDropdownPanel) {
            if (!editMedSearch.contains(e.target) && !editDropdownPanel.contains(e.target)) {
                editDropdownPanel.style.display = 'none';
            }
        }
    });
});

function openAddMedicineModal() {
    const selectEl = document.getElementById('add_med_select');
    const categoryEl = document.getElementById('add_med_category');
    const manufacturerEl = document.getElementById('add_med_manufacturer');
    const form = document.getElementById('addMedicineForm');

    if (form) form.reset();
    const searchEl = document.getElementById('add_med_search');
    if (searchEl) searchEl.value = '';
    if (selectEl) selectEl.value = '';
    if (categoryEl) categoryEl.value = '';
    if (manufacturerEl) manufacturerEl.value = '';

    const dropdownPanel = document.getElementById('add_med_dropdown_panel');
    if (dropdownPanel) dropdownPanel.style.display = 'none';

    // Set max date for mfg to today and min date for expiry to tomorrow using local timezone
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const t_yyyy = tomorrow.getFullYear();
    const t_mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const t_dd = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${t_yyyy}-${t_mm}-${t_dd}`;

    document.getElementById('add_med_mfg').max = todayStr;
    document.getElementById('add_med_expiry').min = tomorrowStr;

    // Fetch public medicines database
    fetch('/api/accounts/public-medicines/')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.medicines) {
                globalMedicines = data.medicines;
                if (typeof renderDropdownOptions === 'function') {
                    renderDropdownOptions(globalMedicines);
                }
            }
        })
        .catch(err => console.error("Failed to load medicines list:", err));

    const modal = document.getElementById('addMedicineModal');
    if (modal) modal.style.display = 'flex';
}

function closeAddMedicineModal() {
    const modal = document.getElementById('addMedicineModal');
    if (modal) modal.style.display = 'none';
}

function openEditInventoryModal(itemId, currentStock, currentPrice, currentMfg, currentExpiry) {
    const editId = document.getElementById('edit_item_id');
    const editStock = document.getElementById('edit_med_stock');
    const editPrice = document.getElementById('edit_med_price');
    const editMfg = document.getElementById('edit_med_mfg');
    const editExpiry = document.getElementById('edit_med_expiry');

    if (editId) editId.value = itemId;
    if (editStock) editStock.value = currentStock;
    if (editPrice) editPrice.value = currentPrice;
    if (editMfg) editMfg.value = currentMfg;
    if (editExpiry) editExpiry.value = currentExpiry;

    // Set max date for mfg to today and min date for expiry to tomorrow using local timezone
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const t_yyyy = tomorrow.getFullYear();
    const t_mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const t_dd = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${t_yyyy}-${t_mm}-${t_dd}`;

    if (editMfg) editMfg.max = todayStr;
    if (editExpiry) editExpiry.min = tomorrowStr;

    const modal = document.getElementById('editInventoryModal');
    if (modal) modal.style.display = 'flex';
}

function closeEditInventoryModal() {
    const modal = document.getElementById('editInventoryModal');
    if (modal) modal.style.display = 'none';
}

function deleteInventoryItem(itemId) {
    if (!confirm("Are you sure you want to delete this medicine stock from your inventory?")) {
        return;
    }
    fetch('/pharmacies/inventory/delete/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ id: itemId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Medicine deleted from inventory successfully!");
                loadPharmacyInventory();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => {
            console.error("Failed to delete inventory item:", err);
            alert("Failed to delete item. Please try again.");
        });
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
        if (tabId === 'overview') {
            activeTab.style.display = 'grid'; // stats-grid uses grid
        } else {
            activeTab.style.display = 'block';
        }
    }

    // Show/hide main greeting header depending on overview tab
    const header = document.querySelector('.main-content > header');
    if (header) {
        header.style.display = (tabId === 'overview') ? 'flex' : 'none';
    }

    // Load data for specific tabs on activate
    if (tabId === 'inventory') loadPharmacyInventory();
    if (tabId === 'orders') loadPharmacyOrders();
    if (tabId === 'billing') loadPharmacyBills();
    if (tabId === 'helpdesk') loadHelpdeskTickets();
    if (tabId === 'analysis') renderPharmacyAnalytics();

    // Update active state in sidebar
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        const link = li.querySelector('a');
        if (link && link.getAttribute('href') === `#${tabId}`) {
            li.classList.add('active');
        }
    });
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
                document.getElementById('greeting').textContent = `Welcome back, ${data.user.name}!`;
                const licenseEl = document.getElementById('licenseNo');
                if (licenseEl) {
                    licenseEl.textContent = data.user.license_number || 'N/A';
                }
                const overviewProfileEl = document.getElementById('overview_pharmacy_name');
                if (overviewProfileEl) {
                    overviewProfileEl.textContent = data.user.name || 'Store Profile';
                }

                const user = data.user;
                isProfileComplete = !!(user.address && user.city && user.state && user.pincode && user.open_from && user.closes_from && user.checkout_option);

                // Populate Profile settings form
                document.getElementById('set_name').value = user.name || '';
                document.getElementById('set_license').value = user.license_number || '';
                document.getElementById('set_mobile').value = user.mobile_number || '';
                document.getElementById('set_email').value = user.email || '';
                document.getElementById('set_address').value = user.address || '';
                document.getElementById('set_city').value = user.city || '';
                document.getElementById('set_state').value = user.state || '';
                document.getElementById('set_pincode').value = user.pincode || '';
                document.getElementById('set_open_from').value = user.open_from || '';
                document.getElementById('set_closes_from').value = user.closes_from || '';

                const opts = (user.checkout_option || '').split(',');
                document.getElementById('set_delivery').checked = opts.includes('delivery');
                document.getElementById('set_pickup').checked = opts.includes('pickup');

                if (!isProfileComplete) {
                    document.getElementById('profile-alert-container').style.display = 'block';
                    document.getElementById('closeModalBtn').style.display = 'none';
                    openProfileModal();
                } else {
                    document.getElementById('profile-alert-container').style.display = 'none';
                    document.getElementById('closeModalBtn').style.display = 'block';

                    // Populate values
                    document.getElementById('addressInput').value = user.address || '';
                    document.getElementById('cityInput').value = user.city || '';
                    document.getElementById('stateInput').value = user.state || '';
                    document.getElementById('pincodeInput').value = user.pincode || '';
                    document.getElementById('openFromInput').value = user.open_from || '';
                    document.getElementById('closesFromInput').value = user.closes_from || '';

                    document.getElementById('deliveryCheckbox').checked = opts.includes('delivery');
                    document.getElementById('pickupCheckbox').checked = opts.includes('pickup');
                }

                // Trigger tab render based on current hash
                handleHashChange();
                loadPharmacyInventory();
                loadPharmacyBills();
                loadPharmacyOrders();

                // Billing System search and filter listeners
                const billSearchInput = document.getElementById('bill_search_input');
                const billSearchBtn = document.getElementById('bill_search_btn');
                const billDateFilter = document.getElementById('bill_date_filter');
                const billSortSelect = document.getElementById('bill_sort_select');

                if (billSearchInput) {
                    billSearchInput.addEventListener('input', renderPharmacyBills);
                    billSearchInput.addEventListener('keypress', function (e) {
                        if (e.key === 'Enter') {
                            renderPharmacyBills();
                        }
                    });
                }
                if (billSearchBtn) {
                    billSearchBtn.addEventListener('click', renderPharmacyBills);
                }
                if (billDateFilter) {
                    billDateFilter.addEventListener('change', renderPharmacyBills);
                }
                if (billSortSelect) {
                    billSortSelect.addEventListener('change', renderPharmacyBills);
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

            const address = document.getElementById('addressInput').value.trim();
            const city = document.getElementById('cityInput').value.trim();
            const state = document.getElementById('stateInput').value.trim();
            const pincode = document.getElementById('pincodeInput').value.trim();
            const open_from = document.getElementById('openFromInput').value;
            const closes_from = document.getElementById('closesFromInput').value;

            const delivery = document.getElementById('deliveryCheckbox').checked;
            const pickup = document.getElementById('pickupCheckbox').checked;

            if (!delivery && !pickup) {
                alert("Please select at least one checkout option (Delivery or Pickup)!");
                return;
            }

            const checkout_option = [
                delivery ? 'delivery' : null,
                pickup ? 'pickup' : null
            ].filter(Boolean).join(',');

            const payload = {
                name,
                mobile_number,
                email,
                address,
                city,
                state,
                pincode,
                open_from,
                closes_from,
                checkout_option
            };

            fetch('/pharmacies/update-pharmacy-profile/', {
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
                        alert("Profile updated successfully!");
                        isProfileComplete = true;
                        document.getElementById('profile-alert-container').style.display = 'none';
                        document.getElementById('closeModalBtn').style.display = 'block';
                        document.getElementById('profileModal').style.display = 'none';
                        document.getElementById('greeting').textContent = `Welcome back, ${name}!`;
                        const overviewProfileEl = document.getElementById('overview_pharmacy_name');
                        if (overviewProfileEl) {
                            overviewProfileEl.textContent = name;
                        }

                        // Sync settings form as well
                        document.getElementById('set_address').value = address;
                        document.getElementById('set_city').value = city;
                        document.getElementById('set_state').value = state;
                        document.getElementById('set_pincode').value = pincode;
                        document.getElementById('set_open_from').value = open_from;
                        document.getElementById('set_closes_from').value = closes_from;
                        document.getElementById('set_delivery').checked = delivery;
                        document.getElementById('set_pickup').checked = pickup;
                    } else {
                        alert("Error: " + data.error);
                    }
                })
                .catch(err => {
                    console.error("Profile update failed:", err);
                    alert("Failed to update profile. Please try again.");
                });
        });
    }

    // Handle profile settings form submission
    const profileSettingsForm = document.getElementById('profileSettingsForm');
    if (profileSettingsForm) {
        profileSettingsForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('set_name').value.trim();
            const mobile_number = document.getElementById('set_mobile').value.trim();
            const email = document.getElementById('set_email').value.trim();
            const address = document.getElementById('set_address').value.trim();
            const city = document.getElementById('set_city').value.trim();
            const state = document.getElementById('set_state').value.trim();
            const pincode = document.getElementById('set_pincode').value.trim();
            const open_from = document.getElementById('set_open_from').value;
            const closes_from = document.getElementById('set_closes_from').value;

            const delivery = document.getElementById('set_delivery').checked;
            const pickup = document.getElementById('set_pickup').checked;

            if (!name || !mobile_number || !email) {
                alert("Name, Mobile Number, and Email are required!");
                return;
            }

            if (!delivery && !pickup) {
                alert("Please select at least one checkout option (Delivery or Pickup)!");
                return;
            }

            const checkout_option = [
                delivery ? 'delivery' : null,
                pickup ? 'pickup' : null
            ].filter(Boolean).join(',');

            const payload = {
                name,
                mobile_number,
                email,
                address,
                city,
                state,
                pincode,
                open_from,
                closes_from,
                checkout_option
            };

            fetch('/pharmacies/update-pharmacy-profile/', {
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
                        document.getElementById('greeting').textContent = `Welcome back, ${name}!`;
                        const overviewProfileEl = document.getElementById('overview_pharmacy_name');
                        if (overviewProfileEl) {
                            overviewProfileEl.textContent = name;
                        }

                        // Sync the popup inputs as well
                        document.getElementById('addressInput').value = address;
                        document.getElementById('cityInput').value = city;
                        document.getElementById('stateInput').value = state;
                        document.getElementById('pincodeInput').value = pincode;
                        document.getElementById('openFromInput').value = open_from;
                        document.getElementById('closesFromInput').value = closes_from;
                        document.getElementById('deliveryCheckbox').checked = delivery;
                        document.getElementById('pickupCheckbox').checked = pickup;
                    } else {
                        alert("Error: " + data.error);
                    }
                })
                .catch(err => {
                    console.error("Profile settings update failed:", err);
                    alert("Failed to update profile settings. Please try again.");
                });
        });
    }

    // --- INVENTORY SECTION LOGIC ---
    const inventoryCardsGrid = document.getElementById('inventoryCardsGrid');

    function getCategoryIcon(category) {
        if (category === 'Tablet') {
            return `
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m8 16 8-8" />
                </svg>
            `;
        } else if (category === 'Capsule') {
            return `
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);">
                    <rect x="5" y="8" width="14" height="8" rx="4" />
                    <path d="M12 8v8" />
                </svg>
            `;
        } else if (category === 'Drops') {
            return `
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
                </svg>
            `;
        } else if (category === 'Syrup') {
            return `
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 22h4M12 2v4M12 6h-3v12h6V6h-3z" />
                    <path d="M9 10h6" />
                </svg>
            `;
        } else { // Injection
            return `
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m18 2 4 4M13 7l4 4M2 22l10-10M9 11l4 4" />
                </svg>
            `;
        }
    }

    renderInventory = function () {
        if (!inventoryCardsGrid) return;

        const searchQuery = document.getElementById('inv_search').value.toLowerCase().trim();
        const categoryFilter = document.getElementById('inv_category').value;
        const showLowStockOnly = document.getElementById('inv_low_stock').checked;
        const sortOption = document.getElementById('inv_sort').value;

        // 1. Filter
        let filtered = dbMedicines.filter(m => {
            const matchesSearch = m.name.toLowerCase().includes(searchQuery) || m.manufacturer.toLowerCase().includes(searchQuery);
            const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
            const matchesLowStock = !showLowStockOnly || m.quantity <= 5;
            return matchesSearch && matchesCategory && matchesLowStock;
        });

        // 2. Sort
        if (sortOption === 'low-to-high') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'high-to-low') {
            filtered.sort((a, b) => b.price - a.price);
        }

        // 3. Render
        if (filtered.length === 0) {
            inventoryCardsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 40px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: var(--glass-border);">
                    No medicines match your filter criteria.
                </div>
            `;
            return;
        }

        inventoryCardsGrid.innerHTML = filtered.map(m => {
            const isLow = m.quantity <= 5;
            const statusClass = isLow ? 'status-low' : 'status-in-stock';
            const statusText = isLow ? 'Low Stock' : 'In Stock';
            return `
                <div class="card" style="display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: 12px; background: var(--bg-glass); border: var(--glass-border); transition: all 0.2s ease; justify-content: space-between;">
                    <div>
                        <!-- Name -->
                        <h4 style="font-family: var(--font-display); font-weight: 700; font-size: 15px; margin: 0 0 8px 0; color: var(--text-primary); text-align: left; line-height: 1.4; height: 42px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${m.name}
                        </h4>
                        
                        <!-- Image Area (below name) -->
                        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%); border-radius: 8px; height: 110px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0, 0, 0, 0.05); margin-bottom: 12px; overflow: hidden; padding: 4px;">
                            ${m.image_url ? `<img src="${m.image_url}" alt="${m.name}" style="max-height: 100%; max-width: 100%; object-fit: contain; border-radius: 6px;">` : getCategoryIcon(m.category)}
                        </div>
                        
                        <!-- Details -->
                        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-secondary); text-align: left;">
                            <div><span style="color: var(--text-muted);">Mfr:</span> <strong style="color: var(--text-primary);">${m.manufacturer}</strong></div>
                            <div><span style="color: var(--text-muted);">Category:</span> <strong style="color: var(--text-primary);">${m.category}</strong></div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                                <span class="status-badge ${statusClass}" style="margin: 0; font-size: 10px; padding: 2px 6px;">${statusText}</span>
                                <span style="font-weight: 700; color: ${isLow ? 'var(--color-danger)' : 'var(--text-primary)'};">${m.quantity} units</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Price (INR) -->
                    <div style="border-top: 1px solid var(--border-color); padding-top: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                        <span style="font-size: 11px; color: var(--text-muted);">Price</span>
                        <strong style="font-size: 16px; font-weight: 800; color: var(--color-success);">₹${m.price.toFixed(2)}</strong>
                    </div>

                    <!-- Actions (Edit & Delete) -->
                    <div style="display: flex; gap: 8px; margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
                        <button onclick="openEditInventoryModal(${m.id}, ${m.quantity}, ${m.price}, '${m.mfg_date}', '${m.expiry_date}')" style="flex: 1; background: rgba(245, 158, 11, 0.1); color: var(--color-primary); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; padding: 6px 12px; font-weight: bold; cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                        </button>
                        <button onclick="deleteInventoryItem(${m.id})" style="flex: 1; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 6px 12px; font-weight: bold; cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Attach event listeners
    const invSearchInput = document.getElementById('inv_search');
    const invSearchBtn = document.getElementById('inv_search_btn');
    const invCategorySelect = document.getElementById('inv_category');
    const invLowStockCheckbox = document.getElementById('inv_low_stock');
    const invSortSelect = document.getElementById('inv_sort');

    if (invSearchInput) {
        invSearchInput.addEventListener('input', renderInventory);
        invSearchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                renderInventory();
            }
        });
    }
    if (invSearchBtn) invSearchBtn.addEventListener('click', renderInventory);
    if (invCategorySelect) invCategorySelect.addEventListener('change', renderInventory);
    if (invLowStockCheckbox) invLowStockCheckbox.addEventListener('change', renderInventory);
    if (invSortSelect) invSortSelect.addEventListener('change', renderInventory);

    // Custom searchable dropdown listeners
    const addMedSearch = document.getElementById('add_med_search');
    const dropdownPanel = document.getElementById('add_med_dropdown_panel');
    const hiddenSelect = document.getElementById('add_med_select');

    renderDropdownOptions = function (filteredMeds) {
        if (!dropdownPanel) return;
        if (filteredMeds.length === 0) {
            dropdownPanel.innerHTML = '<div style="padding: 10px 14px; color: #94a3b8; font-size: 13px;">No medicines found</div>';
            return;
        }

        dropdownPanel.innerHTML = filteredMeds.map(m => {
            const cat_db = m.category || 'tablet';
            let cat_display = cat_db.charAt(0).toUpperCase() + cat_db.slice(1);
            if (cat_display === 'Other') cat_display = 'Injection';
            return `
            <div class="dropdown-item" data-id="${m.id}" data-name="${m.name}" data-mfr="${m.manufacturer}" data-cat="${m.category}" style="padding: 10px 14px; cursor: pointer; font-size: 13px; color: #0f172a; transition: background 0.15s ease; border-bottom: 1px solid #f1f5f9;">
                <strong style="color: #0f172a;">${m.name}</strong> 
                <span style="color: #64748b; font-size: 11px;">(${m.manufacturer})</span>
                <span style="background: rgba(245,158,11,0.1); color: #d97706; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">${cat_display}</span>
            </div>
        `}).join('');

        // Add click listeners to items
        const items = dropdownPanel.querySelectorAll('.dropdown-item');
        items.forEach(item => {
            item.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const mfr = this.getAttribute('data-mfr');
                const cat = this.getAttribute('data-cat');

                // Set values
                if (hiddenSelect) hiddenSelect.value = id;
                if (addMedSearch) addMedSearch.value = `${name} (${mfr})`;

                // Set read-only info fields
                const categoryEl = document.getElementById('add_med_category');
                const manufacturerEl = document.getElementById('add_med_manufacturer');

                const category_db = cat || 'tablet';
                let category_display = category_db.charAt(0).toUpperCase() + category_db.slice(1);
                if (category_display === 'Other') {
                    category_display = 'Injection';
                }

                if (categoryEl) categoryEl.value = category_display;
                if (manufacturerEl) manufacturerEl.value = mfr || '';

                // Hide panel
                dropdownPanel.style.display = 'none';
            });
        });
    };

    // Show panel when clicking/focusing search input
    if (addMedSearch) {
        addMedSearch.addEventListener('focus', function () {
            dropdownPanel.style.display = 'block';
            renderDropdownOptions(globalMedicines);
        });

        addMedSearch.addEventListener('input', function () {
            dropdownPanel.style.display = 'block';
            const query = this.value.toLowerCase().trim();
            const filtered = globalMedicines.filter(m =>
                m.name.toLowerCase().includes(query) ||
                m.manufacturer.toLowerCase().includes(query)
            );
            renderDropdownOptions(filtered);
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (addMedSearch && dropdownPanel) {
            if (!addMedSearch.contains(e.target) && !dropdownPanel.contains(e.target)) {
                dropdownPanel.style.display = 'none';
            }
        }
    });

    // Form submit listener for adding medicine with date and price validations
    const addMedicineForm = document.getElementById('addMedicineForm');
    if (addMedicineForm) {
        addMedicineForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const medicine_id = document.getElementById('add_med_select').value;
            const mfg_date_str = document.getElementById('add_med_mfg').value;
            const expiry_date_str = document.getElementById('add_med_expiry').value;
            const stock_str = document.getElementById('add_med_stock').value;
            const price_str = document.getElementById('add_med_price').value;

            if (!medicine_id || !mfg_date_str || !expiry_date_str || !stock_str || !price_str) {
                alert("All fields are required!");
                return;
            }

            const stock = parseInt(stock_str, 10);
            const price = parseFloat(price_str);

            if (isNaN(stock) || stock < 0) {
                alert("Stock quantity must be a non-negative integer!");
                return;
            }
            if (isNaN(price) || price < 0) {
                alert("Price must be a non-negative number!");
                return;
            }

            const mfgDate = new Date(mfg_date_str);
            const expiryDate = new Date(expiry_date_str);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            mfgDate.setHours(0, 0, 0, 0);
            expiryDate.setHours(0, 0, 0, 0);

            if (mfgDate > today) {
                alert("Manufacturing date cannot be greater than today's date!");
                return;
            }
            if (expiryDate <= today) {
                alert("Expiry date must be in the future (not today or previous dates)!");
                return;
            }
            if (expiryDate <= mfgDate) {
                alert("Expiry date cannot be before or equal to the Manufacturing date!");
                return;
            }

            // Call API to save to database
            fetch('/pharmacies/inventory/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    medicine_id: parseInt(medicine_id, 10),
                    mfg_date: mfg_date_str,
                    expiry_date: expiry_date_str,
                    stock: stock,
                    price: price
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Medicine added to inventory successfully!");
                        closeAddMedicineModal();
                        loadPharmacyInventory(); // Reload dynamic list
                    } else {
                        alert("Error: " + data.error);
                    }
                })
                .catch(err => {
                    console.error("Failed to add medicine:", err);
                    alert("An error occurred while adding medicine.");
                });
        });
    }

    // Form submit listener for editing inventory stock/price/dates
    const editInventoryForm = document.getElementById('editInventoryForm');
    if (editInventoryForm) {
        editInventoryForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const itemId = document.getElementById('edit_item_id').value;
            const stockStr = document.getElementById('edit_med_stock').value;
            const priceStr = document.getElementById('edit_med_price').value;
            const mfg_date_str = document.getElementById('edit_med_mfg').value;
            const expiry_date_str = document.getElementById('edit_med_expiry').value;

            if (!itemId || !stockStr || !priceStr || !mfg_date_str || !expiry_date_str) {
                alert("All fields are required!");
                return;
            }

            const stock = parseInt(stockStr, 10);
            const price = parseFloat(priceStr);

            if (isNaN(stock) || stock < 0) {
                alert("Stock quantity must be a non-negative integer!");
                return;
            }
            if (isNaN(price) || price < 0) {
                alert("Price must be a non-negative number!");
                return;
            }

            const mfgDate = new Date(mfg_date_str);
            const expiryDate = new Date(expiry_date_str);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            mfgDate.setHours(0, 0, 0, 0);
            expiryDate.setHours(0, 0, 0, 0);

            if (mfgDate > today) {
                alert("Manufacturing date cannot be greater than today's date!");
                return;
            }
            if (expiryDate <= today) {
                alert("Expiry date must be in the future (not today or previous dates)!");
                return;
            }
            if (expiryDate <= mfgDate) {
                alert("Expiry date cannot be before or equal to the Manufacturing date!");
                return;
            }

            fetch('/pharmacies/inventory/edit/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    id: parseInt(itemId, 10),
                    stock: stock,
                    price: price,
                    mfg_date: mfg_date_str,
                    expiry_date: expiry_date_str
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Inventory updated successfully!");
                        closeEditInventoryModal();
                        loadPharmacyInventory();
                    } else {
                        alert("Error: " + data.error);
                    }
                })
                .catch(err => {
                    console.error("Failed to edit inventory:", err);
                    alert("An error occurred while updating inventory.");
                });
        });
    }

    // Initial call
    renderInventory();
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
                if (typeof loadHelpdeskTickets === 'function') loadHelpdeskTickets();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => {
            console.error('Error sending message:', err);
            alert('Failed to send message.');
        });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function escapeJSVal(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
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

// ============ PHARMACY ORDERS TAB ============
let allPharmacyOrders = [];

function loadPharmacyOrders() {
    const tbody = document.getElementById('orders_tbody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                <span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 8px;">⏳</span> Loading orders...
            </td>
        </tr>
    `;

    fetch('/pharmacies/orders/pharmacy/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                allPharmacyOrders = data.orders || [];
                renderPharmacyOrders(allPharmacyOrders);

                // Update overview card counts dynamically
                let processedCount = 0;
                let activeCount = 0;
                allPharmacyOrders.forEach(o => {
                    const st = (o.status || '').toLowerCase();
                    if (st === 'delivered') {
                        processedCount++;
                    } else if (st !== 'cancelled') {
                        activeCount++;
                    }
                });

                const procEl = document.getElementById('overview_processed_orders');
                if (procEl) procEl.textContent = processedCount;

                const urgEl = document.getElementById('overview_urgent_orders');
                if (urgEl) urgEl.textContent = activeCount;
            } else {
                tbody.innerHTML = `<tr><td colspan="7" style="padding: 40px; text-align: center; color: #ef4444;">Failed to load orders: ${escapeHTML(data.error)}</td></tr>`;
            }
        })
        .catch(err => {
            console.error('Error fetching orders:', err);
            tbody.innerHTML = `<tr><td colspan="7" style="padding: 40px; text-align: center; color: #ef4444;">Error connecting to server.</td></tr>`;
        });
}

function renderPharmacyOrders(ordersList) {
    const tbody = document.getElementById('orders_tbody');
    if (!tbody) return;

    if (ordersList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="padding: 40px; text-align: center; color: var(--text-secondary);">No incoming orders found.</td></tr>`;
        return;
    }

    tbody.innerHTML = ordersList.map(o => {
        const isDelivered = o.status.toLowerCase() === 'delivered';
        const statusBadgeColor = o.status.toLowerCase() === 'delivered' ? 'background: rgba(16, 185, 129, 0.15); color: #10b981;' : 'background: rgba(245, 158, 11, 0.15); color: #f59e0b;';
        
        // Items formatted nicely
        const itemsText = o.items.map(item => `${item.medicine_name} x${item.quantity}`).join(', ');

        return `
            <tr>
                <td style="font-weight: bold; padding: 12px 16px;">${escapeHTML(o.order_id)}</td>
                <td style="padding: 12px 16px;">${escapeHTML(o.customer_name)}</td>
                <td style="padding: 12px 16px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(itemsText)}">${escapeHTML(itemsText)}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <span style="font-weight: bold; color: var(--color-primary);">
                        Online (${escapeHTML(o.delivery_method)})
                    </span>
                </td>
                <td style="padding: 12px 16px; text-align: center;">
                    <span class="status-badge" style="${statusBadgeColor}">
                        ${escapeHTML(o.status.charAt(0).toUpperCase() + o.status.slice(1))}
                    </span>
                </td>
                <td style="padding: 12px 16px; text-align: right; font-weight: bold;">₹${o.total_price.toFixed(2)}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: center; width: 100%;">
                        <button class="btn-action" 
                            onclick="updateOrderStatusToDelivered('${escapeJSVal(o.order_id)}')"
                            ${isDelivered ? 'disabled style="opacity: 0.5; cursor: not-allowed; padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; background-color: var(--bg-tertiary); color: var(--text-muted); border: 1px solid var(--border-color);"' : 
                            'style="background-color: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.backgroundColor=\'#10b981\';this.style.color=\'#fff\'" onmouseout="this.style.backgroundColor=\'rgba(16, 185, 129, 0.1)\';this.style.color=\'#10b981\'"'}>
                            Delivered
                        </button>
                        <button class="btn-action" 
                            style="background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.backgroundColor=\'#3b82f6\';this.style.color=\'#fff\'"
                            onmouseout="this.style.backgroundColor=\'rgba(59, 130, 246, 0.1)\';this.style.color=\'#3b82f6\'"
                            onclick="viewOrderDetails('${escapeJSVal(o.order_id)}')">
                            View
                        </button>
                        <button class="btn-action" 
                            style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.backgroundColor=\'#ef4444\';this.style.color=\'#fff\'"
                            onmouseout="this.style.backgroundColor=\'rgba(239, 68, 68, 0.1)\';this.style.color=\'#ef4444\'"
                            onclick="deletePharmacyOrder('${escapeJSVal(o.order_id)}')">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateOrderStatusToDelivered(orderId) {
    if (!confirm('Mark order ' + orderId + ' as Delivered?')) return;
    
    fetch('/pharmacies/orders/update-status/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ order_id: orderId, status: 'delivered' })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('Order marked as delivered successfully.');
            loadPharmacyOrders();
            if (typeof loadPharmacyOverviewMetrics === 'function') loadPharmacyOverviewMetrics();
        } else {
            showToast('Error: ' + data.error, 'error');
        }
    })
    .catch(err => {
        console.error('Error updating order status:', err);
        showToast('Failed to update status.', 'error');
    });
}

function deletePharmacyOrder(orderId) {
    const order = allPharmacyOrders.find(o => o.order_id === orderId);
    if (!order) return;

    const itemsList = order.items.map(item => `  - ${item.medicine_name} (${item.manufacturer}) x${item.quantity} [₹${item.price.toFixed(2)}]`).join('\n');
    
    const confirmMessage = `CONFIRM ORDER DELETION\n\n` +
        `Order ID: ${order.order_id}\n` +
        `Patient Name: ${order.customer_name}\n` +
        `Patient Phone: ${order.customer_phone}\n` +
        `Order Type: ${order.order_type} (${order.delivery_method})\n` +
        `Status: ${order.status}\n` +
        `Items Ordered:\n${itemsList}\n` +
        `Total Price: ₹${order.total_price.toFixed(2)}\n\n` +
        `Are you absolutely sure you want to delete this order? This action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    fetch('/pharmacies/orders/delete/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ order_id: orderId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('Order deleted successfully!');
            loadPharmacyOrders();
            if (typeof loadPharmacyOverviewMetrics === 'function') loadPharmacyOverviewMetrics();
        } else {
            showToast('Error: ' + data.error, 'error');
        }
    })
    .catch(err => {
        console.error('Error deleting order:', err);
        showToast('Failed to delete order.', 'error');
    });
}

function viewOrderDetails(orderId) {
    const order = allPharmacyOrders.find(o => o.order_id === orderId);
    if (!order) return;

    const modal = document.getElementById('viewOrderModal');
    if (!modal) {
        alert(JSON.stringify(order, null, 2));
        return;
    }

    document.getElementById('view_order_id').textContent = order.order_id;
    document.getElementById('view_order_customer').textContent = order.customer_name;
    document.getElementById('view_order_email').textContent = order.customer_email || 'N/A';
    document.getElementById('view_order_phone').textContent = order.customer_phone || 'N/A';
    document.getElementById('view_order_type').textContent = order.order_type + ' (' + order.delivery_method + ')';
    document.getElementById('view_order_status').textContent = order.status;
    document.getElementById('view_order_total').textContent = '₹' + order.total_price.toFixed(2);
    document.getElementById('view_order_date').textContent = order.created_at;

    const itemsContainer = document.getElementById('view_order_items_list');
    itemsContainer.innerHTML = order.items.map(item => `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding: 8px 0; font-size: 13px;">
            <div>
                <strong style="color: var(--text-primary);">${escapeHTML(item.medicine_name)}</strong>
                <span style="font-size: 11px; color: var(--text-muted); display: block;">${escapeHTML(item.manufacturer)} | ${escapeHTML(item.category)}</span>
            </div>
            <div style="text-align: right;">
                <span style="color: var(--text-secondary);">${item.quantity} x ₹${item.price.toFixed(2)}</span>
                <strong style="display: block; color: var(--text-primary);">₹${(item.quantity * item.price).toFixed(2)}</strong>
            </div>
        </div>
    `).join('');

    modal.style.display = 'flex';
}

function closeViewOrderModal() {
    const modal = document.getElementById('viewOrderModal');
    if (modal) modal.style.display = 'none';
}

let stockChartInstance = null;
let purchaseChartInstance = null;
let salesSplitChartInstance = null;
let revenueChartInstance = null;

function renderPharmacyAnalytics() {
    // Show charts loading placeholders or just fetch in parallel
    Promise.all([
        fetch('/pharmacies/inventory/list/').then(res => res.json()),
        fetch('/pharmacies/orders/pharmacy/').then(res => res.json()),
        fetch('/pharmacies/bills/list/').then(res => res.json())
    ]).then(([invData, ordersData, billsData]) => {
        const inventory = invData.success ? (invData.inventory || []) : [];
        const orders = ordersData.success ? (ordersData.orders || []) : [];
        const bills = billsData.success ? (billsData.bills || []) : [];

        // 1. Medicine Stock Chart
        const stockLabels = inventory.map(m => m.name);
        const stockValues = inventory.map(m => parseInt(m.quantity) || 0);

        // 2. Medicine Purchases/Sales Chart
        const purchaseCounts = {};
        // Aggregate medicine sales from POS bills (which contains both in-store and completed online order bills)
        bills.forEach(b => {
            if (b.items) {
                b.items.forEach(item => {
                    const name = item.medicine_name;
                    purchaseCounts[name] = (purchaseCounts[name] || 0) + (parseInt(item.quantity) || 0);
                });
            }
        });

        const purchaseLabels = Object.keys(purchaseCounts);
        const purchaseValues = Object.values(purchaseCounts);

        // 3. Online vs In-Store Sales Split (solely from bills)
        let onlineSales = 0;
        let instoreSales = 0;
        bills.forEach(b => {
            if (b.bill_type === 'online') {
                onlineSales += parseFloat(b.total_price) || 0;
            } else {
                instoreSales += parseFloat(b.total_price) || 0;
            }
        });

        // 4. Everyday Revenue Chart (solely from bills)
        const dailyRevenue = {};
        bills.forEach(b => {
            if (b.bill_date) {
                const date = b.bill_date.split(' ')[0] || b.bill_date.split('T')[0];
                dailyRevenue[date] = (dailyRevenue[date] || 0) + (parseFloat(b.total_price) || 0);
            }
        });

        // Sort dates chronologically
        const sortedDates = Object.keys(dailyRevenue).sort((a, b) => new Date(a) - new Date(b));
        const revenueValues = sortedDates.map(d => dailyRevenue[d]);

        // Destroy existing chart instances if they exist
        if (stockChartInstance) stockChartInstance.destroy();
        if (purchaseChartInstance) purchaseChartInstance.destroy();
        if (salesSplitChartInstance) salesSplitChartInstance.destroy();
        if (revenueChartInstance) revenueChartInstance.destroy();

        // Render stock chart
        const ctxStock = document.getElementById('chartStock').getContext('2d');
        stockChartInstance = new Chart(ctxStock, {
            type: 'bar',
            data: {
                labels: stockLabels,
                datasets: [{
                    label: 'Current Stock (Units)',
                    data: stockValues,
                    backgroundColor: 'rgba(59, 130, 246, 0.65)',
                    borderColor: '#3b82f6',
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Render purchases chart
        const ctxPurchases = document.getElementById('chartPurchases').getContext('2d');
        purchaseChartInstance = new Chart(ctxPurchases, {
            type: 'bar',
            data: {
                labels: purchaseLabels,
                datasets: [{
                    label: 'Total Units Sold',
                    data: purchaseValues,
                    backgroundColor: 'rgba(245, 158, 11, 0.65)',
                    borderColor: '#f59e0b',
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Render Sales Split Chart
        const ctxSplit = document.getElementById('chartSalesSplit').getContext('2d');
        salesSplitChartInstance = new Chart(ctxSplit, {
            type: 'doughnut',
            data: {
                labels: ['Online Orders', 'In-Store POS'],
                datasets: [{
                    data: [onlineSales, instoreSales],
                    backgroundColor: [
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(245, 158, 11, 0.7)'
                    ],
                    borderColor: [
                        '#8b5cf6',
                        '#f59e0b'
                    ],
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#64748b',
                            font: { size: 12, weight: '500' }
                        }
                    }
                }
            }
        });

        // Render revenue timeline chart
        const ctxRevenue = document.getElementById('chartRevenue').getContext('2d');
        revenueChartInstance = new Chart(ctxRevenue, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'Daily Revenue (₹)',
                    data: revenueValues,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }).catch(err => console.error("Error generating analytics charts:", err));
}
