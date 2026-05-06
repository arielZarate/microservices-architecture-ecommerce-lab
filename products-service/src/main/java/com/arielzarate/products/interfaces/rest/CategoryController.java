package com.arielzarate.products.interfaces.rest;


import com.arielzarate.products.domain.models.Category;
import com.arielzarate.products.domain.ports.in.CategoryService;
import com.arielzarate.products.interfaces.rest.dto.CategoryRequestDTO;
import com.arielzarate.products.interfaces.rest.dto.CategoryResponseDTO;
import com.arielzarate.products.interfaces.rest.mapper.CategoryMapperDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/category")
@Tag(name = "Category", description = "Category management endpoints")
@AllArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    private final CategoryMapperDTO mapper;

    @Operation(summary = "Create a new category", description = "Creates a new category in the database")
    @ApiResponses(value = {@ApiResponse(responseCode = "201", description = "Category created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CategoryResponseDTO.class))), @ApiResponse(responseCode = "409", description = "Category already exists")})
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(@RequestBody CategoryRequestDTO request) {
        log.info("Request Post create Category");
        Category category = categoryService.createCategory(mapper.mapToDomain(request));
        log.info("Response Post create Category = {}", category.getName());
        return ResponseEntity.status(201).body(mapper.mapToDTO(category));

    }

    //=================================================
    @Operation(summary = "Get all categories", description = "Returns a list of all categories. Optional search by name (case-insensitive)")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Categories retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CategoryResponseDTO.class)))})
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories(@RequestParam(required = false) String name) {
        log.info("Request GET  Categories name = {}", name);
        List<CategoryResponseDTO> list = categoryService.findAllCategory(name).stream().map(mapper::mapToDTO).toList();
        log.info("Response GET categories");
        return ResponseEntity.ok(list);

    }

    //=================================================
    @Operation(summary = "Get category by ID", description = "Returns a category by its ID")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Category found successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CategoryResponseDTO.class))), @ApiResponse(responseCode = "404", description = "Category not found")})
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable Long id) {
        log.info("Request GET category by id = {}", id);
        CategoryResponseDTO category = mapper.mapToDTO(categoryService.getCategoryById(id));
        log.info("Response GET category ");
        return ResponseEntity.ok(category);

    }

    @Operation(summary = "Update category", description = "Updates a category by its ID")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Category updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CategoryResponseDTO.class))), @ApiResponse(responseCode = "404", description = "Category not found"), @ApiResponse(responseCode = "409", description = "Category name already exists")})
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable Long id, @RequestBody CategoryRequestDTO request) {
        log.info("Request PUT category id = {} name = {}", id, request.getName());
        CategoryResponseDTO category = mapper.mapToDTO(categoryService.updateCategory(request.getName(), id));
        log.info("Response PUT category ");
        return ResponseEntity.ok(category);

    }

}
