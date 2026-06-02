package com.arielzarate.shipment.interfaces.error

import com.arielzarate.shipment.interfaces.error.exception.ShipmentErrorException
import com.arielzarate.shipment.interfaces.error.exception.ExternalClientException
import com.arielzarate.shipment.interfaces.error.model.ShipmentError
import com.arielzarate.shipment.interfaces.error.model.ClientError
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

@ControllerAdvice
class ErrorHandler {

    private val log = LoggerFactory.getLogger(ErrorHandler::class.java)

    @ExceptionHandler(ExternalClientException::class)
    fun handleExternalClientException(ex: ExternalClientException, request: HttpServletRequest): ResponseEntity<ClientError> {
        log.error("External client error: ${ex.message}")
        val clientError = ex.clientError
        val error = ClientError(
            type = "https://httpstatuses.com/${clientError.status}",
            title = clientError.title,
            status = clientError.status,
            detail = clientError.detail,
            instance = request.requestURI,
            errors = null
        )
        return ResponseEntity.status(error.status).body(error)
    }

    @ExceptionHandler(ShipmentErrorException::class)
    fun handleApplicationErrorException(ex: ShipmentErrorException, request: HttpServletRequest): ResponseEntity<ClientError> {
        val appError: ShipmentError = ex.error
        val clientError = ClientError(
            type = "https://httpstatuses.com/${appError.status}",
            title = getTitleForStatus(appError.status),
            status = appError.status,
            detail = appError.message,
            instance = request.requestURI,
            errors = null
        )
        return ResponseEntity.status(clientError.status).body(clientError)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception, request: HttpServletRequest): ResponseEntity<ClientError> {
        log.error("Unhandled exception: ${ex.message}", ex)
        val error = ClientError(
            type = "https://httpstatuses.com/500",
            title = "Internal Server Error",
            status = 500,
            detail = ex.message ?: "No detail",
            instance = request.requestURI,
            errors = null
        )
        return ResponseEntity.status(500).body(error)
    }

    private fun getTitleForStatus(status: Int): String = when (status) {
        400 -> "Bad Request"
        404 -> "Not Found"
        409 -> "Conflict"
        500 -> "Internal Server Error"
        else -> "Error"
    }
}
