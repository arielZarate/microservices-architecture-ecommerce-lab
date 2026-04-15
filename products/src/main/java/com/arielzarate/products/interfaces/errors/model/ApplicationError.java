package com.arielzarate.products.interfaces.errors.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


@AllArgsConstructor
public class ApplicationError {
    private final int status;
    private final String message;
    private final Throwable origin;


    //constructor
    public ApplicationError(int status, String message) {
        this(status, message, null);
    }


    //method statics
    public static ApplicationError badRequest() {
        return new ApplicationError(400, "bad request ", null);
    }

    public static ApplicationError badRequest(String detail) {
        return new ApplicationError(400, "bad request " + detail, null);
    }

    public static ApplicationError invalidOperationType(String operationType) {
        return new ApplicationError(400, "operation type " + operationType + " is invalid");
    }

    public static ApplicationError serverError(Throwable origin) {
        return new ApplicationError(500, "internal server error", origin);
    }

    public static ApplicationError notNullError(String field) {
        return new ApplicationError(400, "The field " + field + " cannot be null");
    }

    public static ApplicationError notFoundError(String field) {
        return new ApplicationError(404, "The field " + field + " was not found");
    }

    public static ApplicationError errorMakingDebit(String error) {
        return new ApplicationError(400, "The debit reversal advice could not be completed. Error: " + error);
    }

    @Override
    public String toString() {
        return "ApplicationError{" + "status=" + status + ", message='" + message + '\'' + ", origin=" + origin + '}';
    }

}
