# Econesty

Econesty is a SPA (single-page app), and as such, the frontend is completely decoupled from the backend. This manifests like this:

  - Django & DRF for the backend REST API & for serving the frontend.
  - ReactJS (Preact) using JSX and ES6 for the frontend, using webpack to translate modern syntax into browser-friendly JavaScript.

## TODO

[ ] Build frontend for production better

[ ] Document functionality better

## Preparing PostgreSQL

Ensure you have PostgreSQL running, and that there's a database called
`econesty`, owned by a user `econesty`. Ensure the user `econesty` can create
tables in the database `econesty`.

## Building the Backend

Make sure you have a copy of `python` 3.* installed in your system using your package manager. You can probably use the version of python preinstalled by your operating system.

`<Optional>`

Then, make sure you have `virtualenv` and `virtualenvwrapper` installed into that `python`'s `site-packages`. Make sure your bash environment is [configured](http://virtualenvwrapper.readthedocs.io/en/latest/install.html) for `virtualenvwrapper` (*n.b. it's recommended to [lazy load](https://arongriffis.com/2012/04/24/dynamic-virtualenvwrapper) virtualenvwrapper*).

Create a virtualenv somewhere outside the app. I use virtualenvwrapper. (If you're lazy and don't care about your site-packages, you don't really need to do this):

    mkvirtualenv econesty
    workon econesty
    
`</Optional>`

Then, enter the root directory of this project and install the dependencies:

    pip install -r requirements.txt

Now run the migrations:

    python manage.py makemigrations api
    python manage.py migrate
    
Finally, you can run the dev server:

    python manage.py runserver
    
You can browse the API by navigating to [here](http://localhost:8000/api) - It's a lot easier than cURL or POSTman.

## Building the Frontend

For this part, you need `npm` in your `$PATH`. Install it using your package manager.

Now, we build the frontend:

    npm run build

Or if you're like me:

    export PATH="node_modules/.bin:$PATH" # this goes in bash config
    webpack -p

This takes all the JSX, ES6, and whatnot and turns it into plain JavaScript and CSS to be served through a special Django view (it works in production!). The results of this build are NOT considered source code, as they are the results of quasi-compilation. **Do not check them into source control**, although they should already be in the `.gitignore`.

Navigate to [here](http://localhost:8000/) to open the app.
