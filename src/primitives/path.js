'use strict';

var glMatrix = require('gl-matrix');
var vec2 = glMatrix.vec2;

import {
    Selection
} from '../core/selection';
import {
    BBox
} from '../core/bbox';
import {
    inherit,
    glmatrix_to_canvas_matrix
} from "../utils/helper";
import {
    get_quadratic_function_for,
    get_quadratic_function_extrema_for,
    get_cubic_function_for,
    get_cubic_function_extremas_for
} from "../utils/math";

exports.Path = function(_scene, Primitive) {

    /**
     * Extends the Primitive prototype
     */

    inherit(Path, Primitive);

    /**
     * Path constructor
     */

    function Path() {
        Primitive.call(this);

        /**
         * Segment elements are arrays obeying the following conventions:
         *
         * Linear - consists of two element representing the x and y of
         * the next point
         *
         * Quadratic - consists of four elements, the first and the second represent
         * the x and y of the control point of a quadratic bezier curve and the
         * third and fourth elements represent the x and y of the next point
         *
         * Cubic - consists of three elements, the first through the fourth elements
         * represent the x's and y's of the control points of a cubic bezier curve
         * and the fifth and the sixth elements represent the x and y of the next point
         */

        this._segments = [];
    };

    /**
     * Add linear segment
     */

    Path.prototype.linearTo = function(...points) {
        if (points.length === 2) {
            this._segments.push(points);
        }
        return this;
    };

    /**
     * Add quadratic segment
     */

    Path.prototype.quadraticTo = function(...points) {
        if (points.length === 4) {
            this._segments.push(points);
        }
        return this;
    };

    /**
     * Add cubic segment
     */

    Path.prototype.cubicTo = function(...points) {
        if (points.length === 6) {
            this._segments.push(points);
        }
        return this;
    };

    /**
     * Get the segments of the path
     */

    Path.prototype.segments = function() {
        return this._segments.slice();
    };

    /**
     * Get the bounding box of the current node only
     */

    Path.prototype.bboxOwn = function() {

        /**
         * Transformed points
         */

        const xValues = [];
        const yValues = [];

        /**
         * Prepare data for bounding box calculation by collecting the
         * required coordinates for each of the segments
         */

        for (let i = 0; i < this._segments.length; ++i) {

            /**
             * Get the previous point or the origin apply cascaded
             * transformation matrix to it and store int the arrays if it is
             * the first segment
             */

            const last_point = i === 0 && this._at || {
                x: this._segments[i - 1][this._segments[i - 1].length - 2],
                y: this._segments[i - 1][this._segments[i - 1].length - 1]
            };
            let point_start = vec2.create();
            let point_end = vec2.create();
            vec2.transformMat3(point_start, vec2.fromValues(last_point.x, last_point.y), this._matrix_cascaded);
            if (i === 0) {
                xValues.push(point_start[0]);
                yValues.push(point_start[1]);
            }

            /**
             * Check the current segment's type and handle it accordingly
             */

            switch (this._segments[i].length) {

                /**
                 * Simple line
                 */

                case 2:
                    {
                        vec2.transformMat3(point_end, vec2.fromValues(this._segments[i][0], this._segments[i][1]), this._matrix_cascaded);
                        xValues.push(point_end[0]);
                        yValues.push(point_end[1]);

                        /**
                         * Render out debug info if the debug flag is enabled
                         */

                        if (this._debug === true) {
                            const context = _scene.context();
                            context.lineWidth = 1;
                            context.strokeStyle = "#EE0000";
                            context.setTransform(1, 0, 0, 1, 0, 0);
                            context.beginPath();
                            context.arc(point_start[0], point_start[1], 3, 0, 2 * Math.PI, false);
                            context.moveTo(point_end[0], point_end[1]);
                            context.arc(point_end[0], point_end[1], 3, 0, 2 * Math.PI, false);
                            context.stroke();
                        }

                        break;
                    }

                    /**
                     * Quadratic bezier curve
                     */

                case 4:
                    {
                        /**
                         * Apply cascaded matrix transformations to the end point
                         * and the control point
                         */

                        const point_control = vec2.create();
                        vec2.transformMat3(point_control, vec2.fromValues(this._segments[i][0], this._segments[i][1]), this._matrix_cascaded);
                        vec2.transformMat3(point_end, vec2.fromValues(this._segments[i][2], this._segments[i][3]), this._matrix_cascaded);

                        /**
                         * Calculate extremas for each axis
                         */

                        const extremas = [];
                        const extremas_t = [];
                        extremas_t.push(...(get_quadratic_function_extrema_for(point_start[0], point_control[0], point_end[0])));
                        extremas_t.push(...(get_quadratic_function_extrema_for(point_start[1], point_control[1], point_end[1])));

                        for (let i = 0; i < extremas_t.length; ++i) {
                            const extrema_x = get_quadratic_function_for(point_start[0], point_control[0], point_end[0], extremas_t[i]);
                            const extrema_y = get_quadratic_function_for(point_start[1], point_control[1], point_end[1], extremas_t[i]);
                            extremas.push([extrema_x, extrema_y]);
                            xValues.push(extrema_x);
                            yValues.push(extrema_y);
                        }

                        /**
                         * Append end points to the arrays for further calculation
                         * of the bounding box
                         */

                        xValues.push(point_end[0]);
                        yValues.push(point_end[1]);

                        /**
                         * Render out debug info if the debug flag is enabled
                         */

                        if (this._debug === true) {
                            const context = _scene.context();
                            context.lineWidth = 1;
                            context.strokeStyle = "#EE0000";
                            context.setTransform(1, 0, 0, 1, 0, 0);
                            context.beginPath();
                            context.arc(point_start[0], point_start[1], 3, 0, 2 * Math.PI, false);
                            context.moveTo(point_end[0], point_end[1]);
                            context.arc(point_end[0], point_end[1], 3, 0, 2 * Math.PI, false);
                            context.stroke();
                            for (let i = 0; i < 1; i += 0.1) {
                                let x = get_quadratic_function_for(point_start[0], point_control[0], point_end[0], i);
                                let y = get_quadratic_function_for(point_start[1], point_control[1], point_end[1], i);
                                context.beginPath();
                                context.arc(x, y, 3, 0, 2 * Math.PI, false);
                                context.stroke();
                            }
                            context.beginPath();
                            context.strokeStyle = "#0000EE";
                            context.moveTo(point_start[0], point_start[1]);
                            context.lineTo(point_control[0], point_control[1]);
                            context.lineTo(point_end[0], point_end[1]);
                            context.stroke();
                            context.beginPath();
                            context.lineWidth = 2;
                            context.arc(point_control[0], point_control[1], 4, 0, 2 * Math.PI, false);
                            context.stroke();

                            /**
                             * Extremas
                             */

                            for (let i = 0; i < extremas.length; ++i) {
                                context.beginPath();
                                context.arc(extremas[i][0], extremas[i][1], 4, 0, 2 * Math.PI, false);
                                context.stroke();
                            }
                        }

                        break;
                    }

                    /**
                     * Cubic bezier curve
                     */

                case 6:
                    {
                        /**
                         * Apply cascaded matrix transformations to the end point
                         * and the control points
                         */

                        const point_control_a = vec2.create();
                        const point_control_b = vec2.create();
                        vec2.transformMat3(point_control_a, vec2.fromValues(this._segments[i][0], this._segments[i][1]), this._matrix_cascaded);
                        vec2.transformMat3(point_control_b, vec2.fromValues(this._segments[i][2], this._segments[i][3]), this._matrix_cascaded);
                        vec2.transformMat3(point_end, vec2.fromValues(this._segments[i][4], this._segments[i][5]), this._matrix_cascaded);

                        /**
                         * Calculate extremas for each axis
                         */

                        const extremas = [];
                        const extremas_t = [];
                        extremas_t.push(...(get_cubic_function_extremas_for(point_start[0], point_control_a[0], point_control_b[0], point_end[0])));
                        extremas_t.push(...(get_cubic_function_extremas_for(point_start[1], point_control_a[1], point_control_b[1], point_end[1])));

                        for (let i = 0; i < extremas_t.length; ++i) {
                            const extrema_x = get_cubic_function_for(point_start[0], point_control_a[0], point_control_b[0], point_end[0], extremas_t[i]);
                            const extrema_y = get_cubic_function_for(point_start[1], point_control_a[1], point_control_b[1], point_end[1], extremas_t[i]);
                            extremas.push([extrema_x, extrema_y]);
                            xValues.push(extrema_x);
                            yValues.push(extrema_y);
                        }

                        /**
                         * Append end points to the arrays for further calculation
                         * of the bounding box
                         */

                        xValues.push(point_end[0]);
                        yValues.push(point_end[1]);

                        /**
                         * Render out debug info if the debug flag is enabled
                         */

                        if (this._debug === true) {
                            const context = _scene.context();
                            context.lineWidth = 1;
                            context.strokeStyle = "#EE0000";
                            context.setTransform(1, 0, 0, 1, 0, 0);
                            context.beginPath();
                            context.arc(point_start[0], point_start[1], 3, 0, 2 * Math.PI, false);
                            context.moveTo(point_end[0], point_end[1]);
                            context.arc(point_end[0], point_end[1], 3, 0, 2 * Math.PI, false);
                            context.stroke();

                            /**
                             * Curve points
                             */

                            for (let i = 0; i < 1; i += 0.1) {
                                let x = get_cubic_function_for(point_start[0], point_control_a[0], point_control_b[0], point_end[0], i);
                                let y = get_cubic_function_for(point_start[1], point_control_a[1], point_control_b[1], point_end[1], i);
                                context.beginPath();
                                context.arc(x, y, 3, 0, 2 * Math.PI, false);
                                context.stroke();
                            }

                            /**
                             * Control points
                             */

                            context.beginPath();
                            context.strokeStyle = "#0000EE";
                            context.moveTo(point_start[0], point_start[1]);
                            context.lineTo(point_control_a[0], point_control_a[1]);
                            context.lineTo(point_control_b[0], point_control_b[1]);
                            context.lineTo(point_end[0], point_end[1]);
                            context.stroke();
                            context.lineWidth = 2;
                            context.beginPath();
                            context.arc(point_control_a[0], point_control_a[1], 4, 0, 2 * Math.PI, false);
                            context.moveTo(point_control_b[0], point_control_b[1]);
                            context.arc(point_control_b[0], point_control_b[1], 4, 0, 2 * Math.PI, false);
                            context.stroke();

                            /**
                             * Extremas
                             */

                            for (let i = 0; i < extremas.length; ++i) {
                                context.beginPath();
                                context.arc(extremas[i][0], extremas[i][1], 4, 0, 2 * Math.PI, false);
                                context.stroke();
                            }
                        }

                        break;
                    }
            }
        }

        /**
         * Returning the newly created bouding box
         */

        return BBox.prototype.from(xValues, yValues);
    };

    /**
     * Render the current path
     */

    Path.prototype.render = function() {
        const context = _scene.context();
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.setTransform(...glmatrix_to_canvas_matrix(this._matrix_cascaded));
        context.beginPath();
        context.moveTo(this._at.x, this._at.y);
        for (let i = 0; i < this._segments.length; ++i) {
            switch (this._segments[i].length) {
                case 2:
                    context.lineTo(...this._segments[i]);
                    break;
                case 4:
                    context.quadraticCurveTo(...this._segments[i]);
                    break;
                case 6:
                    context.bezierCurveTo(...this._segments[i]);
                    break;
                default:
            }
        }
        context.stroke();

        if (this._debug === true) {
            let bbox = this.bboxCascaded();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.beginPath();
            context.lineWidth = 2;
            context.rect(bbox.x(), bbox.y() - bbox.height(), bbox.width(), bbox.height());
            context.strokeStyle = '#EE0000';
            context.stroke();
        }
    };

    return Path;
};