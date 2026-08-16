let deferredPrompt;
let studentDataStore = [];

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/static/sw.js')
      .then(() => console.log('PWA Service Worker Registered Successfully.'))
      .catch((err) => console.error('Service Worker Registration Failed:', err));
  });
}

// Intercept PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('installBanner');
  if (banner) banner.style.display = 'flex';
});

document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      document.getElementById('installBanner').style.display = 'none';
    }
    deferredPrompt = null;
  }
});

// Sidebar Drawer Control
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

// Fetch Students with Loader
async function fetchStudents() {
  const loader = document.getElementById('loader');
  const grid = document.getElementById('studentGrid');
  
  loader.style.display = 'block';
  grid.innerHTML = '';

  try {
    const res = await fetch('/api/students');
    const result = await res.json();
    
    if (result.status === 'success') {
      studentDataStore = result.data;
      renderStudents(studentDataStore);
    }
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center; color:red;">Failed to load records.</p>';
  } finally {
    loader.style.display = 'none';
  }
}

// Render Cards
function renderStudents(list) {
  const grid = document.getElementById('studentGrid');
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<p style="text-align:center; color:#888;">No student matching criteria.</p>';
    return;
  }

  list.forEach(student => {
    grid.innerHTML += `
      <div class="student-card">
        <img src="${student.avatar}" class="student-avatar" alt="Avatar">
        <div class="student-details">
          <h4>${student.name} <span class="course-badge">${student.course}</span></h4>
          <p><i class="fa-solid fa-id-card"></i> Roll No: ${student.roll_no} | Attendance: ${student.attendance}</p>
        </div>
      </div>
    `;
  });
}

// Client-side Search Filter
function filterStudents() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = studentDataStore.filter(s => 
    s.name.toLowerCase().includes(query) || s.roll_no.includes(query)
  );
  renderStudents(filtered);
}

// Modal Handlers
function openModal() { document.getElementById('studentModal').style.display = 'flex'; }
function closeModal() { document.getElementById('studentModal').style.display = 'none'; }

// Form Submission
async function handleAddStudent(e) {
  e.preventDefault();
  
  const payload = {
    name: document.getElementById('studentName').value,
    roll_no: document.getElementById('rollNo').value,
    course: document.getElementById('courseSelect').value
  };

  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeModal();
    document.getElementById('studentForm').reset();
    fetchStudents();
  }
}

document.addEventListener('DOMContentLoaded', fetchStudents);