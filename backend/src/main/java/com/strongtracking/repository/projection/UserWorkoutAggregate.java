package com.strongtracking.repository.projection;

import java.util.UUID;

/**
 * 每个用户在统计周期内的训练次数聚合。
 */
public interface UserWorkoutAggregate {

    UUID getUserId();

    long getWorkoutCount();
}
