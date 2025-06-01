package com.transfersystem.repository;

import com.transfersystem.model.Transfer;
import com.transfersystem.model.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, UUID> {
    boolean existsByPlayer_IdAndStatusIn(Long playerId, List<TransferStatus> statuses);
}
