package com.loanmaker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RagQueryDTO(
        @NotBlank @Size(min = 5, max = 4000) String question
) {
}
