package com.tcc.dfd_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "project")
@Getter
@Setter
@NoArgsConstructor
public class Project extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "context_diagram_id", nullable = false)
    private Dfd contextDiagram;

    @Column(nullable = false)
    private OffsetDateTime createdAt;
}