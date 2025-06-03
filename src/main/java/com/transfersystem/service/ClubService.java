package com.transfersystem.service;

import com.transfersystem.dto.ClubDTO;
import com.transfersystem.model.Club;
import com.transfersystem.repository.ClubRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClubService {

    private final ClubRepository clubRepository;

    @Autowired
    public ClubService(ClubRepository clubRepository) {
        this.clubRepository = clubRepository;
    }

    @Transactional
    public ClubDTO createClub(ClubDTO clubDTO) {
        Club club = new Club();
        club.setName(clubDTO.getName());
        club.setBudget(clubDTO.getBudget());
        Club savedClub = clubRepository.save(club);
        return convertToDTO(savedClub);
    }

    @Transactional(readOnly = true)
    public List<ClubDTO> getAllClubs() {
        return clubRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClubDTO getClubById(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Club not found with id: " + id));
        return convertToDTO(club);
    }

    @Transactional
    public ClubDTO updateClub(Long id, ClubDTO clubDTO) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Club not found with id: " + id));
        club.setName(clubDTO.getName());
        club.setBudget(clubDTO.getBudget());
        Club updatedClub = clubRepository.save(club);
        return convertToDTO(updatedClub);
    }

    @Transactional
    public void deleteClub(Long id) {
        if (!clubRepository.existsById(id)) {
            throw new EntityNotFoundException("Club not found with id: " + id);
        }
        clubRepository.deleteById(id);
    }

    private ClubDTO convertToDTO(Club club) {
        return new ClubDTO(
                club.getId(),
                club.getName(),
                club.getBudget()
        );
    }
}
