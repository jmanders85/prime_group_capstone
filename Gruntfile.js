module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        files: {
          'server/public/assets/styles/stylesheet.css':'client/styles/stylesheet.scss'
        }
      }
    },
    watch: {
      css: {
        files: 'client/styles/*.scss',
        tasks: ['sass'],
      },
      scripts: {
        files: 'client/scripts/client.js',
        tasks: ['uglify'],
        options: {
          spawn: false
        }
      }
    },
    uglify: {
      build: {
        src: 'client/scripts/client.js',
        dest: 'server/public/assets/scripts/client.min.js'
      }
    },
    copy: {
      angular: {
        expand: true,
        cwd: "node_modules/",
        src: [
          "angular/angular.min.js",
          "angular/angular.min.js.map",
          "angular-ui-router/release/angular-ui-router.min.js"
        ],
        "dest": "server/public/vendor/"
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');

  // Default task(s).
  grunt.registerTask('default', ['copy', 'uglify', 'sass', 'watch']);

};
