package com.tcc.dfd_service.entity;

import com.tcc.dfd_service.dto.CreateDfdElementDTO;
import com.tcc.dfd_service.enums.DfdElementType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "dfd_element")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public class DfdElement extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal xValue;

    @Column(nullable = false)
    private BigDecimal yValue;

    @Column(nullable = false)
    private BigDecimal width;

    @Column(nullable = false)
    private BigDecimal height;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DfdElementType type;

    @Column(nullable = false)
    private Long dfdId;

    @Column(nullable = false, unique = true)
    private String uuidIdentifier;

    public DfdElement(CreateDfdElementDTO dto) {
        this.name = dto.elementName();
        this.type = dto.type();
        this.xValue = dto.positionX();
        this.yValue = dto.positionY();
        this.width = dto.width();
        this.height = dto.height();
        this.uuidIdentifier = dto.uuid();
    }
}