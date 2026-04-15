package com.arielzarate.products.interfaces.errors;


import com.arielzarate.products.interfaces.errors.exception.ExternalClientException;
import com.arielzarate.products.interfaces.errors.model.ClientError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Slf4j
public class ErrorHandler {

    @ExceptionHandler(value = {ExternalClientException.class})
    public ResponseEntity<ClientError> handleException(ExternalClientException ex) {
        log.error("External client error: {}", ex.getMessage());
        ClientError error = ex.getClientError();
        return ResponseEntity.status(error.status()).body(error);
    }

    @ExceptionHandler(value = {Exception.class})
    public ResponseEntity<ClientError> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        ClientError error = new ClientError(
                "internal_error",
                "Internal server error",
                500,
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(500).body(error);
    }


}
