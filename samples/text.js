import {
    SceneManager,
    Material,
    Keyframe,
    Easings
} from '../src/scene_manager';
import {
    random_color
} from '../src/utils/helper';

const scene_manager = new SceneManager();
const scene = scene_manager.new('scene');
const root = scene.root();
const Text = scene.factory().Text;
const text = new Text();
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
    .debug(true)
    .text('Hello, canvas!')
    .material(material);

root
    .append(text);

scene.timeline().add(
    material,
    new Keyframe().size(48).style('italic'),
    new Keyframe().time(5000).style('normal'),
    new Keyframe().time(10000).style('italic').size(200)
);

scene.start();
