// webpack.mix.js

let mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js').setPublicPath('public')
    .sass('resources/scss/app.scss','public/css')
    .setPublicPath('public')
    .options({
    postCss: [
        require('tailwindcss')
    ]
});


