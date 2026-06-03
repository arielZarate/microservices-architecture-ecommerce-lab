package com.arielzarate.shipment

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.kafka.annotation.EnableKafka

@EnableKafka
@SpringBootApplication
class ShipmentApplication

fun main(args: Array<String>) {
	runApplication<ShipmentApplication>(*args)
}
