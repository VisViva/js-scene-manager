import {
    Manager,
    Material,
    Keyframe,
    Easings
} from '../src/cor';
import {
    random_color
} from '../src/utils/helper';

const manager = new Manager();
const scene = manager.new('scene');
const root = scene.root();
const Text = scene.factory().Text;
const text = new Text(true);
const material = new Material();

window.addEventListener('resize', function(event) {
    scene.resize();
});

material
    .fill([255, 255, 255, 1])
    .stroke([0, 0, 0, 1]);

scene
    .grid(true)
    .fps(60)
    .material()
    .stroke([0, 0, 0, 1])
    .width(1)
    .fill([200, 200, 200, 1]);

text
    .text('adsasdsdasd')
    .size(96)
    .line(96)
    .rasterized(true, 900, 140)
    .material(material);

root
    .append(text);

scene.timeline().add(
    text,
    new Keyframe().style('italic').scale(0.5, 0.5),
    new Keyframe().time(2000).style('normal'),
    new Keyframe().time(4000).style('italic').scale(1.2, 1.2, Easings.cubic, Easings.cubic)
);

scene.start();
