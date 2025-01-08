package wav.hmed.authentication.controllers;

import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wav.hmed.authentication.dto.AuthenticationRequest;
import wav.hmed.authentication.dto.AuthenticationResponse;
import wav.hmed.authentication.dto.RegisterRequest;
import wav.hmed.authentication.service.AuthenticationService;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger log = LogManager.getLogger(AuthController.class);
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @RequestHeader("Authorization") String token
    ) {
        authenticationService.logout(token.substring(7));
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(
            @RequestParam String email
    ) {
        boolean exists = authenticationService.isEmailAlreadyRegistered(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/current-user")
    public ResponseEntity<Map<String, String>> getCurrentUser(
            @RequestHeader("Authorization") String token
    ) {
        log.info("Received token for current user: {}", token);
        String userId = authenticationService.getCurrentUserId(token.substring(7));
        log.info("Retrieved userId: {}", userId);
        return ResponseEntity.ok(Map.of("userId", userId));
    }


}