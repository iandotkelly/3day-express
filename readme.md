# Readme for 3-Day

This is a REST API server for a prototype mobile social media application, written
in node.js 0.10 and utilizing a mongodb database and a grid-fs based file-store.

Major modules used include:

* express
* mongoose
* gridfs
* passport.js
* busboy
* grunt

Extensive unit and integration tests are written in:

* mocha
* should.js
* superagent

The beginnings of a web client, intended to be written in AngularJs can be found but
this is entirely unfinished work.  The API however is fully functional.

An updated application, providing the same API, but written in koa is found:

https://github.com/iandotkelly/3day-koa


## Version History

0.0.2 - Add new json bodies to some responses
      - Fix issue with 500 returned from updating to a duplicate user

0.0.1 - Fix issue with www-authenticate header in custom 401 Unauthorized response from user update

0.0.0 - First development release for Jeff
