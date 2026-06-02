package com.arielzarate.shipment.interfaces.rest.controller

import com.arielzarate.shipment.domain.ports.`in`.ShipmentService
import com.arielzarate.shipment.interfaces.rest.dto.ShipmentResponseDTO
import com.arielzarate.shipment.interfaces.rest.mapper.ShipmentMapperDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/shipment")
//@Tag(name = "Shipment", description = "Shipment management endpoints")
class ShipmentController(
    private val service: ShipmentService,
    private val mapper: ShipmentMapperDTO
) {

    private val log = LoggerFactory.getLogger(ShipmentController::class.java)

    @GetMapping
//    @Operation(summary = "Get all shipments", description = "Returns a list of all shipments")
//    @ApiResponses(
//        value = [
//            ApiResponse(
//                responseCode = "200",
//                description = "List of shipments",
//                content = [Content(array = ArraySchema(schema = Schema(implementation = ShipmentResponseDTO::class)))]
//            )
//        ]
//    )
    fun getAllShipments(): ResponseEntity<List<ShipmentResponseDTO>> {
        log.info("Fetching all shipments")
        val shipments = service.getAllShipments().map { mapper.toDTO(it) }
        log.info("Returning {} shipments", shipments.size)
        return ResponseEntity.ok(shipments)
    }

    @GetMapping("/{orderId}")
//    @Operation(summary = "Get shipment by order ID", description = "Returns a shipment by its order ID")
//    @ApiResponses(
//        value = [
//            ApiResponse(
//                responseCode = "200",
//                description = "Shipment found",
//                content = [Content(schema = Schema(implementation = ShipmentResponseDTO::class))]
//            ),
//            ApiResponse(responseCode = "404", description = "Shipment not found")
//        ]
//    )
    fun getShipmentByOrderId(@PathVariable orderId: String): ResponseEntity<ShipmentResponseDTO> {
        log.info("Fetching shipment for order: {}", orderId)
        val shipment = service.getShipmentByOrderId(orderId)
        log.info("Response GET Shipment of order id {} ", orderId)
        return ResponseEntity.ok(mapper.toDTO(shipment))
    }
}
