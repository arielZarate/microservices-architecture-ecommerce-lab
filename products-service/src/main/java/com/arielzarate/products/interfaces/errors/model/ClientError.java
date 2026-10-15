package com.arielzarate.products.interfaces.errors.model;


//Class Record , do not return
// standard RFC7807 -> String type, String title, int status, String detail, String instance
public record ClientError(String type, String title, int status, String detail, String instance) {

    //method statics

}

