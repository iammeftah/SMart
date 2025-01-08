package wav.hmed.checkoutorder.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import wav.hmed.checkoutorder.model.micro.User;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final RestTemplate restTemplate;

    public User getUserFromAuthentication(String authHeader) {
        try {
            log.info("Attempting to retrieve user with header: {}", authHeader);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, String>> response = restTemplate.exchange(
                    "http://localhost:8081/api/v1/auth/current-user",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, String>>() {}
            );

            Map<String, String> userInfo = response.getBody();
            log.info("Raw response from authentication service: {}", userInfo);

            if (userInfo != null && userInfo.containsKey("userId")) {
                User user = new User();
                user.setId(userInfo.get("userId"));
                log.info("User ID set from authentication service: {}", user.getId());
                return user;
            } else {
                log.error("Invalid response from authentication service: {}", userInfo);
                throw new RuntimeException("Invalid response from authentication service");
            }

        } catch (RestClientException e) {
            log.error("Detailed error retrieving user", e);
            throw new RuntimeException("Detailed failure in user retrieval", e);
        }
    }
}