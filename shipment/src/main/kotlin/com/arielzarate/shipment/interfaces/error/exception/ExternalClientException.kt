package com.arielzarate.shipment.interfaces.error.exception

import com.arielzarate.shipment.interfaces.error.model.ClientError
import org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR

class ExternalClientException(val error: ClientError) : RuntimeException(){
    companion object {
        fun timeout(uri: String, description: String): ClientError {
            return ClientError(
                title = "Timeout calling $uri",
                detail = description,
                status = INTERNAL_SERVER_ERROR.value(),
                type = null,
                instance = null,
                errors = null
            )
        }

        fun error(uri: String, description: String): ClientError {
            return ClientError(
                title = "Error with $uri",
                detail = description,
                status = INTERNAL_SERVER_ERROR.value(),
                type = null,
                instance = null,
                errors = null
            )
        }
    }
}
