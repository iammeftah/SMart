package wav.hmed.productscrud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@PropertySource("file:.env")
@EnableScheduling
public class ProductsCrudApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductsCrudApplication.class, args);
    }

}
