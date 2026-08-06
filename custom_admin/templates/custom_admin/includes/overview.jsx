<>
<header>
    <div>
        <h1>Admin Dashboard</h1>
        <p style="color: var(--text-secondary); margin-top: 4px; font-size: 14px;">Manage users, monitor system status, and approve applications</p>
    </div>
</header>

{/* Stats Grid */}
<div class="stats-grid">
    {/* Total Users */}
    <div class="card" onclick="window.location.hash = '#users'" style="cursor: pointer;">
        <div class="card-icon-box" style="background-color: var(--color-primary-glow); color: var(--color-primary);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        </div>
        <span class="card-title">Total Users</span>
        <span id="count-total-users" class="card-value">0</span>
        <span class="card-desc">All registered accounts</span>
    </div>
    {/* Citizens */}
    <div class="card">
        <div class="card-icon-box" style="background-color: var(--color-primary-glow); color: var(--color-primary);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
        <span class="card-title">Citizens</span>
        <span id="count-citizens" class="card-value">0</span>
        <span class="card-desc">Active patient profiles</span>
    </div>
    {/* Doctors */}
    <div class="card">
        <div class="card-icon-box" style="background-color: var(--color-success-glow); color: var(--color-success);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
            </svg>
        </div>
        <span class="card-title">Doctors</span>
        <span id="count-doctors" class="card-value" style="color: var(--color-success);">0</span>
        <span class="card-desc">Verified medical professionals</span>
    </div>
    {/* Pharmacies */}
    <div class="card">
        <div class="card-icon-box" style="background-color: var(--color-warning-glow); color: var(--color-warning);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M19 10.5V20a2 2 0 01-2 2H7a2 2 0 01-2-2v-9.5M3 10.5h18M12 7V3m-4 8v4m8-4v4" />
            </svg>
        </div>
        <span class="card-title">Pharmacies</span>
        <span id="count-pharmacies" class="card-value" style="color: var(--color-warning);">0</span>
        <span class="card-desc">Registered medical stores</span>
    </div>
    {/* Medicines */}
    <div class="card">
        <div class="card-icon-box" style="background-color: var(--color-success-glow); color: var(--color-success);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4.5 10.5C3.67 10.5 3 11.17 3 12s.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-15zM12 3v18" />
            </svg>
        </div>
        <span class="card-title">Medicines</span>
        <span id="count-medicines" class="card-value" style="color: var(--color-success);">0</span>
        <span class="card-desc">Ecosystem medicine inventory</span>
    </div>
    {/* Reports */}
    <div class="card">
        <div class="card-icon-box" style="background-color: var(--color-warning-glow); color: var(--color-warning);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
        <span class="card-title">Reports</span>
        <span class="card-value" style="color: var(--color-warning);">12</span>
        <span class="card-desc">Active analytics reports</span>
    </div>
    {/* Total Logs */}
    <div class="card">
        <div class="card-icon-box" style="background-color: var(--color-info-glow); color: var(--color-info);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        </div>
        <span class="card-title">Total Logs</span>
        <span id="count-logs" class="card-value" style="color: var(--color-info);">0</span>
        <span class="card-desc">System activity & audit logs</span>
    </div>
</div>

{/* Widget Grid */}
<div class="widget-grid">
    <div class="card" style="gap: 0;">
        <div class="widget-header">
            <span class="widget-title">Pending Verification Applications</span>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Applicant Name</th>
                        <th>Type</th>
                        <th>License Number</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="pending-table-body">
                    <tr>
                        <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 30px;">Loading pending applications...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="card">
        <span class="widget-title">System Status</span>
        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <span style="color: var(--text-secondary); font-size: 13px;">API Health</span>
                <strong style="font-size: 14px; color: var(--color-success);">Optimal (99.9%)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <span style="color: var(--text-secondary); font-size: 13px;">Database Sync</span>
                <strong style="font-size: 14px; color: var(--color-success);">Active (0ms latency)</strong>
            </div>
        </div>
    </div>
</div>
</>
