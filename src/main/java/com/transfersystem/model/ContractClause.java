package com.transfersystem.model;

import java.math.BigDecimal;

public class ContractClause {

    private String type;
    private BigDecimal percentage;
    private BigDecimal amount;

    public ContractClause(String type, BigDecimal percentage, BigDecimal amount) {
        this.type = type;
        this.percentage = percentage;
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public BigDecimal getAmount() {
        return amount;
    }
}
