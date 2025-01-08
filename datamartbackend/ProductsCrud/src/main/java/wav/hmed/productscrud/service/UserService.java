package wav.hmed.productscrud.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

@Service
public class UserService {
    private final RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    public UserService() {
        this.restTemplate = new RestTemplate();
    }

    public String getCurrentUserId(String authHeader) {
        System.out.println();
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        // Create headers with the token
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    authServiceUrl + "/api/v1/auth/current-user",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getBody() == null) {
                throw new IllegalStateException("No user ID received from auth service");
            }

            return response.getBody();
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new IllegalStateException("Unauthorized access", e);
        } catch (Exception e) {
            throw new IllegalStateException("Error communicating with auth service", e);
        }
    }
}