package wav.hmed.productscrud.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;

@Configuration
public class MongoConfig {
    @Bean
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(Arrays.asList(
                new StringToInstantConverter()
        ));
    }

    private static class StringToInstantConverter implements Converter<String, Instant> {
        @Override
        public Instant convert(String source) {
            try {
                return Instant.parse(source);
            } catch (Exception e) {
                return LocalDate.parse(source)
                        .atStartOfDay(ZoneId.systemDefault())
                        .toInstant();
            }
        }
    }
}