package com.hostel.service;

import com.hostel.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class HostelService {
    private final Map<Long, Student> students = new LinkedHashMap<>();
    private final Map<Integer, Room> rooms = new LinkedHashMap<>();
    private final Map<Long, Fee> fees = new LinkedHashMap<>();
    private final Map<Long, Complaint> complaints = new LinkedHashMap<>();
    private final AtomicLong studentIds = new AtomicLong(1001);
    private final AtomicLong feeIds = new AtomicLong(1);
    private final AtomicLong complaintIds = new AtomicLong(1);

    public HostelService() {
        for (int i = 101; i <= 108; i++) rooms.put(i, new Room(i, 2, 0));
        for (int i = 201; i <= 204; i++) rooms.put(i, new Room(i, 3, 0));
    }

    public synchronized List<Student> getStudents() { return new ArrayList<>(students.values()); }

    public synchronized Student addStudent(Student input) {
        if (input.getName() == null || input.getName().isBlank()) throw new IllegalArgumentException("Student name is required.");
        if (input.getEmail() == null || input.getEmail().isBlank()) throw new IllegalArgumentException("Email is required.");
        if (students.values().stream().anyMatch(s -> s.getEmail().equalsIgnoreCase(input.getEmail())))
            throw new IllegalArgumentException("A student with this email already exists.");
        Integer roomNumber = input.getRoomNumber();
        if (roomNumber == null) {
            roomNumber = rooms.values().stream()
                    .filter(room -> room.getOccupied() < room.getCapacity())
                    .map(Room::getRoomNumber)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No rooms are available."));
        }
        occupyRoom(roomNumber);
        Student s = new Student(studentIds.getAndIncrement(), input.getName().trim(), input.getEmail().trim(),
                input.getPhone(), input.getCourse(), roomNumber);
        students.put(s.getId(), s);
        return s;
    }

    public synchronized Student updateStudent(Long id, Student input) {
        Student old = students.get(id);
        if (old == null) throw new NoSuchElementException("Student not found.");
        Integer newRoom = input.getRoomNumber();
        if (!Objects.equals(old.getRoomNumber(), newRoom)) {
            if (newRoom != null) occupyRoom(newRoom);
            if (old.getRoomNumber() != null) rooms.get(old.getRoomNumber()).setOccupied(rooms.get(old.getRoomNumber()).getOccupied() - 1);
        }
        old.setName(input.getName());
        old.setEmail(input.getEmail());
        old.setPhone(input.getPhone());
        old.setCourse(input.getCourse());
        old.setRoomNumber(newRoom);
        return old;
    }

    public synchronized void deleteStudent(Long id) {
        Student s = students.remove(id);
        if (s == null) throw new NoSuchElementException("Student not found.");
        if (s.getRoomNumber() != null) rooms.get(s.getRoomNumber()).setOccupied(rooms.get(s.getRoomNumber()).getOccupied() - 1);
        fees.values().removeIf(f -> f.getStudentId().equals(id));
        complaints.values().removeIf(c -> c.getStudentId().equals(id));
    }

    private void occupyRoom(Integer roomNumber) {
        Room room = rooms.get(roomNumber);
        if (room == null) throw new IllegalArgumentException("Room does not exist.");
        if (room.getOccupied() >= room.getCapacity()) throw new IllegalArgumentException("This room is already full.");
        room.setOccupied(room.getOccupied() + 1);
    }

    public synchronized List<Room> getRooms() { return new ArrayList<>(rooms.values()); }

    public synchronized Room addRoom(Room input) {
        if (input.getRoomNumber() == null || input.getRoomNumber() <= 0)
            throw new IllegalArgumentException("Enter a valid room number.");
        if (input.getCapacity() == null || input.getCapacity() <= 0)
            throw new IllegalArgumentException("Room capacity must be at least 1.");
        if (rooms.containsKey(input.getRoomNumber()))
            throw new IllegalArgumentException("This room number already exists.");
        Room room = new Room(input.getRoomNumber(), input.getCapacity(), 0);
        rooms.put(room.getRoomNumber(), room);
        return room;
    }

    public synchronized void deleteRoom(Integer roomNumber) {
        Room room = rooms.get(roomNumber);
        if (room == null) throw new NoSuchElementException("Room not found.");
        if (room.getOccupied() > 0)
            throw new IllegalArgumentException("Only empty rooms can be deleted.");
        rooms.remove(roomNumber);
    }

    public synchronized List<Fee> getFees() { return new ArrayList<>(fees.values()); }
    public synchronized Fee addFee(Fee input) {
        Student student = students.get(input.getStudentId());
        if (student == null) throw new IllegalArgumentException("Select a valid student first.");
        if (input.getAmount() == null || input.getAmount() <= 0) throw new IllegalArgumentException("Enter a valid fee amount.");
        String status = input.getStatus() == null ? "Paid" : input.getStatus();
        Fee fee = new Fee(feeIds.getAndIncrement(), student.getId(), student.getName(),
                input.getAmount(), status, LocalDate.now());
        fees.put(fee.getId(), fee);
        return fee;
    }

    public synchronized List<Complaint> getComplaints() { return new ArrayList<>(complaints.values()); }
    public synchronized Complaint addComplaint(Complaint input) {
        Student student = students.get(input.getStudentId());
        if (student == null) throw new IllegalArgumentException("Select a valid student first.");
        if (input.getDescription() == null || input.getDescription().isBlank())
            throw new IllegalArgumentException("Complaint description is required.");
        Complaint c = new Complaint(complaintIds.getAndIncrement(), student.getId(), student.getName(),
                input.getCategory(), input.getDescription(), "Open", LocalDate.now());
        complaints.put(c.getId(), c);
        return c;
    }

    public synchronized Complaint updateComplaint(Long id, String status) {
        Complaint c = complaints.get(id);
        if (c == null) throw new NoSuchElementException("Complaint not found.");
        if (!List.of("Open", "In Progress", "Resolved").contains(status))
            throw new IllegalArgumentException("Invalid complaint status.");
        c.setStatus(status);
        return c;
    }

    public synchronized Map<String, Object> dashboard() {
        long paid = fees.values().stream().filter(f -> "Paid".equalsIgnoreCase(f.getStatus())).count();
        double collected = fees.values().stream().filter(f -> "Paid".equalsIgnoreCase(f.getStatus()))
                .mapToDouble(Fee::getAmount).sum();
        long open = complaints.values().stream().filter(c -> !"Resolved".equals(c.getStatus())).count();
        int capacity = rooms.values().stream().mapToInt(Room::getCapacity).sum();
        int occupied = rooms.values().stream().mapToInt(Room::getOccupied).sum();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalStudents", students.size());
        result.put("totalRooms", rooms.size());
        result.put("occupiedBeds", occupied);
        result.put("availableBeds", capacity - occupied);
        result.put("feesCollected", collected);
        result.put("paidRecords", paid);
        result.put("openComplaints", open);
        return result;
    }
}
