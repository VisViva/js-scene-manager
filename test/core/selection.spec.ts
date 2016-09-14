import { expect, should } from 'chai';
import { Selection } from '../../src/core/selection';

describe('Selection tests', () => {
    describe('Common behavior', () => {
        it('Runs tests', () => {
            expect(true).to.equal(true);
        });
    });

    describe('Selection behavior', () => {
        let selectionA: Selection<number>;
        let selectionB: Selection<string>;

        beforeEach(function() {
            selectionA = new Selection<number>(1, 2, 3, 4, 5);
            selectionB = new Selection<string>('a', 'b', 'c');
        });

        it('Exposes simple accessor methods', () => {
            expect(selectionA.first()).to.equal(1);
            expect(selectionB.first()).to.equal('a');
            expect(selectionA.last()).to.equal(5);
            expect(selectionB.last()).to.equal('c');
        });

        it('Exposes working range and array methods', () => {
            let rangeA1Array: Array<number> = selectionA.range(-5, 3).array();
            expect(rangeA1Array.length).to.equal(4);
            expect(rangeA1Array.join('')).to.equal('1234');
            let rangeA2Array: Array<number> = selectionA.range(3, 10).array();
            expect(rangeA2Array.length).to.equal(2);
            expect(rangeA2Array.join('')).to.equal('45');
            let rangeA3Array: Array<number> = selectionA.range(5, 1).array();
            expect(rangeA3Array.length).to.equal(0);
            let rangeB1Array: Array<string> = selectionB.range(1, 4).array();
            expect(rangeB1Array.length).to.equal(2);
            expect(rangeB1Array.join('')).to.equal('bc');
            let rangeB2Array: Array<string> = selectionB.range(1, -4).array();
            expect(rangeB2Array.length).to.equal(0);
        });

        it('Exposes proper modification interface', () => {
            let rangeA1Array: Array<number> = selectionA.modify((element) => {
                return element += 10;
            }).array();
            expect(rangeA1Array.length).to.equal(5);
            expect(rangeA1Array.join('')).to.equal('1112131415');
            let rangeB1Array: Array<string> = selectionB.modify((element) => {
                return element += 10;
            }).array();
            expect(rangeB1Array.length).to.equal(3);
            expect(rangeB1Array.join('')).to.equal('a10b10c10');
        });
    });
});
