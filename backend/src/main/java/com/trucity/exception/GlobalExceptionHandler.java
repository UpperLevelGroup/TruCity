package com.trucity.exception;


import org.springframework.web.bind.annotation.*;


@RestControllerAdvice

public class GlobalExceptionHandler {


@ExceptionHandler(Exception.class)

public String handle(Exception e){

return e.getMessage();

}


}