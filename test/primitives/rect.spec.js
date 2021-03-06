'use strict';

import {
    expect
} from 'chai/chai';
import {
    Scene
} from '../../src/core/scene';
import {
    BBox
} from '../../src/core/bbox';

describe('Rect tests', () => {
    const Factory = new Scene().factory();
    const Node = Factory.Node;
    const Rect = Factory.Rect;

    describe('Constructor behavior', () => {
        let rect;

        beforeEach(function() {
            rect = new Rect();
        });

        it('Executes parent constructor correctly', () => {
            expect(rect.at().x).to.be.equal(0);
            expect(rect.at().y).to.be.equal(0);
            expect(rect.depth()).to.be.equal(0);
            expect(rect.debug()).to.be.equal(false);
            expect(rect.hidden()).to.be.equal(false);
            expect(rect.material().stroke().join('')).to.be.equal('0001');
            expect(rect.material().stroked()).to.be.equal(true);
            expect(rect.material().width()).to.be.equal(1);
            expect(rect.material().fill().join('')).to.be.equal('0001');
            expect(rect.material().filled()).to.be.equal(true);
        });

        it('Executes own constructor correctly', () => {
            expect(rect.width()).to.be.equal(0);
            expect(rect.height()).to.be.equal(0);
        });
    });

    describe('Property setting behavior', () => {
        let rect;

        beforeEach(function() {
            rect = new Rect();
        });

        it('Sets rotation correctly', () => {
            expect(rect.rotate(45)).to.be.equal(rect);
            expect(rect.rotate()).to.be.equal(45);
        });

        it('Sets position correctly', () => {
            expect(rect.translate(10, 20)).to.be.equal(rect);
            expect(rect.translate().x).to.be.equal(10);
            expect(rect.translate().y).to.be.equal(20);
        });

        it('Sets scale correctly', () => {
            expect(rect.scale(10, 20)).to.be.equal(rect);
            expect(rect.scale().x).to.be.equal(10);
            expect(rect.scale().y).to.be.equal(20);
        });

        it('Sets width correctly', () => {
            expect(rect.width(100)).to.be.equal(rect);
            expect(rect.width()).to.be.equal(100);
        });

        it('Sets height correctly', () => {
            expect(rect.height(100)).to.be.equal(rect);
            expect(rect.height()).to.be.equal(100);
        });
    });

    describe('Hierarchy', () => {
        let rect;
        let nodeB;
        let nodeC;

        beforeEach(function() {
            rect = new Rect();
            rect.translate(10, 20);
            nodeB = new Node();
            nodeB.translate(30, 40);
            nodeC = new Node();
            nodeC.translate(50, 60);
        });

        it('Appends children one by one', () => {
            expect(rect.append(nodeB)).to.be.equal(rect);
            expect(nodeB.append(nodeC)).to.be.equal(nodeB);
            expect(rect.children()[0]).to.be.equal(nodeB);
            expect(rect.children()[rect.children().length - 1]).to.be.equal(nodeB);
            expect(rect.children().length).to.be.equal(1);
            expect(nodeB.children()[0]).to.be.equal(nodeC);
            expect(nodeB.children()[nodeB.children().length - 1]).to.be.equal(nodeC);
            expect(nodeB.children().length).to.be.equal(1);
        });

        it('Appends multiple children', () => {
            expect(rect.append(nodeB, nodeC)).to.be.equal(rect);
            expect(rect.children()[0]).to.be.equal(nodeB);
            expect(rect.children()[rect.children().length - 1]).to.be.equal(nodeC);
            expect(rect.children().length).to.be.equal(2);
        });

        it('Sets parent node correctly', () => {
            expect(rect.append(nodeB)).to.be.equal(rect);
            expect(nodeB.append(nodeC)).to.be.equal(nodeB);
            expect(nodeB.parent()).to.be.equal(rect);
            expect(nodeC.parent()).to.be.equal(nodeB);
        });
    });

    describe('Bounding box calculation behavior', () => {
        let rect;
        let bbox;

        it('Gets untouched bounding box correctly', () => {
            rect = new Rect().width(10).height(10).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.equal(-5);
            expect(bbox.y()).to.be.equal(5);
            expect(bbox.width()).to.be.equal(10);
            expect(bbox.height()).to.be.equal(10);
        });

        it('Gets bounding box of a rectangle with an offset correctly', () => {
            rect = new Rect().at(10, 10).width(10).height(10).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.equal(5);
            expect(bbox.y()).to.be.equal(-5);
            expect(bbox.width()).to.be.equal(10);
            expect(bbox.height()).to.be.equal(10);
        });

        it('Gets translated primitives bounding box correctly', () => {
            rect = new Rect().translate(50, 50).width(150).height(150).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.equal(-25);
            expect(bbox.y()).to.be.equal(25);
            expect(bbox.width()).to.be.equal(150);
            expect(bbox.height()).to.be.equal(150);
        });

        it('Gets translated primitives bounding box with an offset correctly', () => {
            rect = new Rect().at(10, 10).translate(50, 50).width(150).height(150).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.equal(-15);
            expect(bbox.y()).to.be.equal(15);
            expect(bbox.width()).to.be.equal(150);
            expect(bbox.height()).to.be.equal(150);
        });

        it('Gets rotated primitives bounding box correctly', () => {
            rect = new Rect().rotate(45).width(10).height(10).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.approximately(-7.0, 0.1);
            expect(bbox.y()).to.be.approximately(7.0, 0.1);
            expect(bbox.width()).to.be.approximately(14.1, 0.1);
            expect(bbox.height()).to.be.approximately(14.1, 0.1);
        });

        it('Gets rotated primitives bounding box with an offset correctly', () => {
            rect = new Rect().at(10, 10).rotate(45).width(10).height(10).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.approximately(7.0, 0.1);
            expect(bbox.y()).to.be.approximately(7.0, 0.1);
            expect(bbox.width()).to.be.approximately(14.1, 0.1);
            expect(bbox.height()).to.be.approximately(14.1, 0.1);
        });

        it('Gets scaled primitives bounding box correctly', () => {
            rect = new Rect().scale(2, 2).width(10).height(10).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.equal(-10);
            expect(bbox.y()).to.be.equal(10);
            expect(bbox.width()).to.be.equal(20);
            expect(bbox.height()).to.be.equal(20);
        });

        it('Gets scaled primitives bounding box with an offset correctly', () => {
            rect = new Rect();
            rect.at(10, 10).scale(3, 3).width(10).height(10).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.equal(15);
            expect(bbox.y()).to.be.equal(-15);
            expect(bbox.width()).to.be.equal(30);
            expect(bbox.height()).to.be.equal(30);
        });

        it('Gets scaled, rotated and translated primitives bounding box correctly', () => {
            rect = new Rect().translate(10, 10).rotate(270).width(10).height(10).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.approximately(5, 0.1);
            expect(bbox.y()).to.be.approximately(-5, 0.1);
            expect(bbox.width()).to.be.approximately(10.0, 0.1);
            expect(bbox.height()).to.be.approximately(10.1, 0.1);
            rect.translate(10, 10).rotate(45).cascade();
            bbox = rect.bbox();
            expect(rect.bbox().x()).to.be.approximately(2.9, 0.1);
            expect(rect.bbox().y()).to.be.approximately(-2.9, 0.1);
            expect(rect.bbox().width()).to.be.approximately(14.1, 0.1);
            expect(rect.bbox().height()).to.be.approximately(14.1, 0.1);
        });

        it('Gets scaled, rotated and translated primitives bounding box with an offset correctly', () => {
            rect = new Rect().at(10, 10).translate(10, 10).rotate(270).width(10).height(10).cascade();
            bbox = rect.bbox();
            expect(bbox.x()).to.be.approximately(-4.9, 0.1);
            expect(bbox.y()).to.be.approximately(-15.0, 0.1);
            expect(bbox.width()).to.be.approximately(10.0, 0.1);
            expect(bbox.height()).to.be.approximately(10.1, 0.1);
            rect.translate(10, 10).rotate(45).cascade();
            bbox = rect.bbox();
            expect(rect.bbox().x()).to.be.approximately(17.0, 0.1);
            expect(rect.bbox().y()).to.be.approximately(-2.9, 0.1);
            expect(rect.bbox().width()).to.be.approximately(14.1, 0.1);
            expect(rect.bbox().height()).to.be.approximately(14.1, 0.1);
        });
    });
});
