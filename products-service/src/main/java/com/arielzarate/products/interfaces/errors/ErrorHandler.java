package com.arielzarate.products.interfaces.errors;


import com.arielzarate.products.interfaces.errors.exception.ApplicationErrorException;
import com.arielzarate.products.interfaces.errors.exception.ExternalClientException;
import com.arielzarate.products.interfaces.errors.model.ApplicationError;
import com.arielzarate.products.interfaces.errors.model.ClientError;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Slf4j
public class ErrorHandler {

    @ExceptionHandler(ExternalClientException.class)
    public ResponseEntity<ClientError> handleExternalClientException(ExternalClientException ex, HttpServletRequest request) {
        log.error("External client error: {}", ex.getMessage());
        ClientError error = new ClientError(
                "https://httpstatuses.com/" + ex.getClientError().status(),
                ex.getClientError().title(),
                ex.getClientError().status(),
                ex.getClientError().detail(),
                request.getRequestURI()
        );
        return ResponseEntity.status(error.status()).body(error);
    }

    @ExceptionHandler(ApplicationErrorException.class)
    public ResponseEntity<ClientError> handleApplicationErrorException(ApplicationErrorException ex, HttpServletRequest request) {
        //log.error("Application client error: {}", ex.getMessage());
        ApplicationError error = ex.getError();
        ClientError clientError = new ClientError(
                "https://httpstatuses.com/" + error.getStatus(),
                getTitleForStatus(error.getStatus()),
                error.getStatus(),
                error.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(clientError.status()).body(clientError);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ClientError> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        ClientError error = new ClientError(
                "https://httpstatuses.com/500",
                "Internal Server Error",
                500,
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(500).body(error);
    }

    private String getTitleForStatus(int status) {
        return switch (status) {
            case 400 -> "Bad Request";
            case 404 -> "Not Found";
            case 409 -> "Conflict";
            case 500 -> "Internal Server Error";
            default -> "Error";
        };
    }


}
