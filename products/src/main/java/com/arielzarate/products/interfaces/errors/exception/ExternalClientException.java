package com.arielzarate.products.interfaces.errors.exception;

import com.arielzarate.products.interfaces.errors.model.ClientError;
import lombok.Getter;

@Getter
public class ExternalClientException extends RuntimeException {

    private final ClientError clientError;

    public ExternalClientException(ClientError clientError) {
        super("Error calling external client: " + clientError.title()); //message
        this.clientError = clientError;
    }

}
