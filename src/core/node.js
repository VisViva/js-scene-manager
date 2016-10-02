'use strict';

const glMatrix = require('gl-matrix');
const vec2 = glMatrix.vec2;
const mat3 = glMatrix.mat3;

import { Selection } from '../core/selection';
import { BBox } from '../core/bbox';
import { deg_to_rad, rad_to_deg, trim_angle } from '../utils/math';
import { clone_matrix } from '../utils/helper';

exports.Node = function(_scene) {

    /**
     * Node constructor
     */

    function Node() {

        // Current nodes position
        this._position = {
            x: 0,
            y: 0
        };

        // Current nodes rotation in degrees
        this._rotation = 0;

        // Current nodes scale
        this._scale = {
            x: 1,
            y: 1
        };

        // Current nodes transformation matrix
        this._matrix_own = mat3.create();

        // Current nodes cascaded transformation matrix
        this._matrix_cascaded = mat3.create();

        // Child nodes of the current node
        this._children = [];

        // Parent node of the current node
        this._parent = null;

        // Indicates whether the current node should be iterated over during rendering
        this._active = true;

        // Indicates whether uncascaded transformations have been applied to the current nodes children
        this._dirty = false;
    };

    /**
     * Get or set the position of the node
     */

    Node.prototype.translate = function(x, y) {
        if (x && y) {
            mat3.translate(this._matrix_own, this._matrix_own, vec2.fromValues(x, y));
            this._position.x += x;
            this._position.y += y;
            this._dirty = true;
            return this;
        } else {
            return this._position;
        }
    };

    /**
     * Get or set the rotation of the node
     */

    Node.prototype.rotate = function(rotation) {
        if (rotation) {
            mat3.rotate(this._matrix_own, this._matrix_own, deg_to_rad(rotation));
            this._rotation = trim_angle(this._rotation + rotation);
            this._dirty = true;
            return this;
        } else {
            return this._rotation;
        }
    };

    /**
     * Get or set the scale of the node
     */

    Node.prototype.scale = function(x, y) {
        if (x && y) {
            mat3.scale(this._matrix_own, this._matrix_own, vec2.fromValues(x, y));
            this._scale.x *= x;
            this._scale.y *= y;
            this._dirty = true;
            return this;
        } else {
            return this._scale;
        }
    };

    /**
     * Get the nodes transformation matrix
     */

    Node.prototype.matrixOwn = function() {
        return mat3.clone(this._matrix_own);
    };

    /**
     * Get the nodes cascaded transformation matrix
     */

    Node.prototype.matrixCascaded = function() {
        return mat3.clone(this._matrix_cascaded);
    };

    /**
     * Append one or more nodes as children of the current node
     */

    Node.prototype.append = function(...nodes) {

        /**
         * Check if the current node is linked to the root,
         * and update the depth buffer if that is the case
         */

        const linked = this.linked(_scene.root());
        for (let i = 0; i < nodes.length; ++i) {
            nodes[i].parent(this);
            nodes[i]._dirty = true;
            this._children.push(nodes[i]);
            linked === true && // Proceed if node is linked to the root
            nodes[i].active() && // Proceed if node is active
            typeof nodes[i]._depth !== 'undefined' && // Proceed if the node has depth
            _scene._depthbuffer.append(nodes[i]); // Append the current node to the depth buffer
        }

        return this;
    };

    /**
     * Get or set the current nodes parent
     */

    Node.prototype.parent = function(parent) {
        if (parent) {
            this._parent = parent;
            return this;
        } else {
            return this._parent;
        }
    };

    /**
     * List child nodes of the current node
     */

    Node.prototype.children = function() {
        const children = [];
        for (let i = 0; i < this._children.length; ++i) {
            children.push(this._children[i]);
        }
        return new Selection(...children);
    };

    /**
     * Check if the current nodes children contain the given node
     */

    Node.prototype.has = function(node) {
        if (this === node) return true;
        for (let i = 0; i < this._children.length; ++i) {
            if (this._children[i].has(node) === true) return true;
        }
        return false;
    };

    /**
     * Check if the current node is linked to the given node
     */

    Node.prototype.linked = function(node) {
        let current = this;
        while (current !== node && current.parent()) current = current.parent();
        return current === node;
    };

    /**
     * Get or set the current nodes activeness status
     */

    Node.prototype.active = function(active) {
        if (typeof active !== 'undefined') {
            this._active = active;
            return this;
        } else {
            return this._active;
        }
    };

    /**
     * Get or set the current nodes dirtiness status
     */

    Node.prototype.dirty = function(value) {
        if (typeof value !== 'undefined') {
            this._dirty = value;
            return this;
        } else {
            return this._dirty;
        }
    };

    /**
     * Get a selection of dirty nodes in straight reachability
     */

    Node.prototype.reachDirty = function() {
        if (this._dirty === true) {
            return new Selection(this);
        } else {
            let dirtyNodes = new Selection();
            for (let i = 0; i < this._children.length; ++i) {
                let dirtyChildNodes = this._children[i].reachDirty().array();
                dirtyChildNodes.length > 0 && dirtyNodes.add(...dirtyChildNodes);
            }
            return dirtyNodes;
        }
    };

    /**
     * Cascades transformations down the hierarchy, cleaning the dirty flag
     */

    Node.prototype.cascade = function() {
        if (this.parent()) {
            mat3.multiply(this._matrix_cascaded, this.parent()._matrix_cascaded, this._matrix_own);
        } else {
            this._matrix_cascaded = mat3.clone(this._matrix_own);
        }
        for (let i = 0; i < this._children.length; ++i) {
            this._children[i].cascade();
        }
        this._dirty = false;
        return this;
    };

    /**
     * Gets the bounding box of the current node only
     */

    Node.prototype.bboxOwn = function() {
        return new BBox();
    };

    /**
     * Starts recursive merge of all the child bboxes
     */

    Node.prototype.bboxCascaded = function() {
        const bboxes = [];
        for (let i = 0; i < this._children.length; ++i) {
            bboxes.push(this._children[i].bboxCascaded());
        }
        return this.bboxOwn().merge(...bboxes);
    };

    return Node;
};
