# Christine Oswald Portfolio - HW5

This repository contains my CSE 134B HW5 portfolio website. The site uses Eleventy as a static site generator and adds JavaScript as a progressive enhancement to the HTML and CSS site created in previous assignments.

## Local Setup

Install the project dependencies:

```bash
npm install
```

Start the Eleventy development server:

```bash
npm run dev
```

Build the production site:

```bash
npm run build
```

The generated site is placed in the `_site` directory.

## Part 1: Progressive Enhancement - Theme Picker

For Part 1, I chose the Theme Picker option.

The website has a light and dark theme using CSS and `prefers-color-scheme`. This is the baseline behavior and does not require JavaScript. If JavaScript is disabled, the website remains usable and follows the user's system color preference.

When JavaScript is available, a theme picker is shown that allows the user to choose between:

- System
- Light
- Dark

The selected theme is stored using `localStorage` so the preference persists between pages and page reloads. The selected light or dark theme is applied by setting a `data-theme` attribute on the root `<html>` element.

Access to `localStorage` is wrapped in `try/catch` blocks so the site continues to function if storage is unavailable.

### Avoiding Incorrect Theme Flash

`theme-init.js` is loaded early in the document. It checks for a previously saved light or dark preference and applies it to the root element before the rest of the page is displayed. This reduces the flash of an incorrect theme during page loading.

The actual theme picker is hidden in the HTML by default. JavaScript reveals it only after the script successfully initializes. This prevents users without JavaScript from seeing a control that does not work.

## Part 2: Dog of the Day Web Component

### Custom Element

```html
<dog-of-the-day>
```

The Dog of the Day component retrieves dog images from the Dog CEO API.

### Supported Attributes

#### `breed`

Controls which breed is requested.

Default:

```text
random
```

Accepted values are `random` or a valid breed supported by the Dog CEO API.

Example:

```html
<dog-of-the-day breed="husky">
    <p>Dog pictures require JavaScript and an internet connection.</p>
</dog-of-the-day>
```

#### `count`

Controls the number of dog images displayed.

Default:

```text
1
```

Accepted values are integers from 1 through 6. Values outside this range are limited to the supported range.

Example:

```html
<dog-of-the-day breed="husky" count="3">
    <p>Dog pictures require JavaScript and an internet connection.</p>
</dog-of-the-day>
```

Both attributes are observed by the custom element. Changing an attribute after the component has loaded causes the component to request and display updated data.

### API Endpoint

The component uses the Dog CEO API.

For random dogs, requests use:

```text
https://dog.ceo/api/breeds/image/random/
```

For a specific breed, requests use the corresponding breed endpoint.

The API is public and does not require an API key, so no secrets are included in the client-side JavaScript.

### Component States

The component visibly handles four states:

- **Idle:** No dog pictures have been loaded yet.
- **Loading:** The component displays a loading message while waiting for the API.
- **Success:** The returned dog images are displayed in a semantic list.
- **Error:** A human-readable error and retry button are displayed.

Requests use `AbortController` so an in-progress request can be canceled when the component disconnects. Requests also have an eight-second timeout so the component does not remain in a loading state indefinitely.

API responses are cached in `sessionStorage` for 30 minutes to avoid repeatedly requesting the same images while navigating or reloading during a session.

### Safe Rendering

Remote API values are not inserted using `innerHTML`.

The component clones an HTML `<template>` and creates or modifies elements using DOM methods such as:

- `createElement()`
- `textContent`
- `setAttribute()`
- `append()`
- `replaceChildren()`

Using `innerHTML` with untrusted remote data could allow malicious markup or scripts contained in that data to be interpreted by the browser. Using DOM methods and `textContent` treats remote strings as data instead of HTML.

### No-JavaScript Fallback

Meaningful fallback content is written directly between the `<dog-of-the-day>` tags.

For example:

```html
<dog-of-the-day breed="random" count="1">
    <p>Dog pictures require JavaScript and an internet connection.</p>
</dog-of-the-day>
```

Therefore, a user still receives an explanation when JavaScript is unavailable.

## Part 3: Static Site Generation

I chose **Eleventy (11ty)** as the static site generator.

The source files are stored in `src/`, and Eleventy generates the production website in `_site/`.

### Templates and Includes

The website uses a base layout to provide the common document structure.

Shared includes are used for repeated parts of the website, including:

- Head and metadata
- Site header and navigation
- Site footer

This removes the need to copy the same document shell, navigation, scripts, and footer into every individual HTML page.

Global information such as the site title, author, navigation items, current year, and social links is stored in the site's global data rather than being duplicated on every page.

Navigation is generated from this data, and the current page receives:

```html
aria-current="page"
```

at build time.

### Data-Driven Projects

Project information is stored separately from the project-page markup.

Eleventy uses the project data to generate multiple individual project pages from a single project template. This avoids maintaining nearly identical HTML files for each project.

### Other Generated Content

Eleventy also generates:

- `404.html`
- `sitemap.xml`

Individual pages provide their own title and description through front matter.

## SSG Reflection

Converting the website to Eleventy removed a significant amount of repeated HTML. Before the conversion, each page contained its own document structure, navigation, theme controls, scripts, and footer. With Eleventy, these shared parts can be written once and reused throughout the site.

The main cost of using an SSG was the additional setup and complexity. I had to reorganize the project, learn how layouts, includes, front matter, and global data work, and introduce a build step that was not necessary when the website consisted of standalone HTML files.

The conversion showed me the value of DRY development as a website becomes larger. A change to the navigation or footer can now be made in one place instead of being copied across every page.

I would probably not use an SSG for an extremely small website with only one page or very little repeated content. In that situation, the additional build system and project structure could introduce more complexity than it removes.

## Deployment

The site is deployed through Netlify.

Netlify builds the website from the source repository using:

```bash
npm run build
```

and publishes the generated `_site` directory.

The `_site` and `node_modules` directories are excluded from the Git repository because they can be regenerated from the committed source and dependencies.