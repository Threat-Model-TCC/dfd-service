package com.tcc.dfd_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "dfds")
@Getter
@Setter
@NoArgsConstructor
public class Dfd extends BaseEntity {

    @Column(nullable = false)
    private Integer levelNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dfd_parent_id")
    private Dfd dfdParent;

    @Column(name = "project_id")
    private Long projectId;
}