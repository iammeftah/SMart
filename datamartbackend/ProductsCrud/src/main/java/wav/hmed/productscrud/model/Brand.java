package wav.hmed.productscrud.model;


import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;


@Document(collection = "brands")
@Data
@AllArgsConstructor
public class Brand {
    // Getters and setters
    @Id
    private String id;
    private String name;
    private int sales;
    private List<String> categories;
}