[![Sassg logo](https://github.com/ravid7000/sassg/raw/master/assets/logo.png)](https://ravid7000.github.io/sassg/)


# sassg
Generator for Sass/SCSS

[![Build Status](https://travis-ci.org/ravid7000/sass-cli.svg?branch=master)](https://travis-ci.org/ravid7000/sass-cli)
[![Build status](https://ci.appveyor.com/api/projects/status/3lf4x6akj0072vw0?svg=true)](https://ci.appveyor.com/project/ravid7000/sassg)


### Installation

```sh
$ npm install -g sassg
```

---



### Quick Start

The quickest way to get started with sassg is to utilize the executable `sass(1)` to generate an application as shown below:

Create the app:

```bash
$ sassg new foo
```

Create sass app:

```bash
$ sassg new foo --sass
```

---



Install dependencies:

```bash
$ npm install
```

---



### Compile your styles:

```bash
$ npm start
```

```bash
$ grunt watch
```

### Generate component:

```bash
$ sassg g foo
```

---



### Command Line Options

This generator can also be further configured with the following command line flags.

    -h, --help          output usage information
        --version       output the version number
        new [value]     create new sass/scss project
    -s, --sass          use sass stylesheet (defaults to scss)
    -u, --unit          specify units (px|em|rem) (defaults to px)
    g,  generate        generate component
    -f, --force         force on non-empty directory

### License

[MIT](LICENSE)

