package com.example.LTJava.outcome.entity;

public enum MappingLevel {
    I(1, "Introduced"),// Giới thiệu
    R(2, "Reinforced"),//  Nâng cao
    M(3, "Mastered"); // Thành thạo

    public final int value;
    public final String description;

    MappingLevel(int value, String description) {
        this.value = value;
        this.description = description;
    }

    public static MappingLevel fromValue(int value) {
        for (MappingLevel level : MappingLevel.values()) {
            if (level.value == value) {
                return level;
            }
        }
        throw new IllegalArgumentException("Invalid mapping level: " + value);
    }
}
