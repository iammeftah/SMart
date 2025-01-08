package wav.hmed.productscrud.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
@Document(collection = "wishlists")
public class Wishlist {
    @Id
    private String id;
    private String userId;
    @DBRef
    private List<Product> products = new ArrayList<>();
}