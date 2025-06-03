package com.transfersystem.service;

import com.transfersystem.dto.ClubDTO;
import com.transfersystem.model.Club;
import com.transfersystem.repository.ClubRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClubServiceTest {

    @Mock
    private ClubRepository clubRepository;

    @InjectMocks
    private ClubService clubService;

    private Club club;
    private ClubDTO clubDTO;

    @BeforeEach
    void setUp() {
        club = new Club();
        club.setId(1L);
        club.setName("Test Club");
        club.setBudget(new BigDecimal("1000000"));

        clubDTO = new ClubDTO();
        clubDTO.setId(1L);
        clubDTO.setName("Test Club DTO");
        clubDTO.setBudget(new BigDecimal("2000000"));
    }

    @Test
    void createClub() {
        when(clubRepository.save(any(Club.class))).thenReturn(club);

        ClubDTO result = clubService.createClub(clubDTO);

        assertNotNull(result);
        assertEquals(club.getName(), result.getName()); // Name from saved entity
        verify(clubRepository, times(1)).save(any(Club.class));
    }

    @Test
    void getAllClubs() {
        when(clubRepository.findAll()).thenReturn(Collections.singletonList(club));

        List<ClubDTO> results = clubService.getAllClubs();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(club.getName(), results.get(0).getName());
        verify(clubRepository, times(1)).findAll();
    }

    @Test
    void getClubById_found() {
        when(clubRepository.findById(1L)).thenReturn(Optional.of(club));

        ClubDTO result = clubService.getClubById(1L);

        assertNotNull(result);
        assertEquals(club.getName(), result.getName());
        verify(clubRepository, times(1)).findById(1L);
    }

    @Test
    void getClubById_notFound() {
        when(clubRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> clubService.getClubById(1L));
        verify(clubRepository, times(1)).findById(1L);
    }

    @Test
    void updateClub_found() {
        when(clubRepository.findById(1L)).thenReturn(Optional.of(club));
        when(clubRepository.save(any(Club.class))).thenReturn(club); // mock save for updated entity

        ClubDTO result = clubService.updateClub(1L, clubDTO);

        assertNotNull(result);
        assertEquals(clubDTO.getName(), club.getName()); // Verify club entity was updated
        assertEquals(clubDTO.getBudget(), club.getBudget());
        verify(clubRepository, times(1)).findById(1L);
        verify(clubRepository, times(1)).save(club);
    }

    @Test
    void updateClub_notFound() {
        when(clubRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> clubService.updateClub(1L, clubDTO));
        verify(clubRepository, times(1)).findById(1L);
        verify(clubRepository, never()).save(any(Club.class));
    }

    @Test
    void deleteClub_found() {
        when(clubRepository.existsById(1L)).thenReturn(true);
        doNothing().when(clubRepository).deleteById(1L);

        clubService.deleteClub(1L);

        verify(clubRepository, times(1)).existsById(1L);
        verify(clubRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteClub_notFound() {
        when(clubRepository.existsById(1L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> clubService.deleteClub(1L));
        verify(clubRepository, times(1)).existsById(1L);
        verify(clubRepository, never()).deleteById(1L);
    }
}
