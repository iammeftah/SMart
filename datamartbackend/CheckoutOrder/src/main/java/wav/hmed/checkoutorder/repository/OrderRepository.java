package wav.hmed.checkoutorder.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import wav.hmed.checkoutorder.model.order.Order;
import wav.hmed.checkoutorder.model.order.OrderStatus;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserId(String userId);
    List<Order> findByStatus(OrderStatus status);
}
