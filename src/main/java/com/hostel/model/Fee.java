package com.hostel.model;

import java.time.LocalDate;

public class Fee {
    private Long id;
    private Long studentId;
    private String studentName;
    private Double amount;
    private String status;
    private LocalDate paymentDate;

    public Fee() {}
    public Fee(Long id, Long studentId, String studentName, Double amount, String status, LocalDate paymentDate) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.amount = amount;
        this.status = status;
        this.paymentDate = paymentDate;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
}
