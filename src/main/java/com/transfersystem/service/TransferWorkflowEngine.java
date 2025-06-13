package com.transfersystem.service;

import com.transfersystem.model.Transfer;
import com.transfersystem.model.TransferStatus;
import com.transfersystem.repository.TransferRepository;
import org.springframework.stereotype.Service;

@Service
public class TransferWorkflowEngine {

    // TODO: Implement offer expiry. This would typically involve:
    // 1. Adding an 'offerExpiryDate' field to the Transfer entity.
    // 2. A scheduled task (e.g., using Spring's @Scheduled) that periodically queries for Transfers
    //    where 'status' is SUBMITTED or NEGOTIATION and 'offerExpiryDate' has passed.
    // 3. For expired offers, the status could be automatically transitioned to a new 'EXPIRED' status
    //    or back to 'DRAFT', potentially notifying relevant parties.
    // This is a significant feature enhancement beyond simple TODO resolution.

    private final TransferRepository transferRepository;

    public TransferWorkflowEngine(TransferRepository transferRepository) {
        this.transferRepository = transferRepository;
    }

    public Transfer submitTransfer(Transfer transfer) {
        if (transfer == null) {
            throw new IllegalArgumentException("Transfer object cannot be null.");
        }
        if (transfer.getStatus() != TransferStatus.DRAFT) {
            throw new IllegalStateException("Transfer must be in DRAFT status to be submitted. Current status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.SUBMITTED);
        return transferRepository.save(transfer);
    }

    public Transfer moveToNegotiation(Transfer transfer) {
        if (transfer == null) {
            throw new IllegalArgumentException("Transfer object cannot be null.");
        }
        if (transfer.getStatus() != TransferStatus.SUBMITTED) {
            throw new IllegalStateException("Transfer must be in SUBMITTED status to move to negotiation. Current status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.NEGOTIATION);
        return transferRepository.save(transfer);
    }

    public Transfer approveTransfer(Transfer transfer) {
        if (transfer == null) {
            throw new IllegalArgumentException("Transfer object cannot be null.");
        }
        if (transfer.getStatus() != TransferStatus.NEGOTIATION) {
            throw new IllegalStateException("Transfer must be in NEGOTIATION status to be approved. Current status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.APPROVED);
        return transferRepository.save(transfer);
    }

    public Transfer completeTransfer(Transfer transfer) {
        if (transfer == null) {
            throw new IllegalArgumentException("Transfer object cannot be null.");
        }
        if (transfer.getStatus() != TransferStatus.APPROVED) {
            throw new IllegalStateException("Transfer must be in APPROVED status to be completed. Current status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.COMPLETED);
        return transferRepository.save(transfer);
    }

    public Transfer cancelTransfer(Transfer transfer) {
        if (transfer == null) {
            throw new IllegalArgumentException("Transfer object cannot be null.");
        }
        // Allow cancellation from most non-final states.
        // Consider if CANCELED is a valid state to transition from (e.g. if already canceled).
        if (transfer.getStatus() == TransferStatus.COMPLETED || transfer.getStatus() == TransferStatus.CANCELED) {
            throw new IllegalStateException("Transfer cannot be canceled if it's already " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.CANCELED);
        // TODO: If ContractClauses are persisted and linked to this transfer, ensure they are deleted upon cancellation.
        // NOTE: As per current PRD (v1), ContractClauseDto is used for request/response and not directly persisted
        // as a list of entities within the Transfer object. If this changes in future versions where ContractClauses
        // become JPA entities linked to a Transfer, then logic to handle their lifecycle (e.g., deletion on
        // transfer cancellation) would be needed here.
        return transferRepository.save(transfer);
    }
}
