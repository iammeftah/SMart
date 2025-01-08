package wav.hmed.checkoutorder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;


@SpringBootApplication
@PropertySource("file:.env")
public class CheckoutOrderApplication {

    public static void main(String[] args) {
        SpringApplication.run(CheckoutOrderApplication.class, args);
    }

}
