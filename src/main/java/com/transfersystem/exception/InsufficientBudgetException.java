package com.transfersystem.exception;

public class InsufficientBudgetException extends RuntimeException {
    public InsufficientBudgetException(String message) {
        super(message);
    }
}
