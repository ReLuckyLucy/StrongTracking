package com.strongtracking.repository.projection;

import java.util.UUID;

/**
 * 每个用户在统计周期内的训练容量（重量 x 次数）与最大重量聚合。
 */
public interface UserVolumeAggregate {

    UUID getUserId();

    double getTotalVolume();

    double getMaxWeight();
}
