package com.transfersystem.controller;

import com.transfersystem.dto.InitiateTransferRequest;
import com.transfersystem.model.Transfer;
import com.transfersystem.model.TransferStatus;
import com.transfersystem.repository.ClubRepository;
import com.transfersystem.repository.PlayerRepository;
import com.transfersystem.repository.TransferRepository;
import com.transfersystem.service.TransferWorkflowEngine;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transfers")
public class TransferController {

    private final TransferRepository transferRepository;
    private final PlayerRepository playerRepository;
    private final ClubRepository clubRepository;
    private final TransferWorkflowEngine transferWorkflowEngine; // Will be used in later PRs

    public TransferController(TransferRepository transferRepository,
                              PlayerRepository playerRepository,
                              ClubRepository clubRepository,
                              TransferWorkflowEngine transferWorkflowEngine) {
        this.transferRepository = transferRepository;
        this.playerRepository = playerRepository;
        this.clubRepository = clubRepository;
        this.transferWorkflowEngine = transferWorkflowEngine;
    }

    @PostMapping
    public ResponseEntity<Transfer> initiateTransfer(@RequestBody InitiateTransferRequest request) {
        // Validate player
        if (!playerRepository.existsById(request.getPlayerId())) {
            throw new IllegalArgumentException("Player not found with ID: " + request.getPlayerId());
        }

        // Validate fromClub
        if (!clubRepository.existsById(request.getFromClubId())) {
            throw new IllegalArgumentException("Originating club not found with ID: " + request.getFromClubId());
        }

        // Validate toClub
        if (!clubRepository.existsById(request.getToClubId())) {
            throw new IllegalArgumentException("Destination club not found with ID: " + request.getToClubId());
        }

        Transfer newTransfer = new Transfer();
        newTransfer.setPlayerId(request.getPlayerId());
        newTransfer.setFromClubId(request.getFromClubId());
        newTransfer.setToClubId(request.getToClubId());
        newTransfer.setStatus(TransferStatus.DRAFT);
        // Clauses from request.getClauses() are not directly stored on Transfer entity in this version.
        // They would be used by TransferFeeCalculator or other services.

        Transfer savedTransfer = transferRepository.save(newTransfer);
        return new ResponseEntity<>(savedTransfer, HttpStatus.CREATED);
    }
}
