package wav.hmed.authentication.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import wav.hmed.authentication.controllers.AuthController;
import wav.hmed.authentication.dto.AuthenticationRequest;
import wav.hmed.authentication.dto.AuthenticationResponse;
import wav.hmed.authentication.dto.RegisterRequest;
import wav.hmed.authentication.models.Role;
import wav.hmed.authentication.models.User;
import wav.hmed.authentication.repository.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthenticationServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthenticationService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegister_NewUser() {
        // Arrange
        RegisterRequest request = new RegisterRequest("John Doe", "john@example.com", "password123");
        User user = User.builder()
                .fullName("John Doe")
                .email("john@example.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();

        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(User.class))).thenReturn("mock-token");

        // Act
        AuthenticationResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("mock-token", response.getToken());
        assertEquals("john@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testAuthenticate_ValidCredentials() {
        // Arrange
        AuthenticationRequest request = new AuthenticationRequest("john@example.com", "password123");
        User user = User.builder()
                .email("john@example.com")
                .fullName("John Doe")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(User.class))).thenReturn("mock-token");

        // Act
        AuthenticationResponse response = authService.authenticate(request);

        // Assert
        assertNotNull(response);
        assertEquals("mock-token", response.getToken());
        assertEquals("john@example.com", response.getEmail());
    }

    @Test
    void testIsEmailAlreadyRegistered() {
        // Arrange
        String email = "john@example.com";
        when(userRepository.existsByEmail(email)).thenReturn(true);

        // Act
        boolean exists = authService.isEmailAlreadyRegistered(email);

        // Assert
        assertTrue(exists);
        verify(userRepository).existsByEmail(email);
    }

    @Test
    void testLogout() {
        // Arrange
        String token = "mock-token";

        // Act & Assert (mainly checking no exception is thrown)
        assertDoesNotThrow(() -> authService.logout(token));
    }
}