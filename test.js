
var mongoose = require('mongoose')
var Schema = mongoose.Schema

mongoose.connect('localhost', 'foodb');

var ThingSchema = new Schema({
  things: {
    type: [String],
  }
});

mongoose.model('Thing', ThingSchema)

var Thing = mongoose.model('Thing');

Thing.create({ things: ['foo', 'bar']}, function (err, thing) {
  if (err) throw err
  console.log(thing)

  thing.things.push('baz');

  console.log('thing.things:', thing.things);

  thing.save(function (err, thingy) {
    if (err) throw err;
    console.log('thing.things:', thingy.things);
    mongoose.connection.close();
  });
});
