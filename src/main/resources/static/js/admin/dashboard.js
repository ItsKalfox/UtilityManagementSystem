function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/stats/admin-dashboard', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            let data;
            try {
                data = await response.json();
            } catch {
                data = {};
            }
            if (data.message === 'Token expired') {
                const confirmed = await handleTokenExpired();

                if (!confirmed) return;

                const theme = localStorage.getItem('theme');

                localStorage.clear();

                if (theme !== null) {
                    localStorage.setItem('theme', theme);
                }

                window.location.replace('../../index.html');
            }
        }

        if (!response.ok) {
            showToast('Failed to load data', 'error');
            return;
        }

        const data = await response.json();
        populateDashboard(data);

    } catch (error) {
        console.error(error);
        showToast('Unexpected error', 'error');
    }
}

function populateDashboard(d) {
    setText('active-customers', d.activeCustomers);
    setText('inactive-customers', d.totalCustomers - d.activeCustomers);
    setText('total-customers', d.totalCustomers);

    setText('active-admins', d.activeAdmins);
    setText('inactive-admins', d.totalAdmins - d.activeAdmins);
    setText('total-admins', d.totalAdmins);

    setText('active-managers', d.activeManagers);
    setText('inactive-managers', d.totalManagers - d.activeManagers);
    setText('total-managers', d.totalManagers);

    setText('active-officers', d.activeFieldOfficers);
    setText('inactive-officers', d.totalFieldOfficers - d.activeFieldOfficers);
    setText('total-officers', d.totalFieldOfficers);

    setText('active-cashiers', d.activeCashiers);
    setText('inactive-cashiers', d.totalCashiers - d.activeCashiers);
    setText('total-cashiers', d.totalCashiers);

    const totalConnections =
        d.totalWaterConn +
        d.totalElectricityConn +
        d.totalGasConn;

    const activeConnections =
        d.activeWaterConn +
        d.activeElectricityConn +
        d.activeGasConn;

    setText('active-connections-all', activeConnections);
    setText('inactive-connections-all', totalConnections - activeConnections);
    setText('total-connections-all', totalConnections);

    setText('active-water', d.activeWaterConn);
    setText('inactive-water', d.totalWaterConn - d.activeWaterConn);
    setText('total-water', d.totalWaterConn);

    setText('active-electricity', d.activeElectricityConn);
    setText('inactive-electricity', d.totalElectricityConn - d.activeElectricityConn);
    setText('total-electricity', d.totalElectricityConn);

    setText('active-gas', d.activeGasConn);
    setText('inactive-gas', d.totalGasConn - d.activeGasConn);
    setText('total-gas', d.totalGasConn);

    setText('open-complaints', d.totalOpenCom);
    setText('progress-complaints', d.totalInProgressCom);
    setText('resolved-complaints', d.totalResolvedCom);
    setText('urgent-complaints', d.urgentCom);
}

document.addEventListener('DOMContentLoaded', loadDashboardStats);
