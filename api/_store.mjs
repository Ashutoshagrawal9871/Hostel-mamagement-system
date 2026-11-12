const rooms = new Map();
const students = new Map();
const fees = new Map();
const complaints = new Map();

let nextStudentId = 1001;
let nextFeeId = 1;
let nextComplaintId = 1;

for (let roomNumber = 101; roomNumber <= 108; roomNumber += 1) {
  rooms.set(roomNumber, { roomNumber, capacity: 2, occupied: 0 });
}
for (let roomNumber = 201; roomNumber <= 204; roomNumber += 1) {
  rooms.set(roomNumber, { roomNumber, capacity: 3, occupied: 0 });
}

const roomView = (room) => ({
  ...room,
  available: room.capacity - room.occupied,
  status: room.occupied >= room.capacity ? 'Full' : 'Available'
});

const list = (collection) => [...collection.values()];
const badRequest = (message) => Object.assign(new Error(message), { status: 400 });
const notFound = (message) => Object.assign(new Error(message), { status: 404 });

function occupyRoom(roomNumber) {
  const room = rooms.get(roomNumber);
  if (!room) throw badRequest('Room does not exist.');
  if (room.occupied >= room.capacity) throw badRequest('This room is already full.');
  room.occupied += 1;
}

export function dashboard() {
  const roomList = list(rooms);
  const paidFees = list(fees).filter((fee) => fee.status.toLowerCase() === 'paid');
  const capacity = roomList.reduce((total, room) => total + room.capacity, 0);
  const occupied = roomList.reduce((total, room) => total + room.occupied, 0);
  return {
    totalStudents: students.size,
    totalRooms: rooms.size,
    occupiedBeds: occupied,
    availableBeds: capacity - occupied,
    feesCollected: paidFees.reduce((total, fee) => total + fee.amount, 0),
    paidRecords: paidFees.length,
    openComplaints: list(complaints).filter((complaint) => complaint.status !== 'Resolved').length
  };
}

export function getStudents() { return list(students); }
export function addStudent(input) {
  if (!input.name?.trim()) throw badRequest('Student name is required.');
  if (!input.email?.trim()) throw badRequest('Email is required.');
  if (list(students).some((student) => student.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw badRequest('A student with this email already exists.');
  }
  const roomNumber = input.roomNumber ?? list(rooms).find((room) => room.occupied < room.capacity)?.roomNumber;
  if (roomNumber == null) throw badRequest('No rooms are available.');
  occupyRoom(Number(roomNumber));
  const student = { id: nextStudentId++, name: input.name.trim(), email: input.email.trim(), phone: input.phone, course: input.course, roomNumber: Number(roomNumber) };
  students.set(student.id, student);
  return student;
}
export function updateStudent(id, input) {
  const student = students.get(id);
  if (!student) throw notFound('Student not found.');
  const newRoom = input.roomNumber == null ? null : Number(input.roomNumber);
  if (student.roomNumber !== newRoom) {
    if (newRoom != null) occupyRoom(newRoom);
    if (student.roomNumber != null) rooms.get(student.roomNumber).occupied -= 1;
  }
  Object.assign(student, { name: input.name, email: input.email, phone: input.phone, course: input.course, roomNumber: newRoom });
  return student;
}
export function deleteStudent(id) {
  const student = students.get(id);
  if (!student) throw notFound('Student not found.');
  students.delete(id);
  if (student.roomNumber != null) rooms.get(student.roomNumber).occupied -= 1;
  for (const [feeId, fee] of fees) if (fee.studentId === id) fees.delete(feeId);
  for (const [complaintId, complaint] of complaints) if (complaint.studentId === id) complaints.delete(complaintId);
}

export function getRooms() { return list(rooms).map(roomView); }
export function addRoom(input) {
  const roomNumber = Number(input.roomNumber);
  const capacity = Number(input.capacity);
  if (!Number.isInteger(roomNumber) || roomNumber <= 0) throw badRequest('Enter a valid room number.');
  if (!Number.isInteger(capacity) || capacity <= 0) throw badRequest('Room capacity must be at least 1.');
  if (rooms.has(roomNumber)) throw badRequest('This room number already exists.');
  const room = { roomNumber, capacity, occupied: 0 };
  rooms.set(roomNumber, room);
  return roomView(room);
}
export function deleteRoom(roomNumber) {
  const room = rooms.get(roomNumber);
  if (!room) throw notFound('Room not found.');
  if (room.occupied > 0) throw badRequest('Only empty rooms can be deleted.');
  rooms.delete(roomNumber);
}

export function getFees() { return list(fees); }
export function addFee(input) {
  const student = students.get(Number(input.studentId));
  if (!student) throw badRequest('Select a valid student first.');
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw badRequest('Enter a valid fee amount.');
  const fee = { id: nextFeeId++, studentId: student.id, studentName: student.name, amount, status: input.status ?? 'Paid', paymentDate: new Date().toISOString().slice(0, 10) };
  fees.set(fee.id, fee);
  return fee;
}

export function getComplaints() { return list(complaints); }
export function addComplaint(input) {
  const student = students.get(Number(input.studentId));
  if (!student) throw badRequest('Select a valid student first.');
  if (!input.description?.trim()) throw badRequest('Complaint description is required.');
  const complaint = { id: nextComplaintId++, studentId: student.id, studentName: student.name, category: input.category, description: input.description.trim(), status: 'Open', date: new Date().toISOString().slice(0, 10) };
  complaints.set(complaint.id, complaint);
  return complaint;
}
export function updateComplaint(id, status) {
  const complaint = complaints.get(id);
  if (!complaint) throw notFound('Complaint not found.');
  if (!['Open', 'In Progress', 'Resolved'].includes(status)) throw badRequest('Invalid complaint status.');
  complaint.status = status;
  return complaint;
}
