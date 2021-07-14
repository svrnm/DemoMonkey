# DemoMonkey - Usage

**DemoMonkey allows you to turn your software demo in a fully tailored demo for your prospect in minutes:
You simply provide text & visual replacements for your application's UI and DemoMonkey turns your generic demo
into a personalized experience for your audience.**

**Curious how this works? Read on to learn how you can use DemoMonkey, to tamper your web application to demo almost anything.**

- [Configurations](#configurations)
- [Options](#options)
  - [Include and Exclude sites](#include-and-exclude-sites)
  - [Namespaces](#namespaces)
  - [Block- and Allowlist tags](#block--and-allowlist-tags)
  - [Text Attributes](#text-attributes)
  - [Deprecate configuration](#deprecate-configuration)
  - [Tags](#tags)
  - [Authors and more](#authors-and-more)
- [Variables](#variables)
  - [Global Variables](#global-variables)
- [Imports: Reuse existing configurations](#imports-reuse-existing-configurations)
- [Snippets](#snippets)
- [Generic Commands](#generic-commands)
  - [Run regular expressions](#run-regular-expressions)
  - [Replace with filters](#replace-with-filters)
  - [Replace Attribute](#replace-attribute)
  - [Protect text from replacements](#protect-text-from-replacements)
  - [Hide Elements](#hide-elements)
  - [Replace Images](#replace-images)
  - [Recolor images](#recolor-images)
  - [Block, Delay, Redirect URLs](#block-delay-redirect-urls)
  - [Conditional Replacements](#conditional-replacements)
  - [Modify CSS](#modify-css)
  - [Overwrite HTML](#overwrite-html)
  - [Replace based on CSS selector](#replace-based-on-css-selector)
  - [Add Javascript](#add-javascript)
  - [Replace Neighbor](#replace-neighbor)
  - [Insert before and after a DOM element](#insert-before-and-after-a-dom-element)
  - [Replace and patch response of AJAX requests](#replace-and-patch-response-of-ajax-requests)
  - [Demo Stages](#demo-stages)
- [Commands in Namespaces](#commands-in-namespaces)
  - [AppDynamics](#appdynamics)
    - [Replace Flowmap Icons](#replace-flowmap-icons)
    - [Hide Applications, Databases, BTs](#hide-applications-databases-bts)
    - [Replace Flowmap Connections](#replace-flowmap-connections)
- [Learn More](#learn-more)

## Configurations

DemoMonkey is driven by configuration files you write in the integrated editor. You provide lists of search and replace
patterns, that will be applied once DemoMonkey is running. The structure of the file is similar to an **ini** file:

```ini
search = replace
```

Like ini files the format provides sections and comments to structure your document:

```ini
; Replace all the cities and countries in our webapp
[Cities]
San Francisco = Berlin
Paris = Rome
[Countries]
USA = Germany
France = Italy
```

Additionally you can use options, commands, imports and variables to achieve even more:

```ini
; The configuration only works if the url matches the following regex:
@include[] = /^https?://.*demo.*\.myapp\.com(:[0-9]+)?/.*$/
; You can use $customer in replacements as variable
$customer = My Customer//Set The customer className
; Import another configuration called "Cities"
+Cities
; Replace Order with Flight case insensitive
!/Order/i = Flight
```

Note, that **include** or **exclude** is an option that is required for every configuration you create.

Below you will find a list of available options and commands.

## Options

Options allow you to change the behavior of DemoMonkey. Since you might have multiple options of the same
name it's good practice to write them in array notation:

```ini
@include = ... ; not an array, can be overwritten
@include[] = ... ; an array, will be appended
```

### Include and Exclude sites

As mentioned before you have to provide either an **@include** or **@exclude** for your configuration to work.
This protects you from having a monkey on every website:

```ini
; The configuration only works on sites that include demomonkey
@include[] = /demomonkey/
; The configuration does not work on demomonkey.net
@exclude[] = /demomonkey.net/ 
```

If your configuration is a template or snippet (see below), you can disable the warning that an **@include** or **@exclude**
is required:

```ini
@template
; the following configuration is not used standalone but reused from within others
...
...
```

### Namespaces

Some commands (see below) are grouped into a namespace. You can _import_ a namespace, so you can use it's commands
outside the namespace:

```ini
@namespace[] = appdynamics
; without the line above you would have to write !appdynamics.hideApplication(test) below
!hideApplication(test)
```

### Block- and Allowlist tags

By default DemoMonkey is applied on all tags within the document except `script` and `style`. You can change this by
providing allow- and blocklists:

```ini
@blocklist[] = input
@blocklist[] = textarea
@allowlist[] = script
```

### Text Attributes

In some special cases, you need to replace text elements, that are not captured by the default mechanisms of demo monkey.
One example is the placeholder of an input field. You can define textAttributes,
that will be replaced like any other visible text on the page:

```ini
@textAttributes[] = placeholder,data-label
```

### Deprecate configuration

If a configuration is outdated and should not appear in the list of available configurations in the popup you can mark
it as deprecated:

```ini
@deprecated
```

### Tags

You can provide tags in your configuration, to improve DemoMonkey's search:

```ini
@tags[] = my,super,demo
```

### Authors and more

You can use options to provide further information about your configuration, like adding yourself as the author:

```ini
@author[] = Demo Monkey <demomonkey@demomonkey.net>
```

## Variables

To improve the reusability of your demo configurations you can add variables:

```ini
$customer=Example Inc
$prospect=severin.neumann
$domain=example.com
; Use curly braces when using the variables to avoid confusion where the variable name ends.
api.demoapp.com = api.${domain}
john.doe@demoapp=${prospect}@${domain}
```

You can quickly update the values of the variables before meeting with another prospect.

There is also a `Variables` tab in your demo configuration, where you can update the value. Here you also have a full
text editor, so if you need to provide some more complex values, a good approach is defining a variable and setting the
value in the background.

### Global Variables

If you go to `Settings > Global Variables` you can provide variables that are useable in all your configurations.
Here you also can provide colors via a picker and images via upload which will be base64 encoded for you.

## Imports: Reuse existing configurations

Like variables imports make your configurations reusable. Introduced by a plus sign (`+`) you can load one configuration
into another one. For example, if you have a list of Cities defined in a configuration called `CitiesTemplate`,
you can simply import it:

```ini
+CitiesTemplate
```

As a good practice have a list of reusable templates like `CitiesTemplate` and mark them as such with the `@template`
option, so they will not appear in the list of configurations in the popup:

```ini
@template
San Francisco = Berlin
Honolulu = Oslo
Seattle = Amsterdam
Cupertino = Paris
New York = Moscow
Bangalore = Sydney
London = Cairo
New England = Beijing
Cleveland = Tokyo
Palo Alto = Vienna
Redwood City = Sao Paulo
Mountain View = Dubai
```

Note, that also variables are imported. So if you have a variable $customersHeadquarter in your `CitiesTemplate`
configuration, you can overwrite this value in the importing configuration.

## Snippets

By default, you have an optional feature enabled that is called `Autocomplete`. This also allows you to use snippets.
By typing `%` you get a list of all your configurations. Select or type the name of one of them and DemoMonkey will copy
the content of the other configuration into the one in front of you.

A @template marker in your configuration will be removed when you load the snippet into a configuration.
Also, you can introduce snippet variables and you can use `<tab>` to jump through them:

```ini
@template
ECommerce = ${1}
Inventory = ${2:default}
```

Do not make use of variables in your snippet templates since the underlying editor will assume that those are snippet
variables and remove them
before copying the content.

## Generic Commands

Beyond simple text replacements you can use commands to achieve more complex things, like using regular expressions,
replace images or URLs.

### Run regular expressions

Out of the box all patterns you define are simple word-by-word replacements. If you want to apply regular expressions,
you can introduce them via a command:

```ini
!/e?-?commerce/i = Business Intelligence
```

There is a special modifier `p` that will try to preserve the letter case of your replacement. For example,
if you want to replace ORDER and Order with Transfer and TRANSFER you can use the following:

```ini
!/Order/pi = Transfer
```

### Replace with filters

You can call the _simple_ search and replace command explicitly using `!replace`. You can then provide additional
parameters, to filter by location and by CSS and you can specific the DOM attribute of the parent node which will be
replaced instead of the text:

```ini
!replace(DemoMonkey, /usage.html, h1 > a.external-link, title) = TestMonkey
```

### Replace Attribute

The `!replaceAttribute` command is just an alias for `!replace(search, locationFilter, cssFilter, attribute)` with
attribute as the second parameter. This is useful if you don't need a location or css filter.

For example, if you have a link `<a href="http://www.demomonkey.net">DemoMonkey</a>` and you want to replace the href
attribute you can do the following:

```ini
!replaceAttribute(DemoMonkey, href) = https://www.appdynamics.com
```

### Protect text from replacements

Sometimes you want to make sure that certain text is protected from replacements, e.g. links in the navigation or text
on a button. You can use `!protect` to make sure that those are not replaced:

```ini
!protect(DemoMonkey)
; the following replacement will not be applied on every instance of "DemoMonkey"
Demo = Test
```

Note, that the order of patterns in a configuration is important. So it is best practice to put all instances of
`!protect` at the top of your demo configuration.

### Hide Elements

If you want to hide elements in your web applications UI you can use the `!hide` command to not only make the text
invisible but also a given number of parent elements in the DOM.

For example, if you have a row in a table (`<tr class="row-price"><td>Price</td><td>500 Euro</td></tr>`) you can use
the following to hide the whole row:

```ini
!hide(Price, 2, row-price, /cartpage.html)
```

### Replace Images

The `src` attribute of an image can be changed with the `!replaceImage` command:

```ini
!replaceImage(http://your.app/path/to/your/logo.png) = http://your.other.server/image.png
```

If the image you want to provide is given as [data-url](https://en.wikipedia.org/wiki/Data_URI_scheme), you can use `*`
as wildcards in the search pattern and only
provide a part of the base64 string:

```ini
!replaceImage(*RFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJ*) = http://your.other.server/image.png
```

Another option is using global variables. Go to `Settings > Global Variables` and upload an image and give it a name:

```ini
!replaceImage("${imageVariable}") = http://your.other.server/image.png
```

### Recolor images

To put a layer with a specific color above an image you can use `!recolorImage`:

```ini
!recolorImage(http://your.app/path/to/your/logo.png) = rgb(255,0,0)
```

For the replacement you can either use RGB, a color hex code (without `#`) or a
[CSS color](https://www.w3.org/wiki/CSS/Properties/color/keywords) like `midnightblue`

### Block, Delay, Redirect URLs

You can hook into web requests with DemoMonkey, so that you can either replace the target url, block the request or
introduce some delay before the request is completed.
Since this set of commands requires higher privileges from your browser, you need to enable DemoMonkey explicitly to
hook into your web requests: Go to `Settings > Optional Features` and turn on the **Hook into Web Requests**.
With this enabled, you can use the following commands:

```ini
!blockUrl(http://www.demomonkey.net/)
!delayUrl(http://api.demomonkey.net/v1/*) = 5
!redirectUrl(https://www.example.com/checkout) = https://www.example.com/error
```

Note, that to make those commands work you also need to have an `@include` option to match and no `@exclude` option
to block them:

```ini
@include[] = /demomonkey/
@exclude[] = /api/
; the following will be executed
!blockUrl(http://www.demomonkey.net/)
; the following will not be executed
!blockUrl(http://api.demomonkey.net/)
```

If you want to hook only into certain types of requests, you can provide a type as second parameter:

```ini
!blockUrl(http://api.demomonkey.net/, xmlhttprequest)
```

The available types are:

- `*`
- `main_frame`
- `sub_frame`
- `stylesheet`
- `script`
- `image`
- `font`
- `object`
- `xmlhttprequest`
- `ping`
- `csp_report`
- `media`
- `websocket`
- `other`

### Conditional Replacements

Some but not all commands of demo monkey allow you to restrict application of the command based on CSS selectors or URL
location. The `if` command is a generic
approach to this:

```ini
!if(home.html, h1.title, DemoMonkey) = Example
```

This will replace `DemoMonkey` with `Example` only if the URL contains `home.html` and if the css of the parent node
matches the given selector `h1.title`.

If you only want to replace by location or by css selector you can skip one of the parameters or use shorthand commands:

```ini
!if(home.html,,!replaceImage(*/logo.png)) = https://my-server/other-logo.png
!ifLocation(home.html,!replaceImage(*/logo.png)) = https://my-server/other-logo.png

!if(,h1.title,!replace(DemoMonkey)) = Example
!ifSelector(h1.title,!replace(DemoMonkey)) = Example
```

### Modify CSS

If you'd like to change a style attribute of an element you can use the !style command.

```ini
; change the font color of every occurrence of DemoMonkey to red.
!style(DemoMonkey, color) = red
```

### Overwrite HTML

`!overwriteHTML` allows you to select an element and completely change it's inner HTML:

```ini
$html=<head>503 - Internal Server Error</head><body>503 - Internal Server Error</body>
!overwriteHTML('checkout.html', '') = $html
```

The second parameter allows you to provide a CSS selector and only replace the selected part of the website.

There is shortcut command called `!overwritePage` which will **not** replace the `<body>` but put a full screen
`<iframe>` on top of it containing a target URL:

```ini
!overwritePage('checkout.html', '') = https://svrnm.github.io/error-pages/whoops-no-message/
```

It's a good practice to use a variable for the replacement, because in the `Variables` tab of your configuration you can
use a HTML editor for input.

### Replace based on CSS selector

Sometimes a simple replacement can not do the job, especially when the word you'd like to replace is short or common.
One way to get there is using `!querySelector`:

```ini
!querySelector(#cart > .items-count) = 15
```

This will replace the number of items in the cart without you needing to replace every occurrence of `15` or without you
needing to make sure that the number of items is fixed.

Additionally you can add an attribute that should be replaced:

```ini
!querySelector(#cart > .items-count, style.background) = red
```

### Add Javascript

If you need to add a small piece of JavaScript into a website, you can do this with DemoMonkey:

```ini
!addScript() = console.log('hello')
```

For more complex scripts it is a good practice to put them into a variable:

```ini
!addScript() = ${myScript}
```

With that you can use the `Variables` tab to edit the content of the script.

As an alternative you can provide attributes in the list of the parameters, including a `src`:

```ini
!addScript(id\=myscriptid, src\=https://myserver/script.js)
```

Note that you need to escape the `=` in the parameters. Also, be aware that there might be a
[Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) that does not allow you
to inject scripts this way.

DemoMonkey is not a perfect match for more complex use cases. There are multiple chrome extensions that do a better job,
if needed.

### Replace Neighbor

The command `!replaceNeighbor` allows you to search for labels _close by_ and replace them. This is especially useful
to change numbers, which might not be unique or static. You can use this command like the following:

```ini
!replaceNeighbor(Cart Items, 3, .items-count) = 15
```

Read this command like the following: Search for an element with text "Cart Items", go up 3 elements in the DOM tree,
search for a sibling with selector ".items-count" and replace the text of it with "15"

### Insert before and after a DOM element

To add content before or after a DOM element you can use `!insertBefore` and `!insertAfter`:

```ini
!insertBefore(DemoMonkey, 2, index.html) = $beforeHtml
!insertAfter(DemoMonkey, 2, index.html) = $afterHtml
```

### Replace and patch response of AJAX requests

To hook into AJAX calls and to manipulate their response, you first need to go to `Settings > Optional Features`
and turn on `Hook into Ajax`. Now you can replace a response or you can apply a [JSON patch](http://jsonpatch.com/) on them:

```ini
; replace the whole response with the given replacement
!replaceAjaxResponse(/v1/items) = '[{"name": "Demo"}, {"name": "Monkey"}]'
; apply a search and replace on the response, 
; here every occurrence of "Example" is replaced with "DemoMonkey"
!replaceAjaxResponse(/v1/items, Example) = DemoMonkey
; apply a json patch on the given response
!patchAjaxResponse(/v1/items) = [{"op": "replace", "path": "/0/name", "value": "DemoMonkey"}]
```

Use this feature with care, since this will patch native javascript functionality to intercept API calls.

### Demo Stages

If you have a set of common demo flows you use regularly, DemoMonkey can help you to understand how long it takes
you to go from one step (or stage) of your flow to another. Provide "stages" by providing parts of the URL or parts
of the page title:

```ini
!stage(homepage.html, Homepage) = Demo Start
!stage(WIZARD_STEP_1) = Demo - Step1
!stage(,Overview) = Demo - Last Step
```

While going through your demo, DemoMonkey will measure the time it takes you to go from one stage to another
and log that information into the `Logs` you can access from the main dashboard navigation.

## Commands in Namespaces

DemoMonkey has `namespaces` that hold commands that are specific to a certain web application.
As of now the only namespace that exists is `appdynamics`. Since DemoMonkey is open source, you
can easily [contribute your own](https://github.com/svrnm/DemoMonkey/blob/main/CONTRIBUTE.md)

### AppDynamics

The following set of commands is specific to the [AppDynamics](https://www.appdynamics.com/) controller UI.
All commands require a `appdynamics` prefix or you can include the namespace anywhere in your configuration:

```ini
@namespace[] = appdynamics
```

#### Replace Flowmap Icons

You can replace icons on the flowmap with `!replaceFlowmapIcon`:

```ini
!replaceFlowmapIcon(api.mainsupplier.com) = SAP
!replaceFlowmapIcon(ECommerce-Service) = PHP
```

DemoMonkey will provide you with a list of tier and backend types you can use for replacement via autocompletion.

#### Hide Applications, Databases, BTs

Besides the generic `!hide` command there are multiple specific commands to hide elements in the AppDynamics controller UI:

```ini
!hideApplication(E-Commerce)
!hideBusinessTransaction(/checkout)
!hideDatabase(E-Commerce Database)
!hideBrowserApplication(eCommerce Browser)
!hideDashboard(AD-*)
!hideMobileApplication(Ecommerce iOS)
!hideBusinessJourney(Loan Approval)
!hideAnalyticsSearch(AD-*)
```

#### Replace Flowmap Connections

To change the state of a connection on the flowmap to critical or warning, use the following command:

```ini
!replaceFlowmapConnection(ECommerce-Services, Inventory-Services) = warning
```

Note, that the order of the elements is important. The first attribute is the exit node, the second node is the
downstream entry node.

If you'd like to forece a connection to being set to a certain value, even if no baseline is set, you can set a `force` parameter:

```ini
!replaceFlowmapConnection(ECommerce-Services, Inventory-Services, 1) = warning
```

To set a different protocol or to make the connection async, add the keywords to the replacement:

```ini
!replaceFlowmapConnection(ECommerce-Services, Inventory-Services, 1) = warning,async,http
```

Finally, you can also hide flowmap connections, either by using the keyword `hide` in your replacement or
by using a special command:

```ini
!hideFlowmapConnection(ECommerce-Services, Inventory-Services)
```

## Learn More

The documentation might not include all commands and all options you have with DemoMonkey.

If you want to learn more about DemoMonkey, the quickest way is, to [get in touch](mailto:severin.neumann@altmuelnet.de)
