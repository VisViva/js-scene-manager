'use strict';

import {
    inherit
} from "../utils/helper";
import {
    Material
} from '../core/material';

exports.Primitive = function (_scene, Node) {

    /**
     * Extends the Node prototype
     */

    inherit(Primitive, Node);

    /**
     * Primitive constructor
     */

    function Primitive() {
        Node.call(this);

        /**
         * Primitives starting point
         */

        this._at = {
            x: 0,
            y: 0
        };

        /**
         * Depth of the current primitive
         */

        this._depth = 0;

        /**
         * Flag that indicates whether debugging info should be rendered
         */

        this._debug = false;

        /**
         * Flag that indicates whether the primitive should be rendered
         */

        this._hidden = false;

        /**
         * Material of the current primitive
         */

        this._material = new Material();
    }

    /**
     * Get or set the primitives starting point
     */

    Primitive.prototype.at = function (x, y) {
        if (x !== undefined || y !== undefined) {

            /**
             * Compensate for canvas specific y-axis direction
             */

            this._at.x = (x !== undefined) && x || this._at.x;
            this._at.y = (y !== undefined) && -y || this._at.y;
            this._dirty = true;
            return this;
        } else {
            return {
                x: this._at.x,
                y: -this._at.y
            };
        }
    };

    /**
     * Get or set the primitives starting point on the x axis
     */

    Primitive.prototype.atX = function (x) {
        return this.at(x, undefined);
    };

    /**
     * Get or set the primitives starting point on the y axis
     */

    Primitive.prototype.atY = function (x) {
        return this.at(undefined, y);
    };

    /**
     * Get or set the current nodes debugger state
     */

    Primitive.prototype.debug = function (debug) {
        if (debug !== undefined) {
            this._debug = debug;
            return this;
        } else {
            return this._debug;
        }
    };

    /**
     * Define depth of the primitive and return it
     */

    Primitive.prototype.depth = function (depth) {
        if (depth !== undefined) {
            depth = ~~depth;
            _scene._depthbuffer.relocate(this, depth);
            this._depth = depth;
            return this;
        } else {
            return this._depth;
        }
    };

    /**
     * Get or set visibility of the current primitive
     */

    Primitive.prototype.hidden = function (hidden) {
        if (hidden !== undefined) {
            this._hidden = hidden;
            return this;
        } else {
            return this._hidden;
        }
    };

    /**
     * Get or set the material of the current primitive
     */

    Primitive.prototype.material = function (material) {
        if (material) {
            this._material = material;
            return this;
        } else {
            return this._material;
        }
    };

    /**
     * Render the primitive
     */

    Primitive.prototype.render = function () {};

    return Primitive;
};
