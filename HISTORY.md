# History

## Financial Times

The `polyfill-library` and the `polyfill.io` service were originally created within the Financial Times.  
The combination of Internet Explorer lagging behind,  
a wide range of new and polyfillable features  
and the rise of a JavaScript first mindset made this a very successful project.

## Sale of `polyfill.io`

Around 2022 the Financial Times lost interest and the active maintainers inside the company were leaving or already left.  
The Financial Times (together with Fastly) eventually decided to hand control over to Jake Champion,  
one of the core maintainers who was leaving the Financial Times to go work for Fastly.

Mr. Henry was initially approached to take over but no meetings actually took place.  
We've been told this was blocked by Fastly who did not consider Mr. Henry to be a safe option.

Early 2024 the `polyfill.io` domain and service were sold by Jake Champion to Funnull, a Chinese company.  
Other maintainers were not aware that a sale was being considered and this caught everyone by surprise.

We immediately moved to secure the git history of the `polyfill-library`  
and created a hard fork based on a state we could prove was unaltered.

Shortly after we rolled out an `npm` release  
and started clearing the dependency tree of packages that were in any way controlled by Jake Champion.

Mid 2024 reports surfaced that the `polyfill.io` service was injecting malware into polyfill bundles.  
The wider internet community moved to shut down the service.

## Going forwards

Mr. Henry is a web and design agency and the current steward of the `polyfill-library`.
We value long term support and strongly believe that everyone should have access to the web.

We had been contributing to the `polyfill-library` for several years while it was still maintained by the Financial Times.

Continuing the `polyfill-library` project is a good fit for us  
and helps us make sites that work for everyone, even users on older browser versions.

Things we will try to do:
- keep up with maintenance and security issues
- keep the test framework running
- welcome contributions
- welcome new members

Things we will never do:
- monetize this project or create a service around it that could be monetized or sold
- add any form of tracking or metrics
- delete this project
