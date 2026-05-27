package com.arielzarate.shipment.interfaces.error.exception

import com.arielzarate.shipment.interfaces.error.model.ClientError

class ExternalClientException(val clientError: ClientError) : RuntimeException(
    "Error calling external client: ${clientError.title}"
)
