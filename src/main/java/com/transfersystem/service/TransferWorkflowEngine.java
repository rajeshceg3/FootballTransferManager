package com.transfersystem.service;

import com.transfersystem.model.Transfer;
import com.transfersystem.model.TransferStatus;
import com.transfersystem.repository.TransferRepository;
import org.springframework.stereotype.Service;

@Service
public class TransferWorkflowEngine {

    private final TransferRepository transferRepository;

    public TransferWorkflowEngine(TransferRepository transferRepository) {
        this.transferRepository = transferRepository;
    }

    public Transfer submitTransfer(Transfer transfer) {
        if (transfer.getStatus() != TransferStatus.DRAFT) {
            throw new IllegalStateException("Transfer must be in DRAFT status to be submitted. Current status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.SUBMITTED);
        return transferRepository.save(transfer);
    }

    public Transfer moveToNegotiation(Transfer transfer) {
        if (transfer.getStatus() != TransferStatus.SUBMITTED) {
            throw new IllegalStateException("Transfer must be in SUBMITTED status to move to negotiation. Current status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.NEGOTIATION);
        return transferRepository.save(transfer);
    }

    public Transfer approveTransfer(Transfer transfer) {
        if (transfer.getStatus() != TransferStatus.NEGOTIATION) {
            throw new IllegalStateException("Transfer must be in NEGOTIATION status to be approved. Current status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.APPROVED);
        return transferRepository.save(transfer);
    }

    public Transfer completeTransfer(Transfer transfer) {
        if (transfer.getStatus() != TransferStatus.APPROVED) {
            throw new IllegalStateException("Transfer must be in APPROVED status to be completed. Current status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.COMPLETED);
        return transferRepository.save(transfer);
    }
}
