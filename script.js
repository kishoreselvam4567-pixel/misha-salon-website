import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

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
const db = getFirestore(app);
 
 
 // ── SHARED DATA STORE (synced with admin via localStorage) ──
            var STORE = {
                services: [
                    { id: 's1', cat: 'Hair', name: 'Hair Cut (Ladies)', desc: 'Precision cut tailored to your face shape and hair texture by expert stylists.', price: 300, duration: '30 min', active: true },
                    { id: 's2', cat: 'Hair', name: 'Hair Cut (Gents)', desc: 'Classic and modern cuts for men and boys with wash and blow dry.', price: 150, duration: '20 min', active: true },
                    { id: 's3', cat: 'Hair', name: 'Hair Colouring', desc: 'Global colour, highlights, balayage and fashion colours using premium brands.', price: 800, duration: '90 min', active: true },
                    { id: 's4', cat: 'Hair', name: 'Keratin / Smoothing', desc: 'Frizz-free, silky smooth hair with long-lasting keratin treatment.', price: 2500, duration: '2.5 hrs', active: true },
                    { id: 's5', cat: 'Hair', name: 'Hair Spa & Deep Conditioning', desc: 'Intensive conditioning to restore shine, strength and softness.', price: 600, duration: '45 min', active: true },
                    { id: 's6', cat: 'Hair', name: 'Blow Dry & Styling', desc: 'Professional blowout with curling, straightening, or updo styling.', price: 350, duration: '30 min', active: true },
                    { id: 's7', cat: 'Makeup & Bridal', name: 'Bridal Makeup', desc: 'Full bridal look with airbrush foundation and long-lasting finish.', price: 5000, duration: '3 hrs', active: true },
                    { id: 's8', cat: 'Makeup & Bridal', name: 'Party / Event Makeup', desc: 'Glamorous looks for receptions, parties and special occasions.', price: 1200, duration: '60 min', active: true },
                    { id: 's9', cat: 'Makeup & Bridal', name: 'Saree Draping', desc: 'Expert saree draping in various styles — Kanjeevaram, Nivi, Gujarati.', price: 400, duration: '20 min', active: true },
                    { id: 's10', cat: 'Makeup & Bridal', name: 'Pre-Bridal Package', desc: 'Complete glow-up: facial, body polish, waxing & hair treatment.', price: 3500, duration: '4 hrs', active: true },
                    { id: 's11', cat: 'Skin & Face', name: 'Basic Facial', desc: 'Deep cleansing with steaming, extraction and moisturising.', price: 500, duration: '45 min', active: true },
                    { id: 's12', cat: 'Skin & Face', name: 'Gold / Pearl Facial', desc: 'Luxurious facial for radiant and glowing skin.', price: 900, duration: '60 min', active: true },
                    { id: 's13', cat: 'Skin & Face', name: 'Threading (Eyebrow)', desc: 'Clean, precise eyebrow shaping by experienced artists.', price: 50, duration: '10 min', active: true },
                    { id: 's14', cat: 'Skin & Face', name: 'Full Face Waxing & Bleach', desc: 'Complete face hair removal with brightening bleach treatment.', price: 200, duration: '30 min', active: true },
                    { id: 's15', cat: 'Nails', name: 'Manicure', desc: 'Classic manicure with soak, shape, cuticle care and polish.', price: 300, duration: '30 min', active: true },
                    { id: 's16', cat: 'Nails', name: 'Pedicure', desc: 'Relaxing foot soak, scrub, massage and nail polish.', price: 400, duration: '45 min', active: true },
                    { id: 's17', cat: 'Nails', name: 'Gel Nail Extensions', desc: 'Custom gel extensions with your choice of shape and nail art.', price: 800, duration: '60 min', active: true },
                    { id: 's18', cat: 'Nails', name: 'Nail Art', desc: 'Florals, ombre, glitter, stone work and creative designs.', price: 200, duration: '30 min', active: true }
                ],
                offers: [
                    { id: 'o1', name: 'Bridal Bliss Package', desc: 'Bridal makeup + hair styling + saree draping. Perfect for your big day.', orig: 7000, price: 5500, active: true },
                    { id: 'o2', name: 'Glow Up Special', desc: 'Gold facial + manicure + pedicure. Treat yourself this weekend.', orig: 1800, price: 1299, active: true },
                    { id: 'o3', name: 'Hair Transformation', desc: 'Haircut + hair spa + blow dry combo for lustrous, healthy hair.', orig: 1300, price: 999, active: true }
                ],
                gallery: [
                    { id: 'g1', cat: 'hair', label: 'Hair Cut & Style', color: 'linear-gradient(135deg,#c9a484,#8a6040)', icon: '✂️' },
                    { id: 'g2', cat: 'bridal', label: 'Bridal Makeup', color: 'linear-gradient(135deg,#b89470,#6a4028)', icon: '👰' },
                    { id: 'g3', cat: 'hair', label: 'Hair Colour', color: 'linear-gradient(135deg,#d4b090,#a07050)', icon: '🎨' },
                    { id: 'g4', cat: 'skin', label: 'Facial Treatment', color: 'linear-gradient(135deg,#8a6850,#604030)', icon: '✨' },
                    { id: 'g5', cat: 'nails', label: 'Nail Art', color: 'linear-gradient(135deg,#c0987a,#805040)', icon: '💅' },
                    { id: 'g6', cat: 'bridal', label: 'Party Makeup', color: 'linear-gradient(135deg,#a08060,#705030)', icon: '💄' },
                    { id: 'g7', cat: 'hair', label: 'Keratin Treatment', color: 'linear-gradient(135deg,#b8906a,#784830)', icon: '🌟' },
                    { id: 'g8', cat: 'shop', label: 'Salon Interior', color: 'linear-gradient(135deg,#c8a888,#8a6848)', icon: '🏠' },
                    { id: 'g9', cat: 'skin', label: 'Spa & Wellness', color: 'linear-gradient(135deg,#a07858,#684028)', icon: '🧖' },
                    { id: 'g10', cat: 'hair', label: 'Smoothing Treatment', color: 'linear-gradient(135deg,#d0b090,#987050)', icon: '💇' },
                    { id: 'g11', cat: 'bridal', label: 'Saree Draping', color: 'linear-gradient(135deg,#b89070,#785030)', icon: '🌸' },
                    { id: 'g12', cat: 'nails', label: 'Gel Nails', color: 'linear-gradient(135deg,#c0a080,#806040)', icon: '✨' }
                ],
                bookings: [],
                stylists: []
            };

            function startRealtimeSync() {

  // SERVICES
  onSnapshot(collection(db, "services"), (snapshot) => {

    STORE.services = [];

    snapshot.forEach((doc) => {
      STORE.services.push({
        id: doc.id,
        ...doc.data()
      });
    });

    renderHomeServices();

    if(document.getElementById('srvGrid')){
      renderServices();
    }

  });

  // OFFERS
  onSnapshot(collection(db, "offers"), (snapshot) => {

    STORE.offers = [];

    snapshot.forEach((doc) => {
      STORE.offers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    renderOffers();

  });

  // GALLERY
  onSnapshot(collection(db, "gallery"), (snapshot) => {

    STORE.gallery = [];

    snapshot.forEach((doc) => {
      STORE.gallery.push({
        id: doc.id,
        ...doc.data()
      });
    });

    renderGalleryPreview();

    if(document.getElementById('galGrid')){
      renderGallery('all');
    }

  });

  // STYLISTS
  onSnapshot(collection(db, "stylists"), (snapshot) => {

    STORE.stylists = [];

    snapshot.forEach((doc) => {
      STORE.stylists.push({
        id: doc.id,
        ...doc.data()
      });
    });

  });

}

            // ── CART ──
            var cart = {};

            // ── NAVIGATION ──
            function go(id) {
                document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
                document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('act'));
                document.getElementById('pg-' + id).classList.add('on');
                var nb = document.getElementById('n-' + id);
                if (nb) nb.classList.add('act');
                window.scrollTo(0, 0);
                if (id === 'services') renderServices();
                if (id === 'booking') renderBooking();
                if (id === 'gallery') renderGallery('all');
            if (id === 'home') { renderHomeServices(); renderOffers(); renderGalleryPreview(); }
            }

            // ── MOBILE MENU ──
            function toggleMenu() {
                document.querySelector('.hamburger').classList.toggle('open');
                document.getElementById('mobileNav').classList.toggle('open');
            }
            function mobileGo(id) {
                toggleMenu();
                go(id);
            }

            // ── HOME SERVICES PREVIEW ──
            var catIcons = { 'Hair': '✂️', 'Makeup & Bridal': '💄', 'Skin & Face': '🧖‍♀️', 'Nails': '💅' };
            function renderHomeServices() {
                var grid = document.getElementById('srvHomeGrid');
                var cats = [...new Set(STORE.services.filter(s => s.active).map(s => s.cat))].slice(0, 6);
                grid.innerHTML = cats.map(cat => {
                    var srvs = STORE.services.filter(s => s.active && s.cat === cat);
                    var from = Math.min(...srvs.map(s => s.price));
                    return '<div class="srv-home-card" onclick="go(\'services\')"><span class="shc-icon">' + (catIcons[cat] || '✨') + '</span><div class="shc-name serif">' + cat + '</div><p class="shc-desc">' + srvs.map(s => s.name).slice(0, 3).join(', ') + (srvs.length > 3 ? ' & more' : '') + '.</p><span class="shc-link">from ₹' + from + ' — Browse →</span></div>';
                }).join('');
            }

            // ── OFFERS ──
            function renderOffers() {
                var g = document.getElementById('offersGrid');
                var active = STORE.offers.filter(o => o.active);
                if (!active.length) { g.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:0.85rem;grid-column:span 3;text-align:center;padding:2rem;">No current offers.</p>'; return; }
                g.innerHTML = active.map(o => '<div class="offer-card"><span class="offer-badge">Special Offer</span><div class="offer-name serif">' + o.name + '</div><p class="offer-desc">' + o.desc + '</p><div><span class="offer-price">₹' + o.price.toLocaleString('en-IN') + '</span><span class="offer-orig">₹' + o.orig.toLocaleString('en-IN') + '</span></div></div>').join('');
            }

            // ── GALLERY PREVIEW (HOME PAGE — Pinterest Masonry) ──
            var lightboxImages = [];
            var lightboxIndex = 0;

            function renderGalleryPreview() {
                var grid = document.getElementById('galleryPreviewGrid');
                if (!grid) return;
                // Only show items flagged for preview
                var previewItems = STORE.gallery.filter(i => i.showInPreview && i.url);
                if (!previewItems.length) {
                    // Fallback: show first 6 items with URLs
                    previewItems = STORE.gallery.filter(i => i.url).slice(0, 6);
                }
                if (!previewItems.length) {
                    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--taupe);font-size:0.85rem;">No gallery images yet.</div>';
                    return;
                }
                grid.innerHTML = previewItems.map((item, idx) => `
                    <div class="masonry-item" onclick="openLightbox(${idx}, 'preview')">
                        <img src="${item.url}" alt="${item.label || ''}" loading="lazy">
                        <div class="masonry-overlay">
                            <span class="masonry-zoom">🔍</span>
                            <span class="masonry-label">${item.label || ''}</span>
                            <span class="masonry-cat">${item.cat || ''}</span>
                        </div>
                    </div>
                `).join('');
            }

            // ── GALLERY PAGE (Full Masonry) ──
            function renderGallery(cat) {
                var g = document.getElementById('galGrid');
                if (!g) return;
                var items = cat === 'all' ? STORE.gallery : STORE.gallery.filter(i => i.cat === cat);
                var withUrls = items.filter(i => i.url);
                if (!withUrls.length) {
                    g.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--taupe);font-size:0.85rem;">No images in this category yet.</div>';
                    return;
                }
                g.innerHTML = withUrls.map((item, idx) => `
                    <div class="gf-card" onclick="openLightbox(${idx}, 'gallery', '${cat}')">
                        <img src="${item.url}" alt="${item.label || ''}" loading="lazy">
                        <div class="gf-overlay">
                            <span class="gf-zoom">🔍</span>
                            <span class="gf-label">${item.label || ''}</span>
                            <span class="gf-cat">${item.cat || ''}</span>
                        </div>
                    </div>
                `).join('');
            }

            // ── LIGHTBOX ──
            function openLightbox(index, source, cat) {
                if (source === 'preview') {
                    var previewItems = STORE.gallery.filter(i => i.showInPreview && i.url);
                    if (!previewItems.length) previewItems = STORE.gallery.filter(i => i.url).slice(0, 6);
                    lightboxImages = previewItems;
                } else {
                    var items = (cat && cat !== 'all') ? STORE.gallery.filter(i => i.cat === cat) : STORE.gallery;
                    lightboxImages = items.filter(i => i.url);
                }
                lightboxIndex = index;
                updateLightbox();
                document.getElementById('lightboxOverlay').classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            function closeLightbox(e) {
                if (e && e.target !== e.currentTarget && !e.target.classList.contains('lightbox-close')) return;
                document.getElementById('lightboxOverlay').classList.remove('active');
                document.body.style.overflow = '';
            }

            function lightboxNav(dir, e) {
                if (e) { e.stopPropagation(); e.preventDefault(); }
                lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
                updateLightbox();
            }

            function updateLightbox() {
                if (!lightboxImages.length) return;
                var item = lightboxImages[lightboxIndex];
                document.getElementById('lightboxImg').src = item.url;
                document.getElementById('lightboxCaption').textContent = item.label || '';
                document.getElementById('lightboxCounter').textContent = (lightboxIndex + 1) + ' / ' + lightboxImages.length;
            }

            // Keyboard navigation for lightbox
            document.addEventListener('keydown', function(e) {
                var overlay = document.getElementById('lightboxOverlay');
                if (!overlay || !overlay.classList.contains('active')) return;
                if (e.key === 'Escape') closeLightbox(e);
                if (e.key === 'ArrowLeft') lightboxNav(-1, e);
                if (e.key === 'ArrowRight') lightboxNav(1, e);
            });

            function filterGal(cat, btn) {
                document.querySelectorAll('.gtab').forEach(t => t.classList.remove('on'));
                btn.classList.add('on');
                renderGallery(cat);
            }

            // ── SERVICES PAGE ──
            function renderServices() {
                var cats = [...new Set(STORE.services.filter(s => s.active).map(s => s.cat))];
                var html = cats.map(cat => {
                    var srvs = STORE.services.filter(s => s.active && s.cat === cat);
                    return '<div class="srv-cat"><div class="srv-cat-title"><span>' + (catIcons[cat] || '✨') + ' ' + cat + '</span><span class="srv-cat-line"></span></div><div class="srv-grid">' +
                        srvs.map(s => '<div class="srv-c' + (cart[s.id] ? ' sel' : '') + '" onclick="toggleSrv(this,\'' + s.id + '\')" data-id="' + s.id + '" data-name="' + s.name + '" data-price="' + s.price + '"><div class="srv-tick">✓</div><div class="srv-body"><div class="srv-nm">' + s.name + '</div><div class="srv-dt">' + s.desc + '</div><div class="srv-meta"><span class="srv-pr">₹' + s.price.toLocaleString('en-IN') + '</span><span class="srv-dur">⏱ ' + s.duration + '</span></div></div></div>').join('') +
                        '</div></div>';
                }).join('');
                document.getElementById('srvList').innerHTML = html;
            }
            function toggleSrv(card, id) {
                var s = STORE.services.find(x => x.id === id);
                if (!s) return;
                if (cart[id]) { delete cart[id]; card.classList.remove('sel'); }
                else { cart[id] = { name: s.name, price: s.price }; card.classList.add('sel'); }
                updateCart();
            }
            function updateCart() {
                var keys = Object.keys(cart), total = keys.reduce((a, k) => a + cart[k].price, 0);
                document.getElementById('cartCount').textContent = keys.length;
                document.getElementById('cartTotal').textContent = '₹' + total.toLocaleString('en-IN');
                document.getElementById('cartBtn').disabled = keys.length === 0;
            }

            // ── POPULATE STYLIST DROPDOWN FROM FIRESTORE ──
            function populateStylistDropdown() {
                var sel = document.getElementById('b_stylist');
                if (!sel) return;
                var active = (STORE.stylists || []).filter(s => s.active);
                if (active.length) {
                    sel.innerHTML = '<option value="">Select a stylist…</option>' + active.map(s => '<option value="' + s.name + '">' + s.name + (s.spec ? ' — ' + s.spec : '') + '</option>').join('') + '<option value="Any">No preference (Any available)</option>';
                } else {
                    sel.innerHTML = '<option value="Any">Any available stylist</option>';
                }
            }

            // ── CHECK SLOT AVAILABILITY ──
            function updateAvailableTimes() {
                var dt = document.getElementById('b_dt').value;
                var tm = document.getElementById('b_tm').value;
                var stylistSel = document.getElementById('b_stylist').value;
                var msg = document.getElementById('stylistSlotMsg');
                if (!dt || !tm || !stylistSel || stylistSel === 'Any') { msg.style.display = 'none'; return; }
                var conflict = STORE.bookings.find(b =>
                    b.date === dt && b.time === tm && b.stylist === stylistSel
                    && b.status !== 'Cancelled'
                );
                if (conflict) {
                    msg.textContent = '⚠️ ' + stylistSel + ' is already booked at this time. Please pick a different time or stylist.';
                    msg.style.display = 'block';
                } else {
                    msg.style.display = 'none';
                }
            }

            // ── BOOKING ──
            async function submitBooking() {
                var errEl = document.getElementById('bk-error-msg');
                errEl.style.display = 'none';

                var fn = document.getElementById('b_fn').value.trim();
                var ph = document.getElementById('b_ph').value.trim();
                var dt = document.getElementById('b_dt').value;
                var tm = document.getElementById('b_tm').value;
                var stylist = document.getElementById('b_stylist').value;

                // Basic field validation
                if (!fn || !ph || !dt || !tm || !stylist) {
                    errEl.textContent = 'Please fill in Name, Phone, Date, Time and Stylist.';
                    errEl.style.display = 'block';
                    return;
                }

                // Prevent past date booking
                var today = new Date(); today.setHours(0,0,0,0);
                var chosen = new Date(dt);
                if (chosen < today) {
                    errEl.textContent = 'Please select today or a future date.';
                    errEl.style.display = 'block';
                    return;
                }

                // Phone validation — must be 10 digits (after stripping +91 / spaces)
                var rawPhone = ph.replace(/[\s\-\+]/g, '');
                if (rawPhone.startsWith('91')) rawPhone = rawPhone.slice(2);
                if (!/^\d{10}$/.test(rawPhone)) {
                    errEl.textContent = 'Please enter a valid 10-digit Indian mobile number.';
                    errEl.style.display = 'block';
                    return;
                }

                // Duplicate phone + slot spam check — same number can't book same date+time twice
                var samePhone = STORE.bookings.find(b =>
                    b.phone.replace(/\D/g,'').slice(-10) === rawPhone &&
                    b.date === dt && b.time === tm &&
                    b.status !== 'Cancelled'
                );
                if (samePhone) {
                    errEl.textContent = 'You already have an appointment on this date and time. Please choose a different slot.';
                    errEl.style.display = 'block';
                    return;
                }

                // Stylist slot conflict (skip if "Any")
                if (stylist !== 'Any') {
                    var conflict = STORE.bookings.find(b =>
                        b.date === dt && b.time === tm && b.stylist === stylist
                        && b.status !== 'Cancelled'
                    );
                    if (conflict) {
                        errEl.textContent = '⚠️ ' + stylist + ' is already booked at this time. Please select a different time or stylist.';
                        errEl.style.display = 'block';
                        return;
                    }
                }

                var b = {
                    id: 'BK' + String(STORE.bookings.length + 1).padStart(4, '0'),
                    name: fn + ' ' + document.getElementById('b_ln').value.trim(),
                    phone: ph,
                    email: document.getElementById('b_em').value.trim() || '—',
                    services: Object.values(cart).map(x => x.name),
                    total: Object.values(cart).reduce((a, x) => a + x.price, 0),
                    date: dt, time: tm,
                    stylist: stylist,
                    notes: document.getElementById('b_nt').value.trim() || '—',
                    submitted: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: 'Pending'
                };

                try {
                   await setDoc(doc(db, "bookings", b.id), b);
                } catch (err) {
                    console.error('Firestore booking error:', err);
                }
                STORE.bookings.push(b); saveStore();
                cart = {}; updateCart();
                document.getElementById('bkContent').style.display = 'none';
                document.getElementById('bkSuccess').style.display = 'block';
                window.scrollTo(0, 0);
            }

            // ── BOOKING SUMMARY ──
            function renderBooking() {
                var keys = Object.keys(cart);
                var grid = document.getElementById('bkGrid'), noMsg = document.getElementById('noSrvMsg');
                if (!keys.length) { grid.style.display = 'none'; noMsg.style.display = 'block'; return; }
                grid.style.display = 'grid'; noMsg.style.display = 'none';
                var total = keys.reduce((a, k) => a + cart[k].price, 0);
                document.getElementById('bkSumList').innerHTML = keys.map(k => '<div class="bk-item"><span class="bk-item-name">' + cart[k].name + '</span><span style="display:flex;align-items:center;"><span class="bk-item-price">₹' + cart[k].price.toLocaleString('en-IN') + '</span><button class="bk-item-remove" onclick="removeItem(\'' + k + '\')">×</button></span></div>').join('');
                document.getElementById('bkTotal').textContent = '₹' + total.toLocaleString('en-IN');
                populateStylistDropdown();
            }
            function removeItem(id) {
                delete cart[id];
                document.querySelectorAll('[data-id="' + id + '"]').forEach(c => c.classList.remove('sel'));
                updateCart(); renderBooking();
            }
            function resetBk() {
                document.getElementById('bkContent').style.display = 'block';
                document.getElementById('bkSuccess').style.display = 'none';
                ['b_fn', 'b_ln', 'b_ph', 'b_em', 'b_nt'].forEach(i => document.getElementById(i).value = '');
                document.getElementById('b_dt').value = '';
                document.getElementById('b_tm').value = '';
                document.getElementById('b_stylist').value = '';
                document.getElementById('bk-error-msg').style.display = 'none';
                document.getElementById('stylistSlotMsg').style.display = 'none';
                renderBooking();
            }
            window.addEventListener('scroll', function () {
                document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 20);
            });

            // ── INIT ──
            renderHomeServices(); renderOffers(); renderGalleryPreview();

            // Prevent booking past dates
            var todayStr = new Date().toISOString().split('T')[0];
            var dtInput = document.getElementById('b_dt');
            if (dtInput) dtInput.min = todayStr;

            let currentIndex = 0;
            const slides = document.querySelector('.slides');
            const totalSlides = document.querySelectorAll('.slide').length;

            function updateSlider() {
                slides.style.transform = `translateX(-${currentIndex * 100}%)`;
            }

            function nextSlide() {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateSlider();
            }

            function prevSlide() {
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateSlider();
            }

            /* Auto slide */
            setInterval(nextSlide, 4000);

            /* Swipe support (mobile) */
            let startX = 0;
            slides.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
            });
            slides.addEventListener('touchend', e => {
                let endX = e.changedTouches[0].clientX;
                if (startX - endX > 50) nextSlide();
                else if (endX - startX > 50) prevSlide();
            });
            startRealtimeSync();

window.toggleMenu = toggleMenu;
window.mobileGo = mobileGo;
window.go = go;
window.filterGal = filterGal;
window.toggleSrv = toggleSrv;
window.removeItem = removeItem;
window.resetBk = resetBk;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.submitBooking = submitBooking;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.lightboxNav = lightboxNav;