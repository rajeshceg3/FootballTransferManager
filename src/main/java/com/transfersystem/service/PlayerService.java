package com.transfersystem.service;

import com.transfersystem.dto.PlayerDTO;
import com.transfersystem.model.Club;
import com.transfersystem.model.Player;
import com.transfersystem.repository.ClubRepository;
import com.transfersystem.repository.PlayerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final ClubRepository clubRepository; // Needed to fetch Club for Player

    @Autowired
    public PlayerService(PlayerRepository playerRepository, ClubRepository clubRepository) {
        this.playerRepository = playerRepository;
        this.clubRepository = clubRepository;
    }

    @Transactional
    public PlayerDTO createPlayer(PlayerDTO playerDTO) {
        Player player = new Player();
        player.setName(playerDTO.getName());
        player.setCurrentMarketValue(playerDTO.getCurrentMarketValue());
        if (playerDTO.getCurrentClubId() != null) {
            Club club = clubRepository.findById(playerDTO.getCurrentClubId())
                    .orElseThrow(() -> new EntityNotFoundException("Club not found with id: " + playerDTO.getCurrentClubId() + " for player " + playerDTO.getName()));
            player.setCurrentClub(club);
        }
        Player savedPlayer = playerRepository.save(player);
        return convertToDTO(savedPlayer);
    }

    @Transactional(readOnly = true)
    public List<PlayerDTO> getAllPlayers() {
        return playerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlayerDTO getPlayerById(Long id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + id));
        return convertToDTO(player);
    }

    @Transactional
    public PlayerDTO updatePlayer(Long id, PlayerDTO playerDTO) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + id));
        player.setName(playerDTO.getName());
        player.setCurrentMarketValue(playerDTO.getCurrentMarketValue());
        if (playerDTO.getCurrentClubId() != null) {
            Club club = clubRepository.findById(playerDTO.getCurrentClubId())
                    .orElseThrow(() -> new EntityNotFoundException("Club not found with id: " + playerDTO.getCurrentClubId() + " for player " + playerDTO.getName()));
            player.setCurrentClub(club);
        } else {
            player.setCurrentClub(null); // Allow unsetting the club
        }
        Player updatedPlayer = playerRepository.save(player);
        return convertToDTO(updatedPlayer);
    }

    @Transactional
    public void deletePlayer(Long id) {
        if (!playerRepository.existsById(id)) {
            throw new EntityNotFoundException("Player not found with id: " + id);
        }
        // Consider implications: what if this player is in an active transfer?
        // For now, simple delete. Enhancements could prevent deletion if active transfers exist.
        playerRepository.deleteById(id);
    }

    private PlayerDTO convertToDTO(Player player) {
        return new PlayerDTO(
                player.getId(),
                player.getName(),
                player.getCurrentMarketValue(),
                player.getCurrentClub() != null ? player.getCurrentClub().getId() : null
        );
    }

    // It might also be useful to have a method to convert DTO to Entity,
    // but for current CRUD, direct setting in service methods is also fine.
    // private Player convertToEntity(PlayerDTO playerDTO) { ... }
}
