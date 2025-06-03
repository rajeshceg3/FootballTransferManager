package com.transfersystem.dto;

import java.math.BigDecimal;

public class ClubDTO {
    private Long id;
    private String name;
    private BigDecimal budget;

    // Constructors
    public ClubDTO() {
    }

    public ClubDTO(Long id, String name, BigDecimal budget) {
        this.id = id;
        this.name = name;
        this.budget = budget;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }
}
