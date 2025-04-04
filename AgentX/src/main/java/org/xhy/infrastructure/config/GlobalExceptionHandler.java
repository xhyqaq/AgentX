package org.xhy.infrastructure.config;

import com.fasterxml.jackson.databind.exc.InvalidTypeIdException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.xhy.domain.plugins.config.PluginConfig;
import org.xhy.infrastructure.exception.BusinessException;
import org.xhy.infrastructure.exception.EntityNotFoundException;
import org.xhy.infrastructure.exception.ParamValidationException;
import org.xhy.interfaces.api.common.Result;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 * 用于捕获应用中的各种异常，并将其转换为统一的API响应格式
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleBusinessException(BusinessException e, HttpServletRequest request) {
        logger.error("业务异常: {}, URL: {}", e.getMessage(), request.getRequestURL(), e);
        return Result.error(400, e.getMessage());
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(ParamValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleParamValidationException(ParamValidationException e, HttpServletRequest request) {
        logger.error("参数校验异常: {}, URL: {}", e.getMessage(), request.getRequestURL(), e);
        return Result.badRequest(e.getMessage());
    }

    /**
     * 处理实体未找到异常
     */
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleEntityNotFoundException(EntityNotFoundException e, HttpServletRequest request) {
        logger.error("实体未找到异常: {}, URL: {}", e.getMessage(), request.getRequestURL(), e);
        return Result.notFound(e.getMessage());
    }

    /**
     * 处理方法参数校验异常（@Valid注解导致的异常）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleMethodArgumentNotValidException(MethodArgumentNotValidException e,
            HttpServletRequest request) {
        List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors();
        String errorMessage = fieldErrors.stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        logger.error("方法参数校验异常: {}, URL: {}", errorMessage, request.getRequestURL(), e);
        return Result.badRequest(errorMessage);
    }

    /**
     * 处理表单绑定异常
     */
    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleBindException(BindException e, HttpServletRequest request) {
        List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors();
        String errorMessage = fieldErrors.stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        logger.error("表单绑定异常: {}, URL: {}", errorMessage, request.getRequestURL(), e);
        return Result.badRequest(errorMessage);
    }

    /**
     * 处理请求体缺失或格式错误异常
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleHttpMessageNotReadableException(HttpMessageNotReadableException e, HttpServletRequest request) {
        logger.error("请求体格式错误: {}, URL: {}", e.getMessage(), request.getRequestURL(), e);
        
        // 处理JsonTypeInfo类型错误
        Throwable cause = e.getCause();
        if (cause instanceof InvalidTypeIdException invalidTypeIdException) {
            String typeId = invalidTypeIdException.getTypeId();
            // 从PluginConfig获取错误消息
            if (invalidTypeIdException.getBaseType().getRawClass().equals(PluginConfig.class)) {
                return Result.badRequest(PluginConfig.getInvalidTypeMessage(typeId));
            }
        }
        
        return Result.badRequest("请求体格式错误或缺失，请检查请求内容");
    }

    /**
     * 处理未预期的异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception e, HttpServletRequest request) {
        logger.error("未预期的异常: ", e);
        return Result.serverError("服务器内部错误: " + e.getMessage());
    }
}