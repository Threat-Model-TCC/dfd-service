package com.tcc.dfd_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/dfd/hello")
    public String sayHello() {
        return "Hello world.";
    }
}
