# jss-from-postcss

> No black boxes anymore.

> Less magic 👉 Less bugs 👉 More profit! 🚀

Use the best bits of [PostCSS](https://github.com/postcss/postcss) and all plugins ([one](https://github.com/postcss/postcss#plugins), [two](http://postcss.parts/), [three?](https://github.com/axept/jss-from-postcss/edit/master/README.md) 😉) to get it as [JSS styles](https://github.com/cssinjs/jss).

Fast, scoped, Component-friendly and fully customized PostCSS-to-JSS adapter which uses [Tagged Template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals) (a recent addition to JavaScript/ES6).

It close to "Drop-in Replacement" for your SCSS/LESS/CSS Modules/Stylus to use it as JSS  "on-the-fly".

Supports:

+ [React.js for Web](#example)
+ React Native (WIP)
+ [Server-side Rendering (SSR)](#server-side-rendering)
+ Run-time execution
+ [Fast run-time execution by pre-compilation](#precompilation)
+ Theming  (WIP)
+ Linting (WIP)
+ Syntax highlighting (WIP)

## Content

+ [Motivation](#motivation)
+ [Installation](#installation)
+ [Example](#example)
+ [Adapters](#adapters)
+ [Pre-compilation](#pre-compilation)
+ [Inspiration](#inspiration)

## Motivation

This package could help you to migrate from PostCSS and any kind of styles format to JSS up to 5x time faster. Love ❤️ your life. Spend your time on most valuable and important things. 

With this package in a few minutes you can migrate to JSS from anything:

+ [SCSS](https://github.com/postcss/postcss-scss)
+ SASS
+ LESS
+ Stylus
+ SugarSS and so on

Just use your existed styles and write all new styles in JSS. 🎁

Or write styles in your favorite format and work with that like with JSS - access attributes directly, build optimized critical CSS and so on. Yep, it's like [styled-components](https://github.com/styled-components/styled-components) + JSS. See example below.


## Installation

```bash
npm install jss-from-postcss --save
```

## Example

```javascript
import color from 'color'
import fromPostCSS, { keyframes } from 'jss-from-postcss'

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

const styles = fromPostCSS`
  $bg-default: #ccc;
  
  button {
    color: ${() => 'palevioletred'};
    display: block;
    margin: 0.5em 0;
    font-family: Helvetica, Arial, sans-serif;

    &:hover {
      text-decoration: underline;
      animation: ${rotate360} 2s linear infinite;
    }
  }
  
  ctaButton {
    @include button;
    
    &:hover {
      background: ${color('blue').darken(0.3).hex()}
    }
  }
  
  @global {
    body {
      color: $bg-default;
    }
    button {
      color: #888888;
    }
  }
`
```

### Result

The example above makes `styles` as an object which looks like:

```javascript
// ...
const styles = {
  button: {
    color: () => 'palevioletred',
    display: 'block',
    margin: '0.5em 0',
    fontFamily: 'Helvetica, Arial, sans-serif',

    '&:hover' {
      textDecoration: 'underline',
      animation: rotate360 + ' 2s linear infinite',
    }
  },
  
  ctaButton: {
    color: () => 'palevioletred',
    display: 'block',
    margin: '0.5em 0',
    fontFamily: 'Helvetica, Arial, sans-serif',

    '&:hover' {
      textDecoration: 'underline',
      animation: rotate360 + ' 2s linear infinite',
      background: color('blue').darken(0.3).hex(),
    }
  },
  
  '@global': {
    body: {
      color: '#ccc',
    },
    button: {
      color: '#888888',
    },
  }
}
```

### Render with Vanilla JS

```javascript
import jss from 'jss'
import preset from 'jss-preset-default'
import styles from './styles'

// One time setup with default plugins and settings.
jss.setup(preset())

const { classes } = jss.createStyleSheet(styles).attach()

document.body.innerHTML = `
  <div>
    <button class="${classes.button}">Button</button>
    <button class="${classes.ctaButton}">CTA Button</button>
  </div>
`
```

### Render with React.js

```javascript
import jss from 'jss'
import preset from 'jss-preset-default'
import injectSheet from 'react-jss'
import styles from './styles'

// One time setup with default plugins and settings.
jss.setup(preset())

const Buttons = ({ button, ctaButton }) => (
  <div>
    <button className={button}>Button</button>
    <button className={ctaButton}>CTA Button</button>
  </div>
)

export default injectSheet(styles)(Buttons)
```

### Server-Side Rendering

As you well know React.js and JSS both support Server-Side Rendering (SSR).

You can use it with `jss-from-postcss` without any limitations:

```javascript
import express from 'express'
import jss from 'jss'
import preset from 'jss-preset-default'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { SheetsRegistryProvider, SheetsRegistry } from 'react-jss'
// this module is defined in the previous example
import Buttons from './buttons' 

// One time setup with default plugins and settings.
jss.setup(preset())
const app = express()

app.use('/', () => {
  const sheets = new SheetsRegistry()
  const content = renderToString(
    <SheetsRegistryProvider registry={sheets}>
      <Buttons />
    </SheetsRegistryProvider>
  )
  const criticalCSS = sheets.toString()
  res.send(`
    <html>
    <head>
      <style id="critical-css" type="text/css">
      ${criticalCSS}
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `)
})

app.listen(port, process.env['PORT'] || 3000)
```

## Adapters

Under hood [postcss-js](https://github.com/postcss/postcss-js) is using for parsing your styles to make it applicable for JSS.

But you can create a custom adapter to override `prepare` and/or `parse` functions:

+ `prepare(rawStyles: string): string` is using for converting your styles code to a CSS format, like [Middleware](http://redux.js.org/docs/advanced/Middleware.html)

+ `parse(CSS: string): object` is using for converting your CSS format to JSS, PostCSS do it here by default
+ `finalize(result: object): object` is using for post-processing your final object

Feel free to play with it:

```javascript
import fromPostCSS, { createAdapter, keyframes } from 'jss-from-postcss'

const fromMixedCSS = createAdapter({
  prepare: (rawStyles) => {
    const prepared = rawStyles.replace(/^\s*\/\/.*$/gm, '') // remove JS comments
    return fromPostCSS(prepared)
  }
})

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  
  to {
    transform: rotate(360deg);
  }
`

const getStyles = ({ color, animationSpeed, className }) => fromMixedCSS`
  ${'button' + (className ? '.' + className : '')}
    color: ${() => color || 'palevioletred'};
    display: block;
    margin: 0.5em 0;
    font-family: Helvetica, Arial, sans-serif;
    
    // Let's rotate the board!
    &:hover {
      text-decoration: underline;
      animation: ${rotate360} ${animationSpeed || '2s'} linear infinite;
    }
  }
  
  // Special styles for Call-to-Action button
  ctaButton {
    @include button;
    
    &:hover {
      background: ${color('blue').darken(0.3).hex()}
    }
  }
`
```

## Pre-compilation

It's not great idea to parse CSS in run-time on client-side. It's slow and expensive.

Thee good news is that you don't have to do it! 🎉 There is a great [babel-plugin-prejss](https://github.com/axept/babel-plugin-prejss) plugin which transform your PostCSS styles from example above to JSS object in the processed scripts.

[See how it works](https://github.com/lttb/babel-plugin-prejss#how-it-works)

Step-by-Step manual:

1. Add `babel-plugin-prejss` to your project:

   ```bash
   npm install babel-plugin-prejss -D
   ```

2. Configure it by updating `.babelrc` in your project directory:

   ```
   plugins: [
     [
       'prejss', {
         'namespace': 'fromPostCSS'
       }
     ]
   ]
   ```
   
3. Build your project! In your JavaScript bundles you will have replaced `fromPostCSS` constraints by JSS objects directly. Babel do it for you. Not a magic - just a next generation JavaScript today. 😉

## Inspiration

+ https://github.com/styled-components/styled-components
