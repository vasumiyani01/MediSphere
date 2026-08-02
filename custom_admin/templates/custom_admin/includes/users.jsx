<>
<header style="margin-bottom: 25px;">
    <div>
        <h1>Users</h1>
        <p style="color: var(--text-secondary); margin-top: 4px; font-size: 14px;">View, search, and filter registered patients and healthcare providers</p>
    </div>
</header>

{/* Search and Filter Controls */}
<div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
    {/* Search Bar */}
    <div style="display: flex; gap: 10px; width: 100%;">
        <input type="text" id="user-search" placeholder="Search by name, email, or mobile..." oninput="filterUsers()" 
               style="flex-grow: 1; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary); font-family: var(--font-sans); font-size: 14px; outline: none; box-shadow: var(--glass-shadow); transition: border-color 0.2s;" />
        <button onclick="filterUsers()" class="btn-primary">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search</span>
        </button>
    </div>
    
    {/* Filters Grid */}
    <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between; align-items: center;">
        {/* Role Filter */}
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Role:</span>
            <button id="filter-role-all" class="btn-filter active" onclick="setRoleFilter('all')">All</button>
            <button id="filter-role-citizen" class="btn-filter" onclick="setRoleFilter('citizen')">Citizens</button>
            <button id="filter-role-doctor" class="btn-filter" onclick="setRoleFilter('doctor')">Doctors</button>
            <button id="filter-role-pharmacy" class="btn-filter" onclick="setRoleFilter('pharmacy')">Pharmacies</button>
        </div>

        {/* Status Filter */}
        <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Status:</span>
            <button id="filter-status-all" class="btn-filter active" onclick="setStatusFilter('all')">All</button>
            <button id="filter-status-pending" class="btn-filter" onclick="setStatusFilter('pending')" style="color: var(--color-warning);">Pending</button>
            <button id="filter-status-approved" class="btn-filter" onclick="setStatusFilter('approved')" style="color: var(--color-success);">Approved</button>
        </div>
    </div>
</div>

<div class="card" style="gap: 0;">
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile Number</th>
                    <th>User Type</th>
                    <th>License Number</th>
                    <th>Status</th>
                    <th>Date Joined</th>
                </tr>
            </thead>
            <tbody id="users-table-body">
                <tr>
                    <td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 30px;">Loading users data...</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</>
