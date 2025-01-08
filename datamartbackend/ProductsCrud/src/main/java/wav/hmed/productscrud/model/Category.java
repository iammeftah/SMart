package wav.hmed.productscrud.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "categories")
@Data
@AllArgsConstructor
public class Category {
    @Id
    private String id;
    private String name;
    private int count;
    private String icon;

}