package com.transfersystem.service;

import com.transfersystem.dto.PlayerDTO;
import com.transfersystem.model.Club;
import com.transfersystem.model.Player;
import com.transfersystem.repository.ClubRepository;
import com.transfersystem.repository.PlayerRepository;
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
class PlayerServiceTest {

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private ClubRepository clubRepository;

    @InjectMocks
    private PlayerService playerService;

    private Player player;
    private PlayerDTO playerDTO;
    private Club club;

    @BeforeEach
    void setUp() {
        club = new Club();
        club.setId(10L);
        club.setName("Test Club");
        club.setBudget(new BigDecimal("1000000"));

        player = new Player();
        player.setId(1L);
        player.setName("Test Player");
        player.setCurrentMarketValue(new BigDecimal("500000"));
        player.setCurrentClub(club);

        playerDTO = new PlayerDTO();
        playerDTO.setId(1L);
        playerDTO.setName("Test Player DTO");
        playerDTO.setCurrentMarketValue(new BigDecimal("600000"));
        playerDTO.setCurrentClubId(10L);
    }

    @Test
    void createPlayer_withClub() {
        when(clubRepository.findById(10L)).thenReturn(Optional.of(club));
        when(playerRepository.save(any(Player.class))).thenAnswer(invocation -> {
            Player p = invocation.getArgument(0);
            p.setId(1L); // Simulate saving and getting an ID
            return p;
        });

        PlayerDTO result = playerService.createPlayer(playerDTO);

        assertNotNull(result);
        assertEquals(playerDTO.getName(), result.getName());
        assertEquals(club.getId(), result.getCurrentClubId());
        verify(clubRepository, times(1)).findById(10L);
        verify(playerRepository, times(1)).save(any(Player.class));
    }

    @Test
    void createPlayer_withClub_clubNotFound() {
        playerDTO.setCurrentClubId(99L); // Non-existent club
        when(clubRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> playerService.createPlayer(playerDTO));
        verify(clubRepository, times(1)).findById(99L);
        verify(playerRepository, never()).save(any(Player.class));
    }

    @Test
    void createPlayer_withoutClub() {
        playerDTO.setCurrentClubId(null);
         when(playerRepository.save(any(Player.class))).thenAnswer(invocation -> {
            Player p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });


        PlayerDTO result = playerService.createPlayer(playerDTO);

        assertNotNull(result);
        assertEquals(playerDTO.getName(), result.getName());
        assertNull(result.getCurrentClubId());
        verify(clubRepository, never()).findById(anyLong());
        verify(playerRepository, times(1)).save(any(Player.class));
    }


    @Test
    void getAllPlayers() {
        when(playerRepository.findAll()).thenReturn(Collections.singletonList(player));

        List<PlayerDTO> results = playerService.getAllPlayers();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(player.getName(), results.get(0).getName());
        verify(playerRepository, times(1)).findAll();
    }

    @Test
    void getPlayerById_found() {
        when(playerRepository.findById(1L)).thenReturn(Optional.of(player));

        PlayerDTO result = playerService.getPlayerById(1L);

        assertNotNull(result);
        assertEquals(player.getName(), result.getName());
        assertEquals(player.getCurrentClub().getId(), result.getCurrentClubId());
        verify(playerRepository, times(1)).findById(1L);
    }

    @Test
    void getPlayerById_notFound() {
        when(playerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> playerService.getPlayerById(1L));
        verify(playerRepository, times(1)).findById(1L);
    }

    @Test
    void updatePlayer_found_withClub() {
        when(playerRepository.findById(1L)).thenReturn(Optional.of(player));
        when(clubRepository.findById(10L)).thenReturn(Optional.of(club));
        when(playerRepository.save(any(Player.class))).thenReturn(player);

        PlayerDTO result = playerService.updatePlayer(1L, playerDTO);

        assertNotNull(result);
        assertEquals(playerDTO.getName(), player.getName());
        assertEquals(playerDTO.getCurrentMarketValue(), player.getCurrentMarketValue());
        assertEquals(club, player.getCurrentClub());
        verify(playerRepository, times(1)).findById(1L);
        verify(clubRepository, times(1)).findById(10L);
        verify(playerRepository, times(1)).save(player);
    }

    @Test
    void updatePlayer_found_withClub_clubNotFound() {
        playerDTO.setCurrentClubId(99L); // Non-existent club
        when(playerRepository.findById(1L)).thenReturn(Optional.of(player));
        when(clubRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> playerService.updatePlayer(1L, playerDTO));

        verify(playerRepository, times(1)).findById(1L);
        verify(clubRepository, times(1)).findById(99L);
        verify(playerRepository, never()).save(any(Player.class));
    }


    @Test
    void updatePlayer_found_withoutClub() {
        playerDTO.setCurrentClubId(null);
        when(playerRepository.findById(1L)).thenReturn(Optional.of(player));
        when(playerRepository.save(any(Player.class))).thenReturn(player);

        PlayerDTO result = playerService.updatePlayer(1L, playerDTO);

        assertNotNull(result);
        assertEquals(playerDTO.getName(), player.getName());
        assertNull(player.getCurrentClub()); // Check that club is unset
        verify(playerRepository, times(1)).findById(1L);
        verify(clubRepository, never()).findById(anyLong()); // No club lookup
        verify(playerRepository, times(1)).save(player);
    }

    @Test
    void updatePlayer_notFound() {
        when(playerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> playerService.updatePlayer(1L, playerDTO));
        verify(playerRepository, times(1)).findById(1L);
        verify(clubRepository, never()).findById(anyLong());
        verify(playerRepository, never()).save(any(Player.class));
    }

    @Test
    void deletePlayer_found() {
        when(playerRepository.existsById(1L)).thenReturn(true);
        doNothing().when(playerRepository).deleteById(1L);

        playerService.deletePlayer(1L);

        verify(playerRepository, times(1)).existsById(1L);
        verify(playerRepository, times(1)).deleteById(1L);
    }

    @Test
    void deletePlayer_notFound() {
        when(playerRepository.existsById(1L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> playerService.deletePlayer(1L));
        verify(playerRepository, times(1)).existsById(1L);
        verify(playerRepository, never()).deleteById(1L);
    }
}
