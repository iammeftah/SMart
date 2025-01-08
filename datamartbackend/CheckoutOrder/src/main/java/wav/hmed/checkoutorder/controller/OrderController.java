package wav.hmed.checkoutorder.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import wav.hmed.checkoutorder.exceptions.ServiceException;
import wav.hmed.checkoutorder.model.order.Order;
import wav.hmed.checkoutorder.model.order.OrderStatus;
import wav.hmed.checkoutorder.model.transaction.Transaction;
import wav.hmed.checkoutorder.service.OrderService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<Order> initiateCheckout(@RequestHeader("Authorization") String authHeader) {
        try {
            Order order = orderService.initiateCheckout(authHeader);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (ServiceException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable String orderId) {
        try {
            Order order = orderService.getOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (ServiceException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable String userId) {
        List<Order> orders = orderService.getUserOrders(userId);
        return orders.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam OrderStatus status,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Order order = orderService.updateOrderStatus(orderId, status, authHeader);
            return ResponseEntity.ok(order);
        } catch (ServiceException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @PostMapping("/{orderId}/payment")
    public ResponseEntity<Transaction> processPayment(
            @PathVariable String orderId,
            @RequestParam Double amount,
            @RequestHeader("Authorization") String authHeader
    ) {
        System.out.println("Order Controller: processPayment() triggered");

        try {
            Transaction transaction = orderService.processPayment(orderId, amount, authHeader);
            return ResponseEntity.ok(transaction);
        } catch (ServiceException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable String orderId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Order order = orderService.cancelOrder(orderId, authHeader);
            return ResponseEntity.ok(order);
        } catch (ServiceException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/{orderId}/refund")
    public ResponseEntity<Transaction> refundOrder(
            @PathVariable String orderId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Transaction transaction = orderService.refundOrder(orderId, authHeader);
            return ResponseEntity.ok(transaction);
        } catch (ServiceException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of(
                        "error", ex.getReason(),
                        "status", ex.getStatusCode().toString()
                ));
    }
}