import gulp from "gulp";
import gulpif from "gulp-if";
import browsersync from "browser-sync";
import autoprefixer from "gulp-autoprefixer";
import babel from "gulp-babel";
import browserify from "browserify";
import watchify from "watchify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import uglify from "gulp-uglify";
import sass from "gulp-sass";
import groupmediaqueries from "gulp-group-css-media-queries";
import mincss from "gulp-clean-css";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import imagemin from "gulp-imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminZopfli from "imagemin-zopfli";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGiflossy from "imagemin-giflossy";
import imageminWebp from "imagemin-webp";
import webp from "gulp-webp";
import favicons from "gulp-favicons";
import svgSprite from "gulp-svg-sprite";
import replace from "gulp-replace";
import rigger from "gulp-rigger";
import plumber from "gulp-plumber";
import debug from "gulp-debug";
import clean from "gulp-clean";
import yargs from "yargs";

const argv = yargs.argv,
	production = !!argv.production,
	smartgrid = require("smart-grid"),

	paths = {
		views: {
			src: [
				"./src/views/*.html",
				"./src/views/pages/*.html"
			],
			dist: "./build/",
			watch: "./src/views/**/*.html"
		},
		styles: {
			src: "./src/styles/main.scss",
			dist: "./build/styles/",
			watch: "./src/styles/**/*.scss"
		},
		scripts: {
			src: "./src/js/main.js",
			dist: "./build/js/",
			watch: "./src/js/**/*.js"
		},
		images: {
			src: [
				"./src/img/**/*.{jpg,jpeg,png,gif,svg}",
				"!./src/img/svg/*.svg",
				"!./src/img/favicon.{jpg,jpeg,png,gif}"
			],
			dist: "./build/img/",
			watch: "./src/img/**/*.{jpg,jpeg,png,gif,svg}"
		},
		webp: {
			src: "./src/img/**/*_webp.{jpg,jpeg,png}",
			dist: "./build/img/",
			watch: "./src/img/**/*_webp.{jpg,jpeg,png}"
		},
		sprites: {
			src: "./src/img/svg/*.svg",
			dist: "./build/img/sprites/",
			watch: "./src/img/svg/*.svg"
		},
		favicons: {
			src: "./src/img/favicon.{jpg,jpeg,png,gif}",
			dist: "./build/img/favicons/",
		},
		server_config: {
			src: "./src/.htaccess",
			dist: "./build/"
		},
		fonts: {
			src: "./src/fonts/Oswald/*.{woff,ttf}",
			dist: "./build/fonts/Oswald"
		},
		svg: {
			src: "./src/img/svg/*.{svg}",
			dist: "./build/img/svg"
		}
	};

export const server = () => {
	browsersync.init({
		injectChanges: true,
		server: "./build/",
		port: 4000,
		tunnel: true,
		notify: true
	});
};

export const watchCode = () => {
	gulp.watch(paths.views.watch, views);
	gulp.watch(paths.styles.watch, styles);
	gulp.watch(paths.scripts.watch, scripts);
	gulp.watch(paths.images.watch, images);
	gulp.watch(paths.webp.watch, webpimages);
	gulp.watch(paths.sprites.watch, sprites);
};

export const cleanFiles = () => gulp.src("./build/**/", {read: false})
	.pipe(clean())
	.pipe(debug({
		"title": "Cleaning..."
	}));

export const serverConfig = () => gulp.src(paths.server_config.src)
	.pipe(gulp.dest(paths.server_config.dist))
	.pipe(debug({
		"title": "Server config"
	}));

export const smartGrid = cb => {
	smartgrid("./src/styles/utils", {
		outputStyle: "scss",
		filename: "_smart-grid",
		columns: 12, // number of grid columns
		offset: "30px", // gutter width
		mobileFirst: true,
		container: {
			fields: "15px"
		},
		breakPoints: {
			xs: {
				width: "320px"
			},
			sm: {
				width: "576px"
			},
			md: {
				width: "768px"
			},
			lg: {
				width: "992px"
			},
			xl: {
				width: "1200px"
			}
		}
	});
	cb();
};

export const views = () => gulp.src(paths.views.src)
	.pipe(rigger())
	.pipe(gulpif(production, replace("main.css", "main.min.css")))
	.pipe(gulpif(production, replace("main.js", "main.min.js")))
	.pipe(gulp.dest(paths.views.dist))
	.pipe(debug({
		"title": "HTML files"
	}))
	.on("end", browsersync.reload);

export const fonts = () => gulp.src(paths.fonts.src)
	.pipe(gulp.dest(paths.fonts.dist))
	.pipe(debug({
		"title": "Fonts"
	}));

export const svg = () => gulp.src(paths.svg.src)
	.pipe(gulp.dest(paths.svg.dist))
	.pipe(debug({
		"title": "SVG"
	}));

export const styles = () => gulp.src(paths.styles.src)
	.pipe(gulpif(!production, sourcemaps.init()))
	.pipe(plumber())
	.pipe(sass())
	.pipe(groupmediaqueries())
	.pipe(gulpif(production, autoprefixer({
		browsers: ["last 12 versions", "> 1%", "ie 8", "ie 7"]
	})))
	.pipe(gulpif(production, mincss({
		compatibility: "ie8", level: {
			1: {
				specialComments: 0,
				removeEmpty: true,
				removeWhitespace: true
			},
			2: {
				mergeMedia: true,
				removeEmpty: true,
				removeDuplicateFontRules: true,
				removeDuplicateMediaBlocks: true,
				removeDuplicateRules: true,
				removeUnusedAtRules: false
			}
		}
	})))
	.pipe(gulpif(production, rename({
		suffix: ".min"
	})))
	.pipe(plumber.stop())
	.pipe(gulpif(!production, sourcemaps.write("./maps/")))
	.pipe(gulp.dest(paths.styles.dist))
	.pipe(debug({
		"title": "CSS files"
	}))
	.pipe(browsersync.stream());

export const scripts = () => {
	let bundler = browserify({
		entries: paths.scripts.src,
		cache: { },
		packageCache: { },
		fullPaths: true,
		debug: true
	}).transform("babelify", {
		presets: [
			"@babel/preset-env"
		]
	});

	const bundle = () => {
		return bundler
			.bundle()
			.on("error", function () {})
			.pipe(source("main.js"))
			.pipe(buffer())
			.pipe(gulpif(!production, sourcemaps.init()))
			.pipe(babel())
			.pipe(gulpif(production, uglify()))
			.pipe(gulpif(production, rename({
				suffix: ".min"
			})))
			.pipe(gulpif(!production, sourcemaps.write("./maps/")))
			.pipe(gulp.dest(paths.scripts.dist))
			.pipe(debug({
				"title": "JS files"
			}))
			.on("end", browsersync.reload);
	};

	if(global.isWatching) {
		bundler = watchify(bundler);
		bundler.on("update", bundle);
	}

	return bundle();
};

export const images = () => gulp.src(paths.images.src)
	.pipe(gulpif(production, imagemin([
		imageminGiflossy({
			optimizationLevel: 3,
			optimize: 3,
			lossy: 2
		}),
		imageminPngquant({
			speed: 5,
			quality: 75
		}),
		imageminZopfli({
			more: true
		}),
		imageminMozjpeg({
			progressive: true,
			quality: 70
		}),
		imagemin.svgo({
			plugins: [
				{ removeViewBox: false },
				{ removeUnusedNS: false },
				{ removeUselessStrokeAndFill: false },
				{ cleanupIDs: false },
				{ removeComments: true },
				{ removeEmptyAttrs: true },
				{ removeEmptyText: true },
				{ collapseGroups: true }
			]
		})
	])))
	.pipe(gulp.dest(paths.images.dist))
	.pipe(debug({
		"title": "Images"
	}))
	.on("end", browsersync.reload);

export const webpimages = () => gulp.src(paths.webp.src)
	.pipe(webp(imageminWebp({
		lossless: true,
		quality: 75,
		alphaQuality: 75
	})))
	.pipe(gulp.dest(paths.webp.dist))
	.pipe(debug({
		"title": "WebP images"
	}));

export const sprites = () => gulp.src(paths.sprites.src)
	.pipe(svgSprite({
		mode: {
			stack: {
				sprite: "../sprite.svg"
			}
		}
	}))
	.pipe(gulp.dest(paths.sprites.dist))
	.pipe(debug({
		"title": "Sprites"
	}))
	.on("end", browsersync.reload);

export const favs = () => gulp.src(paths.favicons.src)
	.pipe(favicons({
		icons: {
			appleIcon: true,
			favicons: true,
			online: false,
			appleStartup: false,
			android: false,
			firefox: false,
			yandex: false,
			windows: false,
			coast: false
		}
	}))
	.pipe(gulp.dest(paths.favicons.dist))
	.pipe(debug({
		"title": "Favicons"
	}));

export const development = gulp.series(cleanFiles, smartGrid,
	gulp.parallel(views, styles, scripts, images, webpimages, sprites, favs, fonts, svg),
	gulp.parallel(watchCode, server));

export const prod = gulp.series(cleanFiles, smartGrid, serverConfig, views, styles, scripts, images, webpimages, sprites, favs, fonts, svg);

export default development;

