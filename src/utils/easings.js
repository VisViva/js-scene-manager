'use strict';

/**
 * Get value for a linear function by supplying starting time, ending time,
 * an interval and two values
 */

export function in_linear_out_linear(time_start, time_end, time_at, value_start, value_end) {
    return (value_end - value_start) * (time_at - time_start) / (time_end - time_start) + value_start;
}
