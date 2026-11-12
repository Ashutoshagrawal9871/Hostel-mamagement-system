package com.hostel.model;

public class Room {
    private Integer roomNumber;
    private Integer capacity;
    private Integer occupied;

    public Room() {}
    public Room(Integer roomNumber, Integer capacity, Integer occupied) {
        this.roomNumber = roomNumber;
        this.capacity = capacity;
        this.occupied = occupied;
    }
    public Integer getRoomNumber() { return roomNumber; }
    public void setRoomNumber(Integer roomNumber) { this.roomNumber = roomNumber; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getOccupied() { return occupied; }
    public void setOccupied(Integer occupied) { this.occupied = occupied; }
    public Integer getAvailable() { return capacity - occupied; }
    public String getStatus() { return occupied >= capacity ? "Full" : "Available"; }
}
