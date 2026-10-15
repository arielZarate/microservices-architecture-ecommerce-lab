package com.arielzarate.shipment.application.services

import com.arielzarate.shipment.application.services.step.PreparingToShippedStep
import com.arielzarate.shipment.application.services.step.ShippedToDeliveredStep
import com.arielzarate.shipment.domain.ports.`in`.ShipmentStatusService
import com.arielzarate.shipment.interfaces.utils.CompanionLogger
import org.springframework.stereotype.Service

@Service
class ShipmentStatusUseCase(
    private val preparingToShippedStep: PreparingToShippedStep,
    private val shippedToDeliveredStep: ShippedToDeliveredStep
) : ShipmentStatusService {

    companion object : CompanionLogger()

    override fun processPreparingToShipped() {
        log.info("Running step PREPARING → SHIPPED")
        preparingToShippedStep.execute()
    }

    override fun processShippedToDelivered() {
        log.info("Running step SHIPPED → DELIVERED")
        shippedToDeliveredStep.execute()
    }
}
