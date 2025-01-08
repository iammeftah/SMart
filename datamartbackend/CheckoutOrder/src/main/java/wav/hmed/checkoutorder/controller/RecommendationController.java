package wav.hmed.checkoutorder.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import wav.hmed.checkoutorder.service.RecommendationService;

import java.util.Set;

@RestController
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * Endpoint to get recommended products for a given product ID.
     *
     * @param productId Product ID to get recommendations for.
     * @return Set of recommended product IDs.
     */
    @GetMapping("/api/recommendations")
    public Set<String> getRecommendations(@RequestParam String productId) {
        return recommendationService.getRecommendations(productId);
    }
}
