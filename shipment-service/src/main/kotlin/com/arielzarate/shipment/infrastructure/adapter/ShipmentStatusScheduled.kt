package com.arielzarate.shipment.infrastructure.adapter

import com.arielzarate.shipment.domain.ports.`in`.ShipmentStatusService
import com.arielzarate.shipment.interfaces.utils.CompanionLogger
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class ShipmentStatusScheduled(
    private val shipmentStatusService: ShipmentStatusService
) {
    companion object : CompanionLogger()

    @Scheduled(cron = "\${scheduled.preparing-to-shipped.period}")
    @SchedulerLock(name = "preparing-to-shipped", lockAtLeastFor = "PT3M", lockAtMostFor = "PT5M")
    fun runPreparingToShipped() {
        log.info("Running PREPARING → SHIPPED cron")
        shipmentStatusService.processPreparingToShipped()
        log.info("finished scheduled PREPARING → SHIPPED ")
    }

    @Scheduled(cron = "\${scheduled.shipped-to-delivered.period}")
    @SchedulerLock(name = "shipped-to-delivered", lockAtLeastFor = "PT3M", lockAtMostFor = "PT5M")
    fun runShippedToDelivered() {
        log.info("Running scheduled SHIPPED → DELIVERED ")
        shipmentStatusService.processShippedToDelivered()
        log.info("Finished scheduled SHIPPED → DELIVERED ")
    }
}
