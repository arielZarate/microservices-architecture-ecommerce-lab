package com.arielzarate.products.interfaces.errors.exception;

import com.arielzarate.products.interfaces.errors.model.ApplicationError;
import lombok.Getter;

@Getter
public class ApplicationErrorException extends RuntimeException {

    private final ApplicationError error;

    public ApplicationErrorException(ApplicationError error) {
        super();
        this.error = error;
    }

}
