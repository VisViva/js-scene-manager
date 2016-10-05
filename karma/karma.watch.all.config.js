const common = require('./karma.common.config.js')

common.reporters = ['progress', 'coverage'];
common.browsers = ['PhantomJS', 'Chrome', 'Firefox'];
common.autoWatch = true;
common.singleRun = false;

module.exports = function(config) {
    config.set(common);
}
