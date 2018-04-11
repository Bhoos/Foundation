# Foundation
A react-native app runner without extra bloat

## Installation
> `$ yarn global add react-native-founddation`

or  
> `$ npm install -g react-native-foundation`

## Creating new project
> `$ foundation init ProjectName`

## Starting packager (metro)
> `$ foundation start`

## Run apps
> `$ foundation run-ios`  
> `$ foundation run-android`

# Why create Foundation
1. react-native is great, but used a lot of space, when working with
   multiple project. And it freaked me out every time a new upgrade
   was released.
2. Expo is great, but is not as flexible as bare bone react-native.
   (And felt quite slow during development).

React-Native projects are (mostly) plain javascript files. So, why bloat
it with lots of node_modules and native code. (That's what I liked about
expo). That's what foundation does. It uses the bare bone react-native
installed globally and then runs the javascript through this globally
installed package, using react and react-native library from the global
library itself using the metro bundler configuration changes.

