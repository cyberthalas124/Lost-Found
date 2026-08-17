//--- FIREBASE CONFIG ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9Y9fOZu6uXV8f5_mZVOU_VqORlu014gs",
  authDomain: "sapa-lost-and-found.firebaseapp.com",
  projectId: "sapa-lost-and-found",
  storageBucket: "sapa-lost-and-found.firebasestorage.app",
  messagingSenderId: "790156230729",
  appId: "1:790156230729:web:9df47808e8d9017fcebf98",
  measurementId: "G-PL1L26HRV5"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

console.log("Firestore Connected!");

window.testFirestore = async function () {

  try {

    await addDoc(collection(db, "lost_reports"), {

      itemName: "กระเป๋าสตางค์",
      location: "โรงอาหาร",
      status: "lost",
      createdAt: new Date()

    });

    alert("ส่งข้อมูลเข้า Firestore สำเร็จ!");

  } catch (error) {

    console.error(error);
    alert("เกิดข้อผิดพลาด");

  }

}
// --- DATA MANAGEMENT ---
let currentUser = JSON.parse(localStorage.getItem('sapa_user')) || null;
let reports = JSON.parse(localStorage.getItem('sapa_reports')) || [
    { id: 1, type: 'lost', name: 'กระเป๋าตังค์สีดำ', location: 'โรงอาหาร', time: '12:30', reporter: '12345', status: 'searching', date: new Date().toISOString() },
    { id: 2, type: 'found', name: 'กุญแจรถมอเตอร์ไซค์', location: 'สนามบาส', time: '15:00', reporter: '54321', status: 'found', date: new Date().toISOString() }
];

function syncReports() {
    const storedReports = JSON.parse(localStorage.getItem('sapa_reports') || '[]');
    if (storedReports.length > 0) {
        reports = storedReports;
    }
}

// --- THEME MANAGEMENT ---
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sapa_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icons = [document.getElementById('theme-icon'), document.getElementById('theme-icon-auth')];
    icons.forEach(icon => {
        if (!icon) return;
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

// --- NAVIGATION & UI ---
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// --- AUTH ---
function handleStudentLogin() {
    const id = document.getElementById('studentIdInput').value;
    const password = document.getElementById('studentPasswordInput').value;
    
    if (id.length !== 5) {
        alert('กรุณาใส่รหัสนักเรียน 5 หลัก');
        return;
    }
    
    if (!password) {
        alert('กรุณาใส่รหัสผ่าน');
        return;
    }
    
    currentUser = { id: id, role: 'student', name: 'นักเรียน' };
    saveAuth();
    closeModal('studentLoginModal');
    window.location.href = 'dashboard.html';
}

function handleAdminLogin() {
    const id = document.getElementById('adminIdInput').value;
    const password = document.getElementById('adminPasswordInput').value;
    
    if (!id) {
        alert('กรุณาใส่รหัสผู้ดูแล');
        return;
    }
    
    if (!password) {
        alert('กรุณาใส่รหัสผ่าน');
        return;
    }
    
    // Admin credentials check (for demo: admin ID '20936')
    if (id === '20936' && password === 'sapa@69') {
        currentUser = { id: id, role: 'admin', name: 'ผู้ดูแลระบบ' };
        saveAuth();
        closeModal('adminLoginModal');
        window.location.href = 'admin.html';
    } else {
        alert('รหัสผู้ดูแลหรือรหัสผ่านไม่ถูกต้อง');
    }
}

function handleLogin() {
    const id = document.getElementById('studentIdInput').value;
    if (id === '20936') {
        currentUser = { id: '20936', role: 'admin', name: 'เสฏฐวุฒิ ศรีภิรมย์' };
        saveAuth();
        window.location.href = 'admin.html';
    } else if (id.length === 5) {
        currentUser = { id: id, role: 'student' };
        saveAuth();
        window.location.href = 'dashboard.html';
    } else {
        alert('กรุณาใส่รหัสนักเรียน 5 หลัก');
    }
}

function saveAuth() {
    localStorage.setItem('sapa_user', JSON.stringify(currentUser));
    updateNav();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('sapa_user');
    window.location.href = 'index.html';
}

function updateNav() {
    const guest = document.getElementById('guest-btns');
    const auth = document.getElementById('auth-actions');
    if (!guest || !auth) return;

    if (currentUser) {
        guest.classList.add('hidden');
        auth.classList.remove('hidden');
        if (document.getElementById('display-student-id')) {
            document.getElementById('display-student-id').innerText = currentUser.id;
        }
    } else {
        guest.classList.remove('hidden');
        auth.classList.add('hidden');
    }
}

window.openModal = openModal;
window.closeModal = closeModal;
window.handleStudentLogin = handleStudentLogin;
window.handleAdminLogin = handleAdminLogin;
window.handleLogin = handleLogin;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.toggleNotifications = toggleNotifications;
window.checkMatches = checkMatches;

// --- NOTIFICATIONS ---
function checkMatches() {
    if (!currentUser) return;
    const myLost = reports.filter(r => r.reporter === currentUser.id && r.type === 'lost');
    const othersFound = reports.filter(r => r.reporter !== currentUser.id && r.type === 'found');
    
    const match = myLost.some(l => othersFound.some(f => f.itemType === l.itemType));
    if (match && document.getElementById('notif-dot')) {
        document.getElementById('notif-dot').classList.remove('hidden');
    }
}

function toggleNotifications() {
    const dot = document.getElementById('notif-dot');
    if (dot && !dot.classList.contains('hidden')) {
        alert('แจ้งเตือน: ตรวจพบรายการที่ใกล้เคียงกับของที่คุณทำหาย! กรุณาตรวจสอบในหน้าค้นหา');
        dot.classList.add('hidden');
    } else {
        alert('ยังไม่มีการแจ้งเตือนใหม่');
    }
}

// --- GIMMICKS: SCROLL EFFECTS ---
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(backToTop);

    backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    window.onscroll = () => {
        // Navbar glass effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            backToTop.classList.add('visible');
        } else {
            navbar.classList.remove('scrolled');
            backToTop.classList.remove('visible');
        }

        // Scroll reveal
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const revealTop = el.getBoundingClientRect().top;
            const revealPoint = 150;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };
}

// --- SHARED INITIALIZATION ---
window.addEventListener('load', () => {

    syncReports();

    // Apply saved theme
    const savedTheme = localStorage.getItem('sapa_theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);

    updateThemeIcon(savedTheme);

    updateNav();

    if (currentUser) checkMatches();

    initScrollEffects();

    // Load pages
    const path = window.location.pathname;

    if (path.includes('history.html')) {
        renderHistory();
    }

    if (path.includes('search.html')) {
        renderSearch();
    }

    if (path.includes('admin.html')) {
        renderAdmin();
    }

    // Close modal
    window.onclick = function(event) {

        if (event.target.className === 'modal active') {

            event.target.classList.remove('active');

        }

    };

});

window.submitReport = async function(type) {

    const form = document.getElementById('lostForm');

    if (!form) {
        alert('ไม่พบฟอร์มส่งข้อมูล');
        return;
    }

    const formData = new FormData(form);

    const reporterName = formData.get('reporterName') || 'ไม่ระบุ';
    const newReport = {
        id: Date.now(),
        type: type,
        name: formData.get('features') || formData.get('itemType') || 'ไม่ระบุ',
        reporterName: reporterName,
        contactNumber: formData.get('contactNumber') || 'ไม่ระบุ',
        itemType: formData.get('itemType') || 'ไม่ระบุ',
        features: formData.get('features') || 'ไม่ระบุ',
        location: formData.get('location') || 'ไม่ระบุ',
        time: formData.get('timeEstimate') || 'ไม่ระบุ',
        reporter: currentUser?.id || reporterName,
        status: 'searching',
        date: new Date().toISOString()
    };

    syncReports();
    reports.unshift(newReport);
    localStorage.setItem('sapa_reports', JSON.stringify(reports));

    try {
        await addDoc(collection(db, 'lost_reports'), newReport);
        alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
        window.location.href = 'history.html';
    } catch (error) {
        console.error(error);
        alert('บันทึกข้อมูลสำรองในเครื่องเรียบร้อยแล้ว');
        window.location.href = 'history.html';
    }

}

window.submitFoundReport = async function() {

    const form = document.getElementById('foundForm');

    if (!form) {
        alert('ไม่พบฟอร์มส่งข้อมูล');
        return;
    }

    const formData = new FormData(form);

    const reporterName = formData.get('reporterName') || 'ไม่ระบุ';
    const newReport = {
        id: Date.now(),
        type: 'found',
        name: formData.get('itemType') || 'ไม่ระบุ',
        finderName: reporterName,
        contactNumber: formData.get('contactNumber') || 'ไม่ระบุ',
        itemType: formData.get('itemType') || 'ไม่ระบุ',
        location: formData.get('location') || 'ไม่ระบุ',
        reporterName: reporterName,
        reporter: currentUser?.id || reporterName,
        status: 'found',
        date: new Date().toISOString()
    };

    syncReports();
    reports.unshift(newReport);
    localStorage.setItem('sapa_reports', JSON.stringify(reports));

    try {
        await addDoc(collection(db, 'found_reports'), newReport);
        alert('บันทึกข้อมูลของที่พบเรียบร้อยแล้ว!');
        window.location.href = 'history.html';
    } catch (error) {
        console.error(error);
        alert('บันทึกข้อมูลของที่พบสำรองในเครื่องเรียบร้อยแล้ว');
        window.location.href = 'history.html';
    }

}
window.renderHistory = async function () {

    const container = document.getElementById('historyContainer');

    if (!container) return;

    container.innerHTML = "<p>กำลังโหลดข้อมูล...</p>";

    try {

        const q = query(
            collection(db, "lost_reports"),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        container.innerHTML = "";

        querySnapshot.forEach((doc) => {

            const data = doc.data();

            container.innerHTML += `

                <div class="item-card">

                    <div class="item-content">

                        <div class="item-status-row">
                            <span class="status-badge status-searching">
                                ${data.status || 'searching'}
                            </span>
                        </div>

                        <h3 class="item-title">
                            ${data.features || 'ไม่ระบุ'}
                        </h3>

                        <div class="item-details">

                            <div class="item-detail-row">
                                <i class="fa-solid fa-layer-group"></i>
                                <span>${data.itemType || 'ไม่ระบุ'}</span>
                            </div>

                            <div class="item-detail-row">
                                <i class="fa-solid fa-location-dot"></i>
                                <span>${data.location || 'ไม่ระบุ'}</span>
                            </div>

                            <div class="item-detail-row">
                                <i class="fa-solid fa-clock"></i>
                                <span>${data.time || 'ไม่ระบุ'}</span>
                            </div>

                            <div class="item-detail-row">
                                <i class="fa-solid fa-user"></i>
                                <span>${data.reporterName || 'ไม่ระบุ'}</span>
                            </div>

                        </div>

                    </div>

                </div>

            `;

        });

    } catch(error) {

        console.error(error);

        container.innerHTML = "<p>โหลดข้อมูลไม่สำเร็จ</p>";

    }

}

window.renderHistory = function () {
    syncReports();
    const list = document.getElementById('history-list');
    const emptyState = document.getElementById('no-history');
    if (!list || !emptyState) return;

    const currentUserId = currentUser?.id || '';
    const currentUserName = currentUser?.name || '';
    const myReports = (reports || []).filter(r => {
        const reporterValue = r.reporter || r.reporterName || '';
        return reporterValue === currentUserId || reporterValue === currentUserName;
    });

    list.innerHTML = '';

    if (myReports.length === 0) {
        list.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    list.classList.remove('hidden');
    emptyState.classList.add('hidden');

    myReports.forEach(r => {
        const title = r.name || r.itemType || r.features || 'ไม่ระบุ';
        const location = r.location || 'ไม่ระบุ';
        const status = r.status || 'searching';
        const type = r.type || 'lost';
        const date = r.date ? new Date(r.date).toLocaleDateString('th-TH') : 'ไม่ระบุ';

        list.innerHTML += `
            <div class="item-card">
                <div class="item-img-placeholder">
                    <i class="fa-solid ${type === 'lost' ? 'fa-magnifying-glass' : 'fa-box'}"></i>
                    <span class="item-type-badge badge-${type}">${type}</span>
                </div>
                <div class="item-content">
                    <div class="item-status-row">
                        <span class="status-badge status-${status}">${status}</span>
                    </div>
                    <span class="item-title">${title}</span>
                    <div class="item-details">
                        <div class="item-detail-row"><i class="fa-solid fa-location-dot"></i> ${location}</div>
                        <div class="item-detail-row"><i class="fa-solid fa-calendar-days"></i> ${date}</div>
                    </div>
                </div>
            </div>
        `;
    });
};

window.markReturned = function (id) {
    syncReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx !== -1) {
        reports[idx].status = 'returned';
        localStorage.setItem('sapa_reports', JSON.stringify(reports));
        renderAdmin();
    }
};

window.deleteLocalReport = function (reportId) {
    if (!confirm('ยืนยันลบรายการนี้จากประวัติในเครื่อง?')) return;
    syncReports();
    reports = reports.filter(r => r.id !== reportId);
    localStorage.setItem('sapa_reports', JSON.stringify(reports));
    renderAdmin();
    alert('ลบรายการจากประวัติในเครื่องเรียบร้อยแล้ว');
};

window.deleteAllLocalReports = function () {
    if (!confirm('ยืนยันลบประวัติทั้งหมดในเครื่อง?')) return;
    reports = [];
    localStorage.setItem('sapa_reports', JSON.stringify(reports));
    renderAdmin();
    alert('ล้างประวัติทั้งหมดในเครื่องเรียบร้อยแล้ว');
};

window.renderAdmin = function () {
    syncReports();
    if (!currentUser || currentUser.role !== 'admin') return;

    const lost = reports.filter(r => r.type === 'lost').length;
    const found = reports.filter(r => r.type === 'found').length;
    const returned = reports.filter(r => r.status === 'returned').length;

    const statLost = document.getElementById('stat-lost');
    const statFound = document.getElementById('stat-found');
    const statReturned = document.getElementById('stat-returned');
    const list = document.getElementById('admin-all-list');

    if (statLost) statLost.innerText = lost;
    if (statFound) statFound.innerText = found;
    if (statReturned) statReturned.innerText = returned;
    if (!list) return;

    list.innerHTML = '';
    reports.forEach(r => {
        list.innerHTML += `
            <div class="item-card" style="opacity: ${r.status === 'returned' ? '0.6' : '1'}">
                <div class="item-img-placeholder">
                    <i class="fa-solid ${r.type === 'lost' ? 'fa-magnifying-glass' : 'fa-box'}"></i>
                    <span class="item-type-badge badge-${r.type}">${r.type}</span>
                </div>
                <div class="item-content">
                    <div class="item-status-row">
                        <span class="status-badge status-${r.status}">${r.status}</span>
                    </div>
                    <span class="item-title">${r.name}</span>
                    <div class="item-details">
                        <div class="item-detail-row"><i class="fa-solid fa-user"></i> ID: ${r.reporter || r.reporterName || 'ไม่ระบุ'}</div>
                        <div class="item-detail-row"><i class="fa-solid fa-location-dot"></i> ${r.location || 'ไม่ระบุ'}</div>
                    </div>
                </div>
                <div class="item-footer">
                    <span style="font-size: 0.8rem; color: #999;">${r.date ? new Date(r.date).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</span>
                    <div style="display:flex; gap:10px; align-items:center;">
                        ${r.status !== 'returned' ? `<button class="btn-card-action" onclick="markReturned(${r.id})">คืนแล้ว</button>` : '<span style="color: var(--primary-blue); font-weight:600; font-size: 0.85rem;">สำเร็จ</span>'}
                        <button class="btn-card-action" onclick="deleteLocalReport(${r.id})" style="background:#d9534f;">ลบจากเครื่อง</button>
                    </div>
                </div>
            </div>
        `;
    });
};
