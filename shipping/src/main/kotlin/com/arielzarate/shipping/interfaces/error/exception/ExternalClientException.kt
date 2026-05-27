package com.arielzarate.shipping.interfaces.error.exception

import com.arielzarate.shipping.interfaces.error.model.ClientError

class ExternalClientException(val clientError: ClientError) : RuntimeException(
    "Error calling external client: ${clientError.title}"
)
