package com.hostel.model;

import java.time.LocalDate;

public class Complaint {
    private Long id;
    private Long studentId;
    private String studentName;
    private String category;
    private String description;
    private String status;
    private LocalDate date;

    public Complaint() {}
    public Complaint(Long id, Long studentId, String studentName, String category,
                     String description, String status, LocalDate date) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.category = category;
        this.description = description;
        this.status = status;
        this.date = date;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
