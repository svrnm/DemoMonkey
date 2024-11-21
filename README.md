# <img src="icons/monkey.png" alt="DemoMonkey Icon" width="28" height=""> DemoMonkey

## About

DemoMonkey allows you to turn your software demo in a fully tailored demo for your prospect in minutes:
You simply provide text & visual replacements for your application's UI and DemoMonkey turns your generic
demo into a personalised experience for your audience.

## Installation

To add the latest version as extension to chrome, use the following link:

<https://chrome.google.com/webstore/detail/demomonkey/jgbhioialphpgjgofopnplfibkeehgjd>

To use a pre-release version, you can also switch to the developer channel:

<https://chrome.google.com/webstore/detail/demomonkey-dev-channel/dgmdcddamkccpmefapgabnafjhhcdhdh>

## Usage

DemoMonkey is driven by **configurations**, that contain replace patterns in the following format:

```ini
eCommerce = Booking Service
Checkout = Book flight
```

This is the most simple format. The configurations are parsed as ini files, so you can use sections and comments for structure:

```ini
[Frontend]
; Change the main domain
shop.example.com = fly.example.org
; cities
San Francisco = Berlin
New York = London
```

Additionally you have commands for complex replacements, variables and imports for improved reusability and options for
changing the behavior of your demo monkey:

```ini
; Commands are introduced by '!'. For example you can use regular expressions:
!/Order/i = Flight

; Variables are introduced by '$', have a default value and a description
$domain = example.com//Set the name of your customer
api.payment.com = payment.$customer

; Imports are introduced by '+'. They allow you to load replacements from other configurations.
; For example you can externalize the replacements for cities and reuse it over and over again.
+GermanCities

; Options are introduced by '@'. You can use them to change the behavior of tampermonkey.
; A common use case is introducing include and exclude rules for domains:
@include =
@exclude =
```

See [USAGE.md](USAGE.md) for a more comprehensive guide.

## Contribute

If you want to contribute to the development of DemoMonkey, you can help by reporting issues, fixing bug or developing
new features.

If you'd like to contribute code, read [CONTRIBUTE.md](CONTRIBUTE.md).

## License

Copyright 2017 AppDynamics LLC

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

## Attribution

The Demo Monkey icon was created by Lora Tomova

## Contact

For any questions you can contact [Severin Neumann](https://github.com/svrnm)
