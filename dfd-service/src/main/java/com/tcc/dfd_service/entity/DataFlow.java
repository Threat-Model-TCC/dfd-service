package com.tcc.dfd_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "data_flows")
@Getter
@Setter
@NoArgsConstructor
public class DataFlow extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_element_id")
    private DfdElement sourceElement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_element_id")
    private DfdElement targetElement;

    @Column(nullable = false)
    private BigDecimal sourcePosition;

    @Column(nullable = false)
    private BigDecimal targetPosition;

    @Column(name = "dfd_id")
    private Long dfdId;
}