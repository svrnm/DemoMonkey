# Contribute

The easiest way to contribute to the development of DemoMonkey, is reporting bugs or requesting new features. Go to
[https://github.com/svrnm/demomonkey/issues](https://github.com/svrnm/demomonkey/issues) and add a ticket for your
request.

The following document explains, how you can setup a development environment, so you can contribute code to DemoMonkey.
It also provides a step by step guide to add custom commands.

## Setup Environment

Before you start, make sure you have _nodejs_, _webpack_ and _mocha_ installed.

To get started, you need to checkout the latest development version via git:

```shell
git clone https://github.com/svrnm/demomonkey.git
cd demomonkey
```

Now, you need to download and install all dependencies for your development environment:

```shell
npm install
```

The DemoMonkey repository includes configurations for eslint, csscomb, jsbeautify and lesshint. Install those tools and
the required plugins for your IDE to have a more convenient development.

When `npm install` is finished you can run `webpack`, which will monitor the directory for code changes and
auto-build updates:

```shell
npm start
```

After a few seconds, the initial build is ready and you can go to [chrome://extensions/](chrome://extensions/) and
load the `build` directory via the **Load unpacked** button as Chrome Extension.

If everything works as expected, you should have the DemoMonkey icon besides your address bar and you are ready to
contribute code to this project!

## Add a custom command

Likely, the first thing you want to do, is adding a custom command to DemoMonkey, that allows you to do more specific
customisations for your demo. In the following you will learn how to build such a custom command step by step.

Let's start with a helloworld example. The goal of this first exercise is creating a command `!helloworld()` that just
replaces _all_ text on the website with `hello world`.

First, create an empty file called `HelloWorld.js` in the folder `src/commands`. Next add the following code:

```javascript
import Command from './Command'

class HelloWorld extends Command {
  apply(target, key) {
    target[key] = 'hello world'
    return false
  }
}

export default HelloWorld
```

To register the command with DemoMonkey, open the file `src/commands/CommandBuilder.js` and import your class at the
top of the file:

```javascript
import HelloWorld from './HelloWorld'
```

Afterward add the following within the method body of `_buildCustomCommand` right before the comment
`// Add new commands above this line.`:

```javascript
if (command === 'helloWorld') {
  return new HelloWorld()
}
```

If `webpack` is still running, it will tell you that it has written some bytes and that it is watching again.
If anything went wrong, you should see some errors!

Go back to [chrome://extensions/](chrome://extensions/) and reload your extension.

**Note:** While developing custom commands, you need to reload your extension and your modified page every time
you change your code! To speed up your development, you can prototype code in the browser console.

Next create a sample configuration using your new command, e.g.:

```ini
@include[] = /^https?://.*example\.com/.*$/
!helloWorld()
```

Visit a page that is matched by your include rule, turn on your demo configuration and see how all text on the page is
replaced with hello world.

You have successfully created your first custom command!

Before you can get started with your own idea, there are a few more things you need to know:

- The current `!helloWorld()` command does not take any parameters.
- If you turn off your demo, your replacements are not reverted.

Let's take those additional requirements down one by one:

First, adding parameters to your command is easy. Just add a constructor to your class:

```javascript
import Command from './Command'

class HelloWorld extends Command {
  constructor(hello, world) {
    super()
    this.hello = hello
    this.world = world
  }

  apply(target, key) {
    target[key] = this.hello + ' ' + this.world
    return false
  }
}

export default HelloWorld
```

And update the `CommandBuilder.js` once again by adding those parameters:

```javascript
if (command === 'helloWorld') {
  return new HelloWorld(parameters[0], value)
}
```

Reload your extension and update your demo configuration to

```ini
@include[] = /^https?://.*example\.com/.*$/
!helloWorld(hallo) = welt
```

Now, reloading your demo page, you should see _hallo welt_ everywhere instead of _hello world_.

If you need further parameters `parameters[1], ..., parameters[n]`, just add them to your constructor and to the
`CommandBuilder.js` as needed.

Second, you can update your class once again to make your command undoable:

```javascript
import Command from './Command'
import UndoElement from './UndoElement'

class HelloWorld extends Command {
  constructor(hello, world) {
    super()
    this.hello = hello
    this.world = world
  }

  apply(target, key) {
    var original = target[key]
    var replacement = this.hello + ' ' + this.world
    if (original !== replacement) {
      target[key] = replacement
      return new UndoElement(target, key, original, replacement)
    }
    return false
  }
}

export default HelloWorld
```

As you can see, DemoMonkey expects you to get an `UndoElement`, that describes how to revert your command.
It takes four parameters: the targeted node, the modified attribute of that node,
the original value and the replaced value.

When you now, reload your extension, you can turn your configuration on and off and the replacements should be
reverted every time you turn it off.
