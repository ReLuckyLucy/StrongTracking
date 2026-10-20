package com.strongtracking.repository.projection;

import java.time.LocalDate;
import java.util.UUID;

/**
 * 用户的训练日期投影，用于计算连续打卡天数。
 */
public interface UserWorkoutDate {

    UUID getUserId();

    LocalDate getWorkoutDate();
}
