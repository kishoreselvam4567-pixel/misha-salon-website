// ════════════════════════════════════════════════════════
// FIREBASE SETUP & AUTHENTICATION
// ════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwUkaNkRvvaU-778O9G2QdHU-j6Ibl7C8",
  authDomain: "misha-salon-d9057.firebaseapp.com",
  projectId: "misha-salon-d9057",
  storageBucket: "misha-salon-d9057.firebasestorage.app",
  messagingSenderId: "144986885975",
  appId: "1:144986885975:web:dbe9f2494c3ffc1f3d7812",
  measurementId: "G-W3LSF7924M"
}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

var STORE = {
  services: [],
  offers: [],
  gallery: [],
  bookings: [],
  stylists: []
};

// ════════════════════════════════════════════════════════
// LOGIN & LOGOUT
// ════════════════════════════════════════════════════════

async function trySecureLogin() {
  console.log("LOGIN BUTTON WORKING");
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const loginBtn = document.getElementById('loginBtn');
  const loginErr = document.getElementById('loginErr');
  
  if (!email || !password) {
    loginErr.textContent = 'Please enter both email and password.';
    loginErr.style.display = 'block';
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  loginErr.style.display = 'none';

  try {
    console.log("Trying Firebase login...");
    await signInWithEmailAndPassword(auth, email, password);
    // Firebase will trigger onAuthStateChanged callback automatically
  } catch (error) {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login Securely';
    loginErr.style.display = 'block';
    
    if (error.code === 'auth/user-not-found') {
      loginErr.textContent = 'Email not found.';
    } else if (error.code === 'auth/wrong-password') {
      loginErr.textContent = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      loginErr.textContent = 'Invalid email format.';
    } else {
      loginErr.textContent = 'Login failed: ' + error.message;
    }
  }
}

function togglePasswordVisibility() {
  const input = document.getElementById('passwordInput');
  input.type = input.type === 'password' ? 'text' : 'password';
}

async function doLogout() {
  try {
    await signOut(auth);
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('app').classList.remove('on');
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginErr').style.display = 'none';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Check auth state on page load
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.add('on');
    loadStoreFromFirebase();
    initDashboard();
  } else {
    // User is logged out
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('app').classList.remove('on');
  }
});

// ════════════════════════════════════════════════════════
// FIRESTORE DATA SYNC
// ════════════════════════════════════════════════════════

async function loadStoreFromFirebase() {
  try {
    // Load Services
    const srvSnap = await getDocs(collection(db, 'services'));
    STORE.services = [];
    srvSnap.forEach(doc => {
      STORE.services.push({ id: doc.id, ...doc.data() });
    });

    // Load Offers
    const offerSnap = await getDocs(collection(db, 'offers'));
    STORE.offers = [];
    offerSnap.forEach(doc => {
      STORE.offers.push({ id: doc.id, ...doc.data() });
    });

    // Load Gallery
    const galSnap = await getDocs(collection(db, 'gallery'));
    STORE.gallery = [];
    galSnap.forEach(doc => {
      STORE.gallery.push({ id: doc.id, ...doc.data() });
    });

    // Load Bookings
   onSnapshot(collection(db, 'bookings'), (snapshot) => {
    STORE.bookings = [];
    snapshot.forEach(doc => {
      STORE.bookings.push({
      id: doc.id,
      ...doc.data()
      });

    });

    renderAppts();

    initDashboard();

  });

    // Load Stylists
    const stSnap = await getDocs(collection(db, 'stylists'));
    STORE.stylists = [];
    stSnap.forEach(doc => {
      STORE.stylists.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error('Error loading store:', error);
  }
}

function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ════════════════════════════════════════════════════════
// PANEL NAVIGATION
// ════════════════════════════════════════════════════════

function showPanel(id, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.sb-btn').forEach(b => b.classList.remove('on'));
  document.getElementById('p-' + id).classList.add('on');
  if (btn) btn.classList.add('on');
  else { var sbBtn = document.getElementById('sb-' + id); if (sbBtn) sbBtn.classList.add('on'); }
  
  if (id === 'dashboard') initDashboard();
  if (id === 'appointments') renderAppts();
  if (id === 'services') renderSrvAdmin();
  if (id === 'offers') renderOfferAdmin();
  if (id === 'gallery') renderGalAdmin();
  if (id === 'stylists') renderStylistAdmin();

  // Close mobile sidebar
  if (window.innerWidth <= 768) {
    var sb = document.getElementById('adminSidebar');
    if (sb && sb.classList.contains('open')) toggleAdminSidebar();
  }
}

// ════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════

function initDashboard() {
  var today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  var todayC = STORE.bookings.filter(b => b.submitted === today).length;
  var svcMap = {};
  STORE.bookings.forEach(b => {
    if (b.services && Array.isArray(b.services)) {
      b.services.forEach(s => { svcMap[s] = (svcMap[s] || 0) + 1; });
    }
  });
  var top = Object.entries(svcMap).sort((a, b) => b[1] - a[1])[0];
  var rev = STORE.bookings.filter(b => b.status === 'Done').reduce((a, b) => a + (b.total || 0), 0);
  
  document.getElementById('dashStats').innerHTML =
    sc(STORE.bookings.length, 'Total Bookings') +
    sc(todayC, 'Today') +
    sc(top ? top[0].split(' ').slice(0, 2).join(' ') : '—', 'Top Service') +
    sc('₹' + rev.toLocaleString('en-IN'), 'Revenue (Done)');
  
  var recent = STORE.bookings.slice(-5).reverse();
  document.getElementById('dashRecent').innerHTML = recent.length ?
    '<table><thead><tr><th>ID</th><th>Client</th><th>Services</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>' +
    recent.map(b => '<tr><td><strong>' + b.id + '</strong></td><td>' + b.name + '</td><td>' + (b.services || []).slice(0, 2).map(s => '<span class="tag">' + s + '</span>').join('') + ((b.services || []).length > 2 ? '<span class="tag">+' + ((b.services || []).length - 2) + '</span>' : '') + '</td><td>' + fmtD(b.date) + '</td><td style="color:var(--brown);">₹' + (b.total || 0).toLocaleString('en-IN') + '</td><td>' + statusBadge(b.status) + '</td></tr>').join('') +
    '</tbody></table>' :
    '<div class="empty-state">No bookings yet.</div>';
    renderTodayAppointments();
    renderPendingAppointments();
}


function renderTodayAppointments(){

  const today =
    new Date().toISOString().split('T')[0];

  const todaysBookings =
    STORE.bookings.filter(
      b => b.date === today
    );

  const container =
    document.getElementById(
      'todayAppointments'
    );

  if(!todaysBookings.length){

    container.innerHTML =
      '<div class="empty-state">No appointments today.</div>';

    return;

  }

  container.innerHTML =
    todaysBookings.map(b =>

      '<div class="quick-appt">' +

      '<div class="quick-appt-name">' +
      b.name +
      '</div>' +

      '<div class="quick-appt-time">' +
      b.time +
      '</div>' +

      '</div>'

    ).join('');

}

function renderPendingAppointments(){

  const pending =
    STORE.bookings.filter(
      b => b.status === 'Pending'
    );

  const container =
    document.getElementById(
      'pendingAppointments'
    );

  if(!pending.length){

    container.innerHTML =
      '<div class="empty-state">No pending appointments.</div>';

    return;

  }

  container.innerHTML =
    pending.map(b =>

      '<div class="quick-appt">' +

      '<div class="quick-appt-name">' +
      b.name +
      '</div>' +

      '<div class="quick-appt-time">' +
      fmtD(b.date) + ' • ' + b.time +
      '</div>' +
      '<div class="quick-actions">' +

      '<button class="btn btn-green btn-sm" onclick="openStatusModal(\'' + b.id + '\', \'Confirmed\')">Accept</button>' +

      '<button class="btn btn-red btn-sm" onclick="openStatusModal(\'' + b.id + '\', \'Cancelled\')">Cancel</button>' +

      '</div>' +

      '</div>'

    ).join('');

}

function sc(n, l) {
  return '<div class="stat-card"><div class="stat-num">' + n + '</div><div class="stat-lbl">' + l + '</div></div>';
}

// ════════════════════════════════════════════════════════
// APPOINTMENTS
// ════════════════════════════════════════════════════════

function renderAppts() {
  var stf = document.getElementById('fltStatus').value;
  var s = document.getElementById('srchClient').value.toLowerCase();
  var f = STORE.bookings.filter(b => {
    if (stf && b.status !== stf) return false;
    if (s && !b.name.toLowerCase().includes(s) && !b.phone.includes(s)) return false;
    return true;
  });
  var w = document.getElementById('apptTable');
  if (!f.length) { w.innerHTML = '<div class="empty-state">No appointments found.</div>'; return; }
  w.innerHTML = '<table><thead><tr><th>Select</th><th>ID</th><th>Client</th><th>Contact</th><th>Services</th><th>Stylist</th><th>Date & Time</th><th>Total</th><th>Notes</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
    f.map(b => '<tr><td><input type="checkbox" class="appt-checkbox" value="' + b.id + '"> </td> <td><strong>' + b.id + '</strong></td><td> <button class="btn btn-outline btn-sm" onclick="openCustomerHistory(\'' + b.phone + '\')">' + b.name + '</button> </td><td>' + b.phone + '</td><td>' + (b.services || []).map(s => '<span class="tag">' + s + '</span>').join('') + '</td><td style="color:var(--brown);font-size:0.78rem;">' + (b.stylist || '—') + '</td><td><strong>' + fmtD(b.date) + '</strong><br>' + b.time + '</td><td><strong style="color:var(--brown);">₹' + (b.total || 0).toLocaleString('en-IN') + '</strong></td><td style="max-width:130px;font-size:0.72rem;color:var(--taupe);">' + (b.notes || '') + '</td><td>' + statusBadge(b.status) + '</td><td><button class="btn btn-outline btn-sm" onclick="openStatusModal(\'' + b.id + '\',\'' + b.status + '\')">Edit</button></td></tr>').join('') +
    '</tbody></table>';
}

function statusBadge(s) {
  var m = { Pending: 's-pending', Confirmed: 's-confirmed', Done: 's-done', Cancelled: 's-cancelled' };
  return '<span class="status-badge ' + (m[s] || 's-pending') + '">' + s + '</span>';
}

function fmtD(d) {
  if (!d) return '—';
  var p = d.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function exportCSV() {
  if (!STORE.bookings.length) { toast('No bookings to export.'); return; }
  var rows = [['ID', 'Name', 'Phone', 'Email', 'Services', 'Date', 'Time', 'Total', 'Notes', 'Status']];
  STORE.bookings.forEach(b => rows.push([b.id, b.name, b.phone, b.email, (b.services || []).join('; '), b.date, b.time, b.total, b.notes, b.status]));
  var csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
  var a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'misha_bookings_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
}

function openStatusModal(id, status) {
  document.getElementById('statusEditId').value = id;
  document.getElementById('statusSelect').value = status;
  toggleWaPreview();
  document.getElementById('statusOverlay').classList.add('on');
}

function toggleWaPreview() {
  var st = document.getElementById('statusSelect').value;
  var id = document.getElementById('statusEditId').value;
  var box = document.getElementById('waConfirmBox');
  var sendBtn = document.getElementById('waSendBtn');

  if (st === 'Confirmed' && id) {
    var b = STORE.bookings.find(x => x.id === id);
    if (b) {
      var firstName = b.name.split(' ')[0];
      var svcList = (b.services || []).map(s => '• ' + s).join('\n');
      var msg = 'Dear ' + firstName + ',\n\nYour appointment at Misha Family Salon has been *confirmed*! 🎉\n\n📅 Date: ' + fmtD(b.date) + '\n⏰ Time: ' + b.time + '\n\n*Services booked:*\n' + svcList + '\n\n💰 Total: ₹' + (b.total || 0).toLocaleString('en-IN') + '\n\n📍 6A, Karpagambal Nagar, Kottivakkam, Chennai – 600041\n\nPlease arrive 5 minutes early. See you soon! ✨\n\n— Misha Family Salon';
      document.getElementById('waPreviewText').textContent = msg;
      box.style.display = 'block';
      sendBtn.style.display = 'inline-block';
      return;
    }
  }
  box.style.display = 'none';
  sendBtn.style.display = 'none';
}

function closeStatusModal() {
  document.getElementById('statusOverlay').classList.remove('on');
}

async function saveStatus(sendWa) {
  var id = document.getElementById('statusEditId').value;
  var st = document.getElementById('statusSelect').value;
  var b = STORE.bookings.find(x => x.id === id);
  if (b) {
    b.status = st;
    try {
      await updateDoc(doc(db, 'bookings', id), { status: st });
      renderAppts();
      initDashboard();
      toast('Status updated to ' + st);

      if (sendWa && st === 'Confirmed' && b.phone) {
        var firstName = b.name.split(' ')[0];
        var svcList = (b.services || []).map(s => '• ' + s).join('\n');
        var stylistLine = b.stylist ? '\n💆 Stylist: ' + b.stylist : '';
        var msg = 'Dear ' + firstName + ', your appointment at *Misha Family Salon* has been *confirmed* ✅\n\n'
          + '📅 Date: ' + fmtD(b.date) + '\n'
          + '⏰ Time: ' + b.time
          + stylistLine + '\n\n'
          + '*Services:*\n' + svcList + '\n\n'
          + '💰 Total: ₹' + (b.total || 0).toLocaleString('en-IN') + '\n\n'
          + '📍 6A, Karpagambal Nagar, Kottivakkam, Chennai – 600041\n\n'
          + 'Please arrive 5 mins early. See you soon! 🌸\n— Misha Family Salon';
        var phone = b.phone.replace(/\D/g, '');
        if (!phone.startsWith('91')) phone = '91' + phone;
        window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast('Error updating status');
    }
  }
  closeStatusModal();
}

// ════════════════════════════════════════════════════════
// SERVICES
// ════════════════════════════════════════════════════════

function renderSrvAdmin() {
  var cats = [...new Set(STORE.services.map(s => s.cat))];
  var html = cats.map(cat => {
    var srvs = STORE.services.filter(s => s.cat === cat);
    return '<div style="margin-bottom:0.5rem;"><div style="font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--taupe);padding:0.7rem 1rem;background:var(--pale);border-bottom:1px solid var(--border);">' + cat + '</div>' +
      srvs.map(s => '<div class="srv-admin-row' + (s.active ? '' : ' inactive') + '"><span class="srv-admin-name">' + s.name + '</span><span class="srv-admin-cat">' + s.cat + '</span><span class="srv-admin-price">₹' + s.price.toLocaleString('en-IN') + '</span><span class="srv-admin-dur">' + (s.duration || '—') + '</span><span class="srv-admin-actions"><button class="btn btn-outline btn-sm" onclick="editSrv(\'' + s.id + '\')">Edit</button><button class="btn ' + (s.active ? 'btn-outline' : 'btn-green') + ' btn-sm" onclick="toggleSrvActive(\'' + s.id + '\')">' + (s.active ? 'Hide' : 'Show') + '</button><button class="btn btn-red btn-sm" onclick="deleteSrv(\'' + s.id + '\')">Delete</button></span></div>').join('') +
      '</div>';
  }).join('');
  document.getElementById('srvAdminList').innerHTML = html || '<div class="empty-state">No services yet.</div>';
}

function openSrvModal() {
  document.getElementById('srvEditId').value = '';
  document.getElementById('srvName').value = '';
  document.getElementById('srvDesc').value = '';
  document.getElementById('srvPrice').value = '';
  document.getElementById('srvDur').value = '';
  document.getElementById('srvCat').value = 'Hair';
  document.getElementById('srvModalTitle').textContent = 'Add Service';
  document.getElementById('srvOverlay').classList.add('on');
}

function editSrv(id) {
  var s = STORE.services.find(x => x.id === id);
  if (!s) return;
  document.getElementById('srvEditId').value = id;
  document.getElementById('srvName').value = s.name;
  document.getElementById('srvDesc').value = s.desc || '';
  document.getElementById('srvPrice').value = s.price;
  document.getElementById('srvDur').value = s.duration || '';
  document.getElementById('srvCat').value = s.cat;
  document.getElementById('srvModalTitle').textContent = 'Edit Service';
  document.getElementById('srvOverlay').classList.add('on');
}

function closeSrvModal() {
  document.getElementById('srvOverlay').classList.remove('on');
}

async function saveSrv() {
  var name = document.getElementById('srvName').value.trim();
  var price = parseInt(document.getElementById('srvPrice').value);
  if (!name || !price) { toast('Name and price are required.'); return; }
  
  var editId = document.getElementById('srvEditId').value;
  try {
    if (editId) {
      var s = STORE.services.find(x => x.id === editId);
      if (s) {
        s.name = name;
        s.cat = document.getElementById('srvCat').value;
        s.desc = document.getElementById('srvDesc').value;
        s.price = price;
        s.duration = document.getElementById('srvDur').value || '—';
        await updateDoc(doc(db, 'services', editId), s);
      }
    } else {
      var newSrv = {
        cat: document.getElementById('srvCat').value,
        name: name,
        desc: document.getElementById('srvDesc').value,
        price: price,
        duration: document.getElementById('srvDur').value || '—',
        active: true
      };
      const newId = 's' + Date.now();
      await setDoc(doc(db, 'services', newId), newSrv);
      newSrv.id = newId;
      STORE.services.push(newSrv);
    }
    closeSrvModal();
    renderSrvAdmin();
    toast('Service saved!');
  } catch (error) {
    console.error('Error saving service:', error);
    toast('Error saving service');
  }
}

async function toggleSrvActive(id) {
  var s = STORE.services.find(x => x.id === id);
  if (s) {
    s.active = !s.active;
    try {
      await updateDoc(doc(db, 'services', id), { active: s.active });
      renderSrvAdmin();
      toast(s.active ? 'Service shown.' : 'Service hidden.');
    } catch (error) {
      console.error('Error toggling service:', error);
    }
  }
}

async function deleteSrv(id) {
  if (!confirm('Delete this service?')) return;
  try {
    await deleteDoc(doc(db, 'services', id));
    STORE.services = STORE.services.filter(s => s.id !== id);
    renderSrvAdmin();
    toast('Service deleted.');
  } catch (error) {
    console.error('Error deleting service:', error);
    toast('Error deleting service');
  }
}

// ════════════════════════════════════════════════════════
// OFFERS
// ════════════════════════════════════════════════════════

function renderOfferAdmin() {
  var w = document.getElementById('offerAdminList');
  if (!STORE.offers.length) { w.innerHTML = '<div class="empty-state">No offers yet.</div>'; return; }
  w.innerHTML = STORE.offers.map(o => '<div class="offer-admin-card' + (o.active ? '' : ' inactive') + '"><div class="oa-body"><div class="oa-name">' + o.name + '</div><div class="oa-desc">' + (o.desc || '') + '</div><div><span class="oa-price">₹' + o.price.toLocaleString('en-IN') + '</span>' + (o.orig ? '<span class="oa-orig">₹' + o.orig.toLocaleString('en-IN') + '</span>' : '') + '</div></div><div class="oa-actions"><button class="btn btn-outline btn-sm" onclick="editOffer(\'' + o.id + '\')">Edit</button><button class="btn ' + (o.active ? 'btn-outline' : 'btn-green') + ' btn-sm" onclick="toggleOffer(\'' + o.id + '\')">' + (o.active ? 'Hide' : 'Show') + '</button><button class="btn btn-red btn-sm" onclick="deleteOffer(\'' + o.id + '\')">Delete</button></div></div>').join('');
}

function openOfferModal() {
  document.getElementById('offerEditId').value = '';
  document.getElementById('offerName').value = '';
  document.getElementById('offerDesc').value = '';
  document.getElementById('offerOrig').value = '';
  document.getElementById('offerPrice').value = '';
  document.getElementById('offerModalTitle').textContent = 'Add Offer';
  document.getElementById('offerOverlay').classList.add('on');
}

function editOffer(id) {
  var o = STORE.offers.find(x => x.id === id);
  if (!o) return;
  document.getElementById('offerEditId').value = id;
  document.getElementById('offerName').value = o.name;
  document.getElementById('offerDesc').value = o.desc || '';
  document.getElementById('offerOrig').value = o.orig || '';
  document.getElementById('offerPrice').value = o.price;
  document.getElementById('offerModalTitle').textContent = 'Edit Offer';
  document.getElementById('offerOverlay').classList.add('on');
}

function closeOfferModal() {
  document.getElementById('offerOverlay').classList.remove('on');
}

async function saveOffer() {
  var name = document.getElementById('offerName').value.trim();
  var price = parseInt(document.getElementById('offerPrice').value);
  if (!name || !price) { toast('Name and price are required.'); return; }
  
  var editId = document.getElementById('offerEditId').value;
  try {
    if (editId) {
      var o = STORE.offers.find(x => x.id === editId);
      if (o) {
        o.name = name;
        o.desc = document.getElementById('offerDesc').value;
        o.orig = parseInt(document.getElementById('offerOrig').value) || price;
        o.price = price;
        await updateDoc(doc(db, 'offers', editId), o);
      }
    } else {
      var newOffer = {
        name: name,
        desc: document.getElementById('offerDesc').value,
        orig: parseInt(document.getElementById('offerOrig').value) || price,
        price: price,
        active: true
      };
      const newId = 'o' + Date.now();
      await setDoc(doc(db, 'offers', newId), newOffer);
      newOffer.id = newId;
      STORE.offers.push(newOffer);
    }
    closeOfferModal();
    renderOfferAdmin();
    toast('Offer saved!');
  } catch (error) {
    console.error('Error saving offer:', error);
    toast('Error saving offer');
  }
}

async function toggleOffer(id) {
  var o = STORE.offers.find(x => x.id === id);
  if (o) {
    o.active = !o.active;
    try {
      await updateDoc(doc(db, 'offers', id), { active: o.active });
      renderOfferAdmin();
      toast(o.active ? 'Offer shown.' : 'Offer hidden.');
    } catch (error) {
      console.error('Error toggling offer:', error);
    }
  }
}

async function deleteOffer(id) {
  if (!confirm('Delete this offer?')) return;
  try {
    await deleteDoc(doc(db, 'offers', id));
    STORE.offers = STORE.offers.filter(o => o.id !== id);
    renderOfferAdmin();
    toast('Offer deleted.');
  } catch (error) {
    console.error('Error deleting offer:', error);
    toast('Error deleting offer');
  }
}

// ════════════════════════════════════════════════════════
// STYLISTS
// ════════════════════════════════════════════════════════

function renderStylistAdmin() {
  var w = document.getElementById('stylistAdminList');
  if (!STORE.stylists || !STORE.stylists.length) {
    w.innerHTML = '<div class="empty-state">No stylists added yet. Add your first stylist above.</div>';
    return;
  }
  w.innerHTML = '<div class="card"><div>' + STORE.stylists.map(s =>
    '<div class="srv-admin-row' + (s.active ? '' : ' inactive') + '">'
    + '<span class="srv-admin-name">💇 ' + s.name + '</span>'
    + '<span class="srv-admin-cat">' + (s.spec || '—') + '</span>'
    + '<span class="srv-admin-dur">' + (s.exp || '—') + '</span>'
    + '<span class="srv-admin-actions">'
    + '<button class="btn btn-outline btn-sm" onclick="editStylist(\'' + s.id + '\')">Edit</button>'
    + '<button class="btn ' + (s.active ? 'btn-outline' : 'btn-green') + ' btn-sm" onclick="toggleStylist(\'' + s.id + '\')">' + (s.active ? 'Deactivate' : 'Activate') + '</button>'
    + '<button class="btn btn-red btn-sm" onclick="deleteStylist(\'' + s.id + '\')">Delete</button>'
    + '</span></div>'
  ).join('') + '</div></div>';
}

function openStylistModal() {
  document.getElementById('stylistEditId').value = '';
  document.getElementById('stylistName').value = '';
  document.getElementById('stylistSpec').value = '';
  document.getElementById('stylistExp').value = '';
  document.getElementById('stylistModalTitle').textContent = 'Add Stylist';
  document.getElementById('stylistOverlay').classList.add('on');
}

function editStylist(id) {
  var s = STORE.stylists.find(x => x.id === id);
  if (!s) return;
  document.getElementById('stylistEditId').value = id;
  document.getElementById('stylistName').value = s.name;
  document.getElementById('stylistSpec').value = s.spec || '';
  document.getElementById('stylistExp').value = s.exp || '';
  document.getElementById('stylistModalTitle').textContent = 'Edit Stylist';
  document.getElementById('stylistOverlay').classList.add('on');
}

function closeStylistModal() {
  document.getElementById('stylistOverlay').classList.remove('on');
}

async function saveStylist() {
  var name = document.getElementById('stylistName').value.trim();
  if (!name) { toast('Name is required.'); return; }
  var editId = document.getElementById('stylistEditId').value;
  if (!STORE.stylists) STORE.stylists = [];
  try {
    if (editId) {
      var s = STORE.stylists.find(x => x.id === editId);
      if (s) {
        s.name = name;
        s.spec = document.getElementById('stylistSpec').value.trim();
        s.exp = document.getElementById('stylistExp').value.trim();
        await setDoc(doc(db, 'stylists', editId), s);
      }
    } else {
      var newS = { name: name, spec: document.getElementById('stylistSpec').value.trim(), exp: document.getElementById('stylistExp').value.trim(), active: true };
      var newId = 'st' + Date.now();
      await setDoc(doc(db, 'stylists', newId), newS);
      newS.id = newId;
      STORE.stylists.push(newS);
    }
    closeStylistModal();
    renderStylistAdmin();
    toast('Stylist saved!');
  } catch (err) {
    console.error(err);
    toast('Error saving stylist');
  }
}

async function toggleStylist(id) {
  var s = STORE.stylists.find(x => x.id === id);
  if (s) {
    s.active = !s.active;
    try {
      await updateDoc(doc(db, 'stylists', id), { active: s.active });
      renderStylistAdmin();
      toast(s.active ? 'Stylist activated.' : 'Stylist deactivated.');
    } catch (err) { toast('Error updating stylist'); }
  }
}

async function deleteStylist(id) {
  if (!confirm('Remove this stylist?')) return;
  try {
    await deleteDoc(doc(db, 'stylists', id));
    STORE.stylists = STORE.stylists.filter(s => s.id !== id);
    renderStylistAdmin();
    toast('Stylist removed.');
  } catch (err) { toast('Error removing stylist'); }
}

// ════════════════════════════════════════════════════════
// GALLERY
// ════════════════════════════════════════════════════════���═════════════

var galColors = ['linear-gradient(135deg,#c9a484,#8a6040)', 'linear-gradient(135deg,#b89470,#6a4028)', 'linear-gradient(135deg,#d4b090,#a07050)', 'linear-gradient(135deg,#8a6850,#604030)', 'linear-gradient(135deg,#c0987a,#805040)', 'linear-gradient(135deg,#a08060,#705030)'];
var galIcons = { hair: '✂️', bridal: '💄', skin: '🧖', nails: '💅', shop: '🏠' };

function renderGalAdmin() {
  var w = document.getElementById('galMgrGrid');
  var items = STORE.gallery.map(g => {
    var bg = g.url ? 'url(' + g.url + ') center/cover' : '';
    var style = bg ? 'background:' + bg + ';' : 'background:' + g.color + ';';
    var previewBadge = g.showInPreview ? '<span class="preview-badge">★ Preview</span>' : '';
    return '<div class="gal-item">' + previewBadge + '<div class="gal-swatch" style="' + style + '">' + (!g.url ? (galIcons[g.cat] || '📸') : '') + '</div><div class="gal-lbl">' + g.label + '<div><span class="cat-pill">' + g.cat + '</span></div></div><div class="gal-actions"><button class="gal-action-btn" onclick="toggleGalPreview(\'' + g.id + '\')" title="' + (g.showInPreview ? 'Remove from preview' : 'Add to preview') + '">' + (g.showInPreview ? '★' : '☆') + '</button><button class="gal-del" onclick="deleteGalItem(\'' + g.id + '\')" title="Delete">✕</button></div></div>';
  }).join('');
  w.innerHTML = items + '<div class="add-gal-tile" onclick="openGalModal()"><span class="plus">+</span><span>Add Photo</span></div>';
}

function openGalModal() {
  document.getElementById('galLabel').value = '';
  document.getElementById('galUrl').value = '';
  document.getElementById('galCat').value = 'hair';
  document.getElementById('galPreview').checked = true;
  document.getElementById('galOverlay').classList.add('on');
}

function closeGalModal() {
  document.getElementById('galOverlay').classList.remove('on');
}

async function saveGalItem() {
  var label = document.getElementById('galLabel').value.trim();
  if (!label) { toast('Label is required.'); return; }
  var cat = document.getElementById('galCat').value;
  var url = document.getElementById('galUrl').value.trim();
  var showInPreview = document.getElementById('galPreview').checked;
  var color = galColors[Math.floor(Math.random() * galColors.length)];
  
  try {
    var newGal = {
      cat: cat,
      label: label,
      color: color,
      icon: galIcons[cat] || '📸',
      url: url,
      showInPreview: showInPreview
    };
    const newId = 'g' + Date.now();
    await setDoc(doc(db, 'gallery', newId), newGal);
    newGal.id = newId;
    STORE.gallery.push(newGal);
    closeGalModal();
    renderGalAdmin();
    toast('Photo added!');
  } catch (error) {
    console.error('Error saving gallery item:', error);
    toast('Error adding photo');
  }
}

async function toggleGalPreview(id) {
  var g = STORE.gallery.find(x => x.id === id);
  if (g) {
    g.showInPreview = !g.showInPreview;
    try {
      await updateDoc(doc(db, 'gallery', id), { showInPreview: g.showInPreview });
      renderGalAdmin();
      toast(g.showInPreview ? 'Added to preview' : 'Removed from preview');
    } catch (error) {
      console.error('Error toggling preview:', error);
      toast('Error updating preview');
    }
  }
}

async function deleteGalItem(id) {
  if (!confirm('Remove this gallery item?')) return;
  try {
    await deleteDoc(doc(db, 'gallery', id));
    STORE.gallery = STORE.gallery.filter(g => g.id !== id);
    renderGalAdmin();
    toast('Gallery item removed.');
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    toast('Error removing item');
  }
}

// ════════════════════════════════════════════════════════
// MISC
// ════════════════════════════════════════════════════════

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeSrvModal();
    closeOfferModal();
    closeGalModal();
    closeStatusModal();
  }
});
async function deleteSelectedAppointments() {
  const checked =
    document.querySelectorAll(
      '.appt-checkbox:checked'
    );

  if (checked.length === 0) {
    toast('Select appointments first');
    return;
  }

  if (!confirm('Delete selected appointments?'))
    return;

  try {

    for (const item of checked) {

      const id = item.value;

      await deleteDoc(
        doc(db, 'bookings', id)
      );

      STORE.bookings =
        STORE.bookings.filter(
          b => b.id !== id
        );

    }

    renderAppts();

    initDashboard();

    toast('Appointments deleted');

    } catch (err) {

     console.error(err);

      toast('Delete failed');

  }

}

// ════════════════════════════════════════════════════════
// CSS ADDITIONS FOR GALLERY ITEMS + MOBILE ADMIN
// ════════════════════════════════════════════════════════
const style = document.createElement('style');
style.textContent = `
.gal-item{position:relative;aspect-ratio:4/3;overflow:hidden;border:1px solid var(--border);border-radius:var(--radius);transition:box-shadow 0.3s;}
.gal-item:hover{box-shadow:0 4px 20px rgba(92,61,46,0.12);}
.gal-swatch{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;opacity:0.25;}
.gal-lbl{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(46,26,14,0.8));padding:1rem 0.6rem 0.4rem;font-size:0.65rem;color:#fff;}
.gal-actions{position:absolute;top:0.3rem;right:0.3rem;display:flex;gap:0.25rem;}
.gal-action-btn{background:rgba(212,184,150,0.9);border:none;color:var(--dark);width:26px;height:26px;font-size:0.85rem;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:3px;transition:all 0.2s;}
.gal-action-btn:hover{background:var(--beige);transform:scale(1.1);}
.gal-del{background:rgba(163,51,51,0.85);border:none;color:#fff;width:26px;height:26px;font-size:0.75rem;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:3px;transition:all 0.2s;}
.gal-del:hover{background:#c0392b;transform:scale(1.1);}
.preview-badge{position:absolute;top:0.4rem;left:0.4rem;background:rgba(45,122,74,0.9);color:#fff;font-size:0.5rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.2rem 0.5rem;border-radius:10px;z-index:2;backdrop-filter:blur(4px);}
.cat-pill{display:inline-block;font-size:0.55rem;letter-spacing:0.1em;text-transform:uppercase;background:rgba(158,123,92,0.15);color:var(--taupe);padding:0.15rem 0.5rem;margin-top:0.3rem;border-radius:2px;}
.add-gal-tile{aspect-ratio:4/3;border:1px dashed var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-direction:column;gap:0.4rem;color:var(--taupe);font-size:0.75rem;transition:all 0.3s;border-radius:var(--radius);}
.add-gal-tile:hover{border-color:var(--brown);color:var(--brown);background:rgba(92,61,46,0.03);}
.add-gal-tile .plus{font-size:1.5rem;}
#galMgrGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:1rem;}
.srv-admin-row{display:flex;align-items:center;gap:1rem;padding:0.9rem 1rem;border-bottom:1px solid var(--borderl);transition:background 0.15s;}
.srv-admin-row:last-child{border-bottom:none;}
.srv-admin-row:hover{background:var(--pale);}
.srv-admin-row.inactive{opacity:0.45;}
.srv-admin-name{font-weight:500;font-size:0.85rem;flex:2;}
.srv-admin-cat{font-size:0.7rem;color:var(--taupe);flex:1;}
.srv-admin-price{font-size:0.85rem;color:var(--brown);font-weight:500;flex:1;}
.srv-admin-dur{font-size:0.72rem;color:var(--taupe);flex:1;}
.srv-admin-actions{display:flex;gap:0.4rem;flex-shrink:0;flex-wrap:wrap;}
.offer-admin-card{border:1px solid var(--border);padding:1.2rem;margin-bottom:1rem;display:flex;align-items:flex-start;gap:1.5rem;border-radius:var(--radius);transition:box-shadow 0.3s;}
.offer-admin-card:hover{box-shadow:0 2px 15px rgba(92,61,46,0.08);}
.offer-admin-card.inactive{opacity:0.45;}
.oa-body{flex:1;}
.oa-name{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:400;margin-bottom:0.2rem;}
.oa-desc{font-size:0.75rem;color:var(--taupe);margin-bottom:0.5rem;}
.oa-price{font-size:0.85rem;color:var(--brown);}
.oa-orig{font-size:0.75rem;color:var(--taupe);text-decoration:line-through;margin-left:0.5rem;}
.oa-actions{display:flex;flex-direction:column;gap:0.4rem;flex-shrink:0;}

/* ADMIN MOBILE */
.admin-hamburger{display:none;position:fixed;top:1rem;left:1rem;z-index:600;background:var(--dark);border:none;cursor:pointer;padding:0.6rem;border-radius:var(--radius);flex-direction:column;gap:4px;box-shadow:0 2px 12px rgba(0,0,0,0.2);}
.admin-hamburger span{display:block;width:20px;height:2px;background:#fff;transition:all 0.3s;}
.admin-hamburger.open span:nth-child(1){transform:rotate(45deg) translate(4px,4px);}
.admin-hamburger.open span:nth-child(2){opacity:0;}
.admin-hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(4px,-4px);}
.sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:490;backdrop-filter:blur(2px);}
.sidebar-overlay.open{display:block;}

@media(max-width:768px){
  .admin-hamburger{display:flex;}
  .sidebar{position:fixed!important;left:-260px;top:0;bottom:0;z-index:500;width:230px!important;transition:left 0.35s cubic-bezier(0.4,0,0.2,1);box-shadow:none;}
  .sidebar.open{left:0;box-shadow:4px 0 30px rgba(0,0,0,0.3);}
  .main{margin-left:0!important;}
  .panel{padding:1.5rem 1rem!important;padding-top:4rem!important;}
  .panel-title{font-size:1.6rem!important;}
  .stats-row{grid-template-columns:1fr 1fr!important;}
  #galMgrGrid{grid-template-columns:repeat(2,1fr)!important;}
  .ctrl-row{flex-direction:column;align-items:stretch;}
  .ctrl-row select,.ctrl-row input{width:100%;}
  .srv-admin-row{flex-direction:column;align-items:flex-start;gap:0.5rem;}
  .srv-admin-actions{width:100%;justify-content:flex-start;}
  .offer-admin-card{flex-direction:column;gap:0.8rem;}
  .oa-actions{flex-direction:row;}
  .dashboard-side-grid{grid-template-columns:1fr!important;}
  .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  table{min-width:700px;}
  .fr{grid-template-columns:1fr!important;}
  .login-box{width:92vw!important;padding:2rem 1.5rem!important;}
  .modal{width:95vw!important;}
}
@media(max-width:480px){
  .stats-row{grid-template-columns:1fr!important;}
  #galMgrGrid{grid-template-columns:1fr 1fr!important;}
  .stat-num{font-size:2rem;}
  .panel{padding:1rem 0.8rem!important;padding-top:4rem!important;}
}
`;
document.head.appendChild(style);

// ── ADMIN MOBILE SIDEBAR TOGGLE ──
function toggleAdminSidebar() {
  document.getElementById('adminSidebar').classList.toggle('open');
  document.getElementById('adminHamburger').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

// ── Expose EVERY function called from HTML or dynamic innerHTML ──
window.trySecureLogin = trySecureLogin;
window.togglePasswordVisibility = togglePasswordVisibility;
window.doLogout = doLogout;
window.showPanel = showPanel;
window.toggleAdminSidebar = toggleAdminSidebar;

// Services
window.openSrvModal = openSrvModal;
window.closeSrvModal = closeSrvModal;
window.saveSrv = saveSrv;
window.editSrv = editSrv;
window.toggleSrvActive = toggleSrvActive;
window.deleteSrv = deleteSrv;
window.renderSrvAdmin = renderSrvAdmin;

// Offers
window.openOfferModal = openOfferModal;
window.closeOfferModal = closeOfferModal;
window.saveOffer = saveOffer;
window.editOffer = editOffer;
window.toggleOffer = toggleOffer;
window.deleteOffer = deleteOffer;
window.renderOfferAdmin = renderOfferAdmin;

// Gallery
window.openGalModal = openGalModal;
window.closeGalModal = closeGalModal;
window.saveGalItem = saveGalItem;
window.deleteGalItem = deleteGalItem;
window.renderGalAdmin = renderGalAdmin;
window.toggleGalPreview = toggleGalPreview;

// Appointments
window.exportCSV = exportCSV;
window.renderAppts = renderAppts;
window.deleteSelectedAppointments = deleteSelectedAppointments;
window.openStatusModal = openStatusModal;
window.closeStatusModal = closeStatusModal;
window.saveStatus = saveStatus;
window.toggleWaPreview = toggleWaPreview;

// Stylists
window.openStylistModal = openStylistModal;
window.closeStylistModal = closeStylistModal;
window.saveStylist = saveStylist;
window.editStylist = editStylist;
window.toggleStylist = toggleStylist;
window.deleteStylist = deleteStylist;
window.renderStylistAdmin = renderStylistAdmin;
window.toggleDarkMode = toggleDarkMode;

document.addEventListener('change', function(e){

  if(e.target.id === 'selectAllAppointments'){

    const all =
      document.querySelectorAll('.appt-checkbox');

    all.forEach(box => {
      box.checked = e.target.checked;
    });

  }

});

function toggleDarkMode(){

  document.body.classList.toggle('dark');

  const darkEnabled =
    document.body.classList.contains('dark');

  localStorage.setItem(
    'darkMode',
    darkEnabled
  );

  const btn =
    document.getElementById('darkModeBtn');

  btn.textContent =
    darkEnabled
    ? '☀️ Light Mode'
    : '🌙 Dark Mode';

}

function openCustomerHistory(phone){

  const bookings =
    STORE.bookings.filter(
      b => b.phone === phone
    );

  if(bookings.length === 0){
    toast('No history found');
    return;
  }

  const customer = bookings[0];

  let totalSpent = 0;

  bookings.forEach(b => {
    totalSpent += b.total || 0;
  });

  const services = [];

  bookings.forEach(b => {

    (b.services || []).forEach(s => {

      if(!services.includes(s)){
        services.push(s);
      }

    });

  });

  alert(

    'Customer: ' + customer.name +

    '\n\nVisits: ' + bookings.length +

    '\nTotal Spent: ₹' + totalSpent +

    '\n\nServices:\n• ' +

    services.join('\n• ')

  );

}
window.openCustomerHistory =
openCustomerHistory;
async function quickUpdateStatus(id, status){

  try{

    await updateDoc(
      doc(db, 'bookings', id),
      { status: status }
    );

    const booking =
      STORE.bookings.find(
        b => b.id === id
      );

    if(booking){
      booking.status = status;
    }

    initDashboard();

    renderAppts();

    toast('Appointment ' + status);

  }catch(err){

    console.error(err);

    toast('Update failed');

  }

}

window.quickUpdateStatus =
quickUpdateStatus;