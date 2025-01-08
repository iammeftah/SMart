package wav.hmed.authentication.controllers;

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
import wav.hmed.authentication.service.AuthenticationService;
import wav.hmed.authentication.service.JwtService;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthControllerTest {
    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegister_Successful() {
        // Arrange
        RegisterRequest registerRequest = new RegisterRequest("John Doe", "john@example.com", "password123");
        AuthenticationResponse mockResponse = AuthenticationResponse.builder()
                .token("mock-token")
                .email("john@example.com")
                .fullName("John Doe")
                .build();

        when(authenticationService.register(any(RegisterRequest.class))).thenReturn(mockResponse);

        // Act
        ResponseEntity<AuthenticationResponse> response = authController.register(registerRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("john@example.com", response.getBody().getEmail());
        assertEquals("John Doe", response.getBody().getFullName());
        verify(authenticationService).register(registerRequest);
    }

    @Test
    void testAuthenticate_Successful() {
        // Arrange
        AuthenticationRequest authRequest = new AuthenticationRequest("john@example.com", "password123");
        AuthenticationResponse mockResponse = AuthenticationResponse.builder()
                .token("mock-token")
                .email("john@example.com")
                .fullName("John Doe")
                .build();

        when(authenticationService.authenticate(any(AuthenticationRequest.class))).thenReturn(mockResponse);

        // Act
        ResponseEntity<AuthenticationResponse> response = authController.authenticate(authRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("john@example.com", response.getBody().getEmail());
        verify(authenticationService).authenticate(authRequest);
    }

    @Test
    void testLogout_Successful() {
        // Arrange
        String token = "Bearer mock-token";
        doNothing().when(authenticationService).logout(anyString());

        // Act
        ResponseEntity<String> response = authController.logout(token);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Logged out successfully", response.getBody());
        verify(authenticationService).logout("mock-token");
    }

    @Test
    void testCheckEmailExists() {
        // Arrange
        String email = "john@example.com";
        when(authenticationService.isEmailAlreadyRegistered(email)).thenReturn(true);

        // Act
        ResponseEntity<Map<String, Boolean>> response = authController.checkEmailExists(email);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().get("exists"));
        verify(authenticationService).isEmailAlreadyRegistered(email);
    }
}