package com.transfersystem.service;

import com.transfersystem.model.Transfer;
import com.transfersystem.model.TransferStatus;
import com.transfersystem.repository.TransferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TransferWorkflowEngineTest {

    @Mock
    private TransferRepository transferRepository;

    @InjectMocks
    private TransferWorkflowEngine transferWorkflowEngine;

    private Transfer transfer;

    @BeforeEach
    void setUp() {
        transfer = new Transfer();
        transfer.setId(UUID.randomUUID());
    }

    @Test
    void submitTransfer_whenStatusIsDraft_shouldSetStatusToSubmittedAndSave() {
        transfer.setStatus(TransferStatus.DRAFT);
        when(transferRepository.save(any(Transfer.class))).thenReturn(transfer);

        Transfer result = transferWorkflowEngine.submitTransfer(transfer);

        assertEquals(TransferStatus.SUBMITTED, result.getStatus());
        verify(transferRepository).save(transfer);
    }

    @Test
    void submitTransfer_whenStatusIsNotDraft_shouldThrowIllegalStateException() {
        transfer.setStatus(TransferStatus.SUBMITTED);

        assertThrows(IllegalStateException.class, () -> transferWorkflowEngine.submitTransfer(transfer));
    }

    @Test
    void moveToNegotiation_whenStatusIsSubmitted_shouldSetStatusToNegotiationAndSave() {
        transfer.setStatus(TransferStatus.SUBMITTED);
        when(transferRepository.save(any(Transfer.class))).thenReturn(transfer);

        Transfer result = transferWorkflowEngine.moveToNegotiation(transfer);

        assertEquals(TransferStatus.NEGOTIATION, result.getStatus());
        verify(transferRepository).save(transfer);
    }

    @Test
    void moveToNegotiation_whenStatusIsNotSubmitted_shouldThrowIllegalStateException() {
        transfer.setStatus(TransferStatus.DRAFT);

        assertThrows(IllegalStateException.class, () -> transferWorkflowEngine.moveToNegotiation(transfer));
    }

    @Test
    void approveTransfer_whenStatusIsNegotiation_shouldSetStatusToApprovedAndSave() {
        transfer.setStatus(TransferStatus.NEGOTIATION);
        when(transferRepository.save(any(Transfer.class))).thenReturn(transfer);

        Transfer result = transferWorkflowEngine.approveTransfer(transfer);

        assertEquals(TransferStatus.APPROVED, result.getStatus());
        verify(transferRepository).save(transfer);
    }

    @Test
    void approveTransfer_whenStatusIsNotNegotiation_shouldThrowIllegalStateException() {
        transfer.setStatus(TransferStatus.SUBMITTED);

        assertThrows(IllegalStateException.class, () -> transferWorkflowEngine.approveTransfer(transfer));
    }

    @Test
    void completeTransfer_whenStatusIsApproved_shouldSetStatusToCompletedAndSave() {
        transfer.setStatus(TransferStatus.APPROVED);
        when(transferRepository.save(any(Transfer.class))).thenReturn(transfer);

        Transfer result = transferWorkflowEngine.completeTransfer(transfer);

        assertEquals(TransferStatus.COMPLETED, result.getStatus());
        verify(transferRepository).save(transfer);
    }

    @Test
    void completeTransfer_whenStatusIsNotApproved_shouldThrowIllegalStateException() {
        transfer.setStatus(TransferStatus.NEGOTIATION);

        assertThrows(IllegalStateException.class, () -> transferWorkflowEngine.completeTransfer(transfer));
    }
}
