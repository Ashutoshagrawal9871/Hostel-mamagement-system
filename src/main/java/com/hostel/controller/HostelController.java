package com.hostel.controller;

import com.hostel.model.*;
import com.hostel.service.HostelService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class HostelController {
    private final HostelService service;
    public HostelController(HostelService service) { this.service = service; }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() { return service.dashboard(); }

    @GetMapping("/students")
    public List<Student> students() { return service.getStudents(); }

    @PostMapping("/students")
    @ResponseStatus(HttpStatus.CREATED)
    public Student addStudent(@RequestBody Student student) { return run(() -> service.addStudent(student)); }

    @PutMapping("/students/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student student) {
        return run(() -> service.updateStudent(id, student));
    }

    @DeleteMapping("/students/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStudent(@PathVariable Long id) { run(() -> { service.deleteStudent(id); return null; }); }

    @GetMapping("/rooms")
    public List<Room> rooms() { return service.getRooms(); }

    @PostMapping("/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public Room addRoom(@RequestBody Room room) { return run(() -> service.addRoom(room)); }

    @DeleteMapping("/rooms/{roomNumber}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoom(@PathVariable Integer roomNumber) {
        run(() -> { service.deleteRoom(roomNumber); return null; });
    }

    @GetMapping("/fees")
    public List<Fee> fees() { return service.getFees(); }

    @PostMapping("/fees")
    @ResponseStatus(HttpStatus.CREATED)
    public Fee addFee(@RequestBody Fee fee) { return run(() -> service.addFee(fee)); }

    @GetMapping("/complaints")
    public List<Complaint> complaints() { return service.getComplaints(); }

    @PostMapping("/complaints")
    @ResponseStatus(HttpStatus.CREATED)
    public Complaint addComplaint(@RequestBody Complaint complaint) {
        return run(() -> service.addComplaint(complaint));
    }

    @PatchMapping("/complaints/{id}")
    public Complaint updateComplaint(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return run(() -> service.updateComplaint(id, body.get("status")));
    }

    private <T> T run(SupplierWithException<T> action) {
        try { return action.get(); }
        catch (NoSuchElementException e) { throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage()); }
        catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage()); }
    }

    @FunctionalInterface
    private interface SupplierWithException<T> { T get(); }
}
