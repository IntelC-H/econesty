# Econesty

Econesty is a SPA (single-page app), and as such, the frontend is completely decoupled from the backend. This manifests like this:

  - Django & DRF for the backend REST API & for serving JavaScript
  - ReactJS using JSX and ES6 for the frontend, using webpack to translate modern syntax into browser-friendly JavaScript.

## Building the Backend

Make sure you have a copy of `python` 3.* installed in your system using your package manager. You can use the version of python preinstalled by your operating system.

Then, make sure you have `virtualenv` and `virtualenvwrapper` installed into that `python`'s `site-packages`. Make sure your bash environment is configured for virtualenvwrapper.

Create a virtualenv somewhere outside the app. I use virtualenvwrapper. (If you're lazy and don't care about your site-packages, you don't really need to do this):

    mkvirtualenv econesty
    workon econesty

Then, enter the root directory of this project and install the dependencies:

    pip install -r requirements.txt

Now run the migrations:

    python manage.py makemigrations
    python manage.py migrate

## Building the Frontend

For this part, you need `npm`. Just install it using your package manager.

Now, we build the frontend:

    npm run build

This takes all the JSX, ES6, and whatnot and turns it into plain JavaScript and CSS to be served through Django's staticfiles. The results of this build are NOT considered source code, as they are the results of quasi-compilation. **Do not check them into source control**, although they should already be in the `.gitignore`.

Finally, you can run the dev server:

    python manage.py runserver