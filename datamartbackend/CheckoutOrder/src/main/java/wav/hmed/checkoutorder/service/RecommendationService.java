package wav.hmed.checkoutorder.service;


import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RecommendationService {

    private final RestTemplate restTemplate;

    public RecommendationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Get recommended products for a given product ID.
     *
     * @param productId Product ID for which recommendations are needed.
     * @return Set of recommended product IDs.
     */
    public Set<String> getRecommendations(String productId) {
        String pythonApiUrl = "http://localhost:8000/recommend/" + productId;
        try {
            List<String> recommendations = restTemplate.getForObject(pythonApiUrl, List.class);
            return new HashSet<>(recommendations);
        } catch (Exception e) {
            // Log and handle exceptions appropriately
            System.err.println("Error fetching recommendations: " + e.getMessage());
            return new HashSet<>();
        }
    }
}
