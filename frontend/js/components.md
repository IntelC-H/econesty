# Components

Components is a soon-to-be library of React decorators for common things like 
forms, layout, and async content.

## Modules

### Components

Exports each other module as `Components.<module name here>`.

Components.money(value, currency) => component that creates a `<span>` with properly formatted values and currencies.
Components.rewritePath(regex, v) => replace the part of the URL path that matches `regex` with `v`.