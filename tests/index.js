var mongoosePaginate = require('../index');
var mongoose         = require('mongoose');

var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect         = require('chai').expect;

chai.use(chaiAsPromised);

const MONGO_URI = 'mongodb://127.0.0.1/mongoose_paginate_test';

var ClassSchema = new mongoose.Schema({ name: String });
var Class       = mongoose.model('Class', ClassSchema);

var StudentSchema = new mongoose.Schema({
    name:  String,
    birthdate:   Date,
    class: {
      type: mongoose.Schema.ObjectId,
      ref:  'Class'
    }
});

StudentSchema.plugin(mongoosePaginate);
var Student = mongoose.model('Student', StudentSchema);
describe('mongoose-will-paginate', function() {
    before(function(done) {
      mongoose.connect(MONGO_URI, done);
    });

    before(function(done) {
      mongoose.connection.db.dropDatabase(done);
    });

    before(function() {
      var student, students = [];
      var birthdate = new Date();

      return Class.create({ name: '1A' }).then(function(class_obj) {
          for (var i = 1; i <= 50; i++) {
            student = new Student({
              name:  'Student #' + i,
              birthdate:   new Date(birthdate.getTime() + i),
              class: class_obj._id
            });
            students.push(student);
          }

          return Student.create(students);
      });
    });

    it('returns promise', function() {
        var promise = Student.paginate();
        expect(promise.then).to.be.an.instanceof(Function);
    });

    it('calls callback', function(done) {
        Student.paginate({}, {}, function(err, result) {
            expect(err).to.be.null;
            expect(result).to.be.an.instanceOf(Object);

            done();
        });
    });

    describe('paginates', function() {
        it('with criteria', function() {
            return Student.paginate({ name: 'Student #10' }).then(function(result) {
                expect(result.docs).to.have.length(1);
                expect(result.docs[0].name).to.equal('Student #10');
            });
        });

        it('with default options (page=1, limit=10, lean=false)', function() {
            return Student.paginate().then(function(result) {
                expect(result.docs).to.have.length(10);
                expect(result.docs[0]).to.be.an.instanceof(mongoose.Document);
                expect(result.total).to.equal(50);
                expect(result.limit).to.equal(10);
                expect(result.page).to.equal(1);
                expect(result.pages).to.equal(5);
                expect(result.offset).to.equal(0);
            });
        });

        it('with custom default options', function() {
            mongoosePaginate.paginate.options = {
                limit: 20,
                lean:  true
            };

            return Student.paginate().then(function(result) {
                expect(result.docs).to.have.length(20);
                expect(result.limit).to.equal(20);
                expect(result.docs[0]).to.not.be.an.instanceof(mongoose.Document);

                delete mongoosePaginate.paginate.options;
            })
        });

        it('with offset and limit', function() {
            return Student.paginate({}, { offset: 30, limit: 20 }).then(function(result) {
                expect(result.docs).to.have.length(20);
                expect(result.total).to.equal(50);
                expect(result.limit).to.equal(20);
                expect(result.offset).to.equal(30);
                expect(result).to.not.have.property('page');
                expect(result).to.not.have.property('pages');
            });
        });

        it('with page and limit', function() {
            return Student.paginate({}, { page: 1, limit: 20 }).then(function(result) {
                expect(result.docs).to.have.length(20);
                expect(result.total).to.equal(50);
                expect(result.limit).to.equal(20);
                expect(result.page).to.equal(1);
                expect(result.pages).to.equal(3);
                expect(result).to.not.have.property('offset');
            });
        });

        it('with zero limit', function() {
            return Student.paginate({}, { page: 1, limit: 0 }).then(function(result) {
                expect(result.docs).to.have.length(0);
                expect(result.total).to.equal(50);
                expect(result.limit).to.equal(0);
                expect(result.page).to.equal(1);
                expect(result.pages).to.equal(Infinity);
            });
        });

        it('with select', function() {
            return Student.paginate({}, { select: 'name' }).then(function(result) {
                expect(result.docs[0].name).to.exist;
                expect(result.docs[0].birthdate).to.not.exist;
            });
        });

        it('with sort', function() {
            return Student.paginate({}, { sort: { birthdate: -1 } }).then(function(result) {
                expect(result.docs[0].name).to.equal('Student #50');
            });
        });

        it('with populate', function() {
            return Student.paginate({}, { populate: 'class' }).then(function(result) {
                expect(result.docs[0].class.name).to.equal('1A');
            });
        });

        describe('with lean', function() {
            it('with default leanWithId=true', function() {
                return Student.paginate({}, { lean: true }).then(function(result) {
                    expect(result.docs[0]).to.not.be.an.instanceof(mongoose.Document);
                    expect(result.docs[0].id).to.equal(String(result.docs[0]._id));
                });
            });

            it('with leanWithId=false', function() {
                return Student.paginate({}, { lean: true, leanWithId: false }).then(function(result) {
                    expect(result.docs[0]).to.not.be.an.instanceof(mongoose.Document);
                    expect(result.docs[0]).to.not.have.property('id');
                });
            });
        });
    });

    after(function(done) {
        mongoose.connection.db.dropDatabase(done);
    });

    after(function(done) {
        mongoose.disconnect(done);
    });
});
