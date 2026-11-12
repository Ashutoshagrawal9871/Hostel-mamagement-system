const API = '/api';
let students = [], rooms = [], fees = [], complaints = [];
const $ = id => document.getElementById(id);
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', {maximumFractionDigits:2});
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function request(path, options = {}) {
  const response = await fetch(API + path, {
    headers: {'Content-Type':'application/json', ...(options.headers || {})},
    ...options
  });
  if (!response.ok) {
    let message = 'Something went wrong.';
    try { const body = await response.json(); message = body.message || body.error || message; } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}
function notify(message, type='success') {
  const box = $('alert'); box.textContent = message; box.className = 'alert ' + type;
  window.clearTimeout(notify.timer); notify.timer = window.setTimeout(() => box.classList.add('hidden'), 3500);
}
async function refresh() {
  try {
    [students, rooms, fees, complaints] = await Promise.all([
      request('/students'), request('/rooms'), request('/fees'), request('/complaints')
    ]);
    renderAll();
  } catch (e) { notify(e.message, 'error'); }
}
async function renderDashboard() {
  const d = await request('/dashboard');
  $('stat-students').textContent = d.totalStudents;
  $('stat-rooms').textContent = d.totalRooms;
  $('stat-beds').textContent = d.availableBeds;
  $('stat-fees').textContent = money(d.feesCollected);
  $('stat-complaints').textContent = d.openComplaints;
  $('stat-fee-records').textContent = d.paidRecords;
  const pct = d.occupiedBeds + d.availableBeds ? Math.round(d.occupiedBeds / (d.occupiedBeds + d.availableBeds) * 100) : 0;
  $('occupancy-number').textContent = pct + '%';
  $('occupancy-text').textContent = `${d.occupiedBeds} of ${d.occupiedBeds + d.availableBeds} beds occupied`;
  $('occupancy-bar').style.width = pct + '%';
}
function renderStudents() {
  const q = $('student-search').value.toLowerCase();
  const list = students.filter(s => [s.name,s.email,s.course].join(' ').toLowerCase().includes(q));
  $('students-table').innerHTML = list.map(s => `<tr>
    <td><div class="student-cell"><span class="mini-avatar">${escapeHtml(s.name.charAt(0).toUpperCase())}</span>${escapeHtml(s.name)}</div></td>
    <td>${escapeHtml(s.email)}</td><td>${escapeHtml(s.phone || '—')}</td><td>${escapeHtml(s.course || '—')}</td>
    <td>${s.roomNumber ? 'Room '+s.roomNumber : 'Not allocated'}</td>
    <td><button class="action-btn" onclick="editStudent(${s.id})">Edit</button><button class="action-btn delete-btn" onclick="deleteStudent(${s.id})">Delete</button></td></tr>`).join('');
  $('students-empty').classList.toggle('hidden', list.length !== 0);
}
function renderRooms() {
  $('rooms-grid').innerHTML = rooms.map(r => {
    const pct = Math.round(r.occupied / r.capacity * 100);
    return `<article class="room-card"><div class="room-card-top"><h3>Room ${r.roomNumber}</h3><span class="badge ${r.available===0?'pending':''}">${r.available===0?'Full':'Available'}</span></div>
    <p>Standard hostel room</p><div class="progress"><span style="width:${pct}%;background:${pct===100?'#e7a04f':'#36b782'}"></span></div>
    <div class="room-card-bottom"><span>${r.occupied}/${r.capacity} beds occupied</span><b>${r.available} free</b></div>
    <button class="action-btn delete-btn" onclick="deleteRoom(${r.roomNumber})" ${r.occupied > 0 ? 'disabled title="Only empty rooms can be deleted"' : ''}>Delete room</button></article>`;
  }).join('');
}
function renderFees() {
  $('fees-table').innerHTML = fees.map(f => `<tr><td>#F-${f.id}</td><td>${escapeHtml(f.studentName)}</td><td>${money(f.amount)}</td><td>${f.paymentDate}</td><td><span class="badge">${escapeHtml(f.status)}</span></td></tr>`).join('');
  $('fees-empty').classList.toggle('hidden', fees.length !== 0);
}
function renderComplaints() {
  $('complaints-list').innerHTML = complaints.map(c => `<article class="complaint-card"><div class="complaint-main"><b>${escapeHtml(c.category)} · ${escapeHtml(c.studentName)}</b><p>${escapeHtml(c.description)}</p><span class="complaint-meta">Complaint #${c.id} · ${c.date}</span></div>
    <div class="complaint-controls"><span class="badge ${c.status==='Open'?'open':c.status==='In Progress'?'progressing':''}">${escapeHtml(c.status)}</span>
    <select aria-label="Update complaint status" onchange="changeComplaint(${c.id},this.value)"><option ${c.status==='Open'?'selected':''}>Open</option><option ${c.status==='In Progress'?'selected':''}>In Progress</option><option ${c.status==='Resolved'?'selected':''}>Resolved</option></select></div></article>`).join('');
  $('complaints-empty').classList.toggle('hidden', complaints.length !== 0);
}
function renderAll() {
  renderDashboard().catch(e => notify(e.message,'error'));
  renderStudents(); renderRooms(); renderFees(); renderComplaints();
}
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  $(page+'-page').classList.remove('hidden');
  document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  $('page-title').textContent = ({dashboard:'Dashboard',students:'Students',rooms:'Room allocation',fees:'Fee records',complaints:'Complaints'})[page];
}
document.querySelectorAll('.nav-link').forEach(b => b.addEventListener('click', () => showPage(b.dataset.page)));
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => showPage(b.dataset.go)));
$('today').textContent = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
$('student-search').addEventListener('input', renderStudents);

const backdrop = $('modal-backdrop');
function closeModal() { backdrop.classList.add('hidden'); $('modal-form').onsubmit = null; }
$('modal-close').onclick = closeModal; $('modal-cancel').onclick = closeModal;
backdrop.addEventListener('click', e => { if(e.target === backdrop) closeModal(); });
function openModal(title, fields, onSubmit) {
  $('modal-title').textContent = title;
  $('modal-fields').innerHTML = fields.map(f => {
    const cls = f.full ? 'field full' : 'field';
    let control = '';
    if (f.type === 'select') control = `<select name="${f.name}" ${f.required?'required':''}>${f.options.map(o=>`<option value="${escapeHtml(o.value)}" ${String(o.value)===String(f.value??'')?'selected':''}>${escapeHtml(o.label)}</option>`).join('')}</select>`;
    else if (f.type === 'textarea') control = `<textarea name="${f.name}" placeholder="${escapeHtml(f.placeholder||'')}" ${f.required?'required':''}>${escapeHtml(f.value||'')}</textarea>`;
    else control = `<input name="${f.name}" type="${f.type||'text'}" value="${escapeHtml(f.value||'')}" placeholder="${escapeHtml(f.placeholder||'')}" ${f.required?'required':''} ${f.min!==undefined?'min="'+f.min+'"':''}>`;
    return `<div class="${cls}"><label>${escapeHtml(f.label)}</label>${control}</div>`;
  }).join('');
  backdrop.classList.remove('hidden');
  $('modal-form').onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try { await onSubmit(data); closeModal(); await refresh(); }
    catch(err) { notify(err.message,'error'); }
  };
}
function roomOptions(selected='') {
  return [{value:'',label:'No room allocated'},...rooms.filter(r=>r.available>0 || String(r.roomNumber)===String(selected)).map(r=>({value:r.roomNumber,label:`Room ${r.roomNumber} (${r.available} beds free)`}))];
}
$('add-student-btn').onclick = async () => {
  try {
    rooms = await request('/rooms');
    const availableRooms = roomOptions().slice(1);
    if (!availableRooms.length) {
      notify('No rooms are currently available.', 'error');
      return;
    }
    openModal('Register student',[
      {name:'name',label:'Full name',required:true,placeholder:'e.g. Aarav Sharma'},
      {name:'email',label:'Email address',type:'email',required:true,placeholder:'student@example.com'},
      {name:'phone',label:'Phone number',placeholder:'9876543210'},
      {name:'course',label:'Course / Department',placeholder:'B.Tech IT'},
      {name:'roomNumber',label:'Allocate room',type:'select',required:true,options:availableRooms}
    ], async d => { d.roomNumber=Number(d.roomNumber); await request('/students',{method:'POST',body:JSON.stringify(d)}); notify('Student registered successfully.'); });
  } catch (error) {
    notify(error.message, 'error');
  }
};
window.editStudent = id => {
  const s=students.find(x=>x.id===id); if(!s)return;
  openModal('Edit student',[
    {name:'name',label:'Full name',required:true,value:s.name},
    {name:'email',label:'Email address',type:'email',required:true,value:s.email},
    {name:'phone',label:'Phone number',value:s.phone},
    {name:'course',label:'Course / Department',value:s.course},
    {name:'roomNumber',label:'Room allocation',type:'select',value:s.roomNumber??'',options:roomOptions(s.roomNumber)}
  ],async d=>{d.roomNumber=d.roomNumber?Number(d.roomNumber):null;await request('/students/'+id,{method:'PUT',body:JSON.stringify(d)});notify('Student details updated.');});
};
window.deleteStudent = async id => {
  if(!confirm('Delete this student and their fee/complaint records?'))return;
  try{await request('/students/'+id,{method:'DELETE'});notify('Student deleted.');await refresh();}catch(e){notify(e.message,'error');}
};
$('add-room-btn').onclick = () => openModal('Add room',[
  {name:'roomNumber',label:'Room number',type:'number',required:true,min:'1',placeholder:'e.g. 301'},
  {name:'capacity',label:'Bed capacity',type:'select',required:true,options:[2,3,4].map(value=>({value,label:`${value} beds`}))}
], async d => {
  d.roomNumber = Number(d.roomNumber);
  d.capacity = Number(d.capacity);
  await request('/rooms', {method:'POST', body:JSON.stringify(d)});
  notify('Room created successfully.');
});
window.deleteRoom = async roomNumber => {
  if (!confirm(`Delete room ${roomNumber}? This is only possible when it is empty.`)) return;
  try {
    await request('/rooms/' + roomNumber, {method:'DELETE'});
    notify(`Room ${roomNumber} deleted.`);
    await refresh();
  } catch (error) {
    notify(error.message, 'error');
  }
};
$('add-fee-btn').onclick = () => {
  if(!students.length){notify('Register a student before recording a fee.','error');return;}
  openModal('Record hostel fee',[
    {name:'studentId',label:'Select student',type:'select',required:true,options:students.map(s=>({value:s.id,label:s.name+' (ID '+s.id+')'}))},
    {name:'amount',label:'Amount (₹)',type:'number',required:true,min:'1',placeholder:'e.g. 5000'},
    {name:'status',label:'Payment status',type:'select',options:[{value:'Paid',label:'Paid'},{value:'Pending',label:'Pending'}]}
  ],async d=>{d.studentId=Number(d.studentId);d.amount=Number(d.amount);await request('/fees',{method:'POST',body:JSON.stringify(d)});notify('Fee record added.');});
};
$('add-complaint-btn').onclick = () => {
  if(!students.length){notify('Register a student before adding a complaint.','error');return;}
  openModal('Submit complaint',[
    {name:'studentId',label:'Student',type:'select',required:true,options:students.map(s=>({value:s.id,label:s.name+' (ID '+s.id+')'}))},
    {name:'category',label:'Category',type:'select',options:['Maintenance','Cleanliness','Water','Electricity','Other'].map(x=>({value:x,label:x}))},
    {name:'description',label:'Description',type:'textarea',required:true,full:true,placeholder:'Describe the issue...'}
  ],async d=>{d.studentId=Number(d.studentId);await request('/complaints',{method:'POST',body:JSON.stringify(d)});notify('Complaint submitted.');});
};
window.changeComplaint = async (id,status) => {
  try{await request('/complaints/'+id,{method:'PATCH',body:JSON.stringify({status})});notify('Complaint status updated.');await refresh();}catch(e){notify(e.message,'error');}
};
refresh();
