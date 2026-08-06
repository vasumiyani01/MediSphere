<>
<header style="margin-bottom: 25px;">
    <div>
        <h1>System Logs</h1>
        <p style="color: var(--text-secondary); margin-top: 4px; font-size: 14px;">Audit trail of user and system activity events</p>
    </div>
</header>

<div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
    <button class="btn-primary" onclick="loadSystemLogs()">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
        </svg>
        <span>Refresh Logs</span>
    </button>
</div>

<div class="card" style="gap: 0;">
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Log ID</th>
                    <th>User / Account</th>
                    <th>Activity Description</th>
                    <th>IP Address</th>
                    <th>Timestamp (UTC)</th>
                </tr>
            </thead>
            <tbody id="logs-table-body">
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">Loading audit logs data...</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</>
