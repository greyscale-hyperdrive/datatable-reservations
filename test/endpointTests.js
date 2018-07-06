const chai = require('chai');
const chaiHTTP = require('chai-http');
const server = require('../server');
const dataGenerator = require('../database/dataGenerator');

chai.use(chaiHTTP);

let testData = {
  userObj: undefined,
  restaurantObj: undefined,
  reservationObj: undefined
};

describe('CRUD Endpoints for Datatable', () => {

  before((done) => {

    let userArray = dataGenerator.createFakeUserArray();
    testData.userObj = dataGenerator.zipColumnsAndArrayIntoObject(dataGenerator.user_columns, userArray);

    var userPromise = new Promise((resolve, reject) => {
      chai.request(server)
        .post('/users')
        .send(testData.userObj)
        .end((err, res) => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object'); 
          res.body.should.have.property('message'); 
          res.body.message.should.be.a('string'); 
          res.body.message.should.equal('Success.');
          res.body.should.have.property('data')
          res.body.data.should.be.a('object');
          res.body.data.should.have.property('id');
          res.body.data.id.should.be.a('number');
          // We're good to go, store the newly created user's id 
          // in our testData.userObj for use by later tests
          // (reservations requires both a user_id and a restaurant_id foreign key)
          testData.userObj.id = res.body.data.id;
          resolve();
        });
      }
    );

    let restaurantArray = dataGenerator.createFakeRestaurantArray();
    testData.restaurantObj = dataGenerator.zipColumnsAndArrayIntoObject(dataGenerator.restaurant_columns, restaurantArray);

    var restaurantPromise = new Promise((resolve, reject) => {
      chai.request(server)
        .post('/restaurants')
        .send(testData.restaurantObj)
        .end((err, res) => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object'); 
          res.body.should.have.property('message'); 
          res.body.message.should.be.a('string'); 
          res.body.message.should.equal('Success.');
          res.body.should.have.property('data')
          res.body.data.should.be.a('object');
          res.body.data.should.have.property('id');
          res.body.data.id.should.be.a('number');
          // We're good to go, store the newly created restaurant's id 
          // in our testData.userObj for use by later tests
          // (reservations requires both a user_id and a restaurant_id foreign key)
          testData.restaurantObj.id = res.body.data.id;
          resolve();
        });
      }
    );

    Promise.all([userPromise, restaurantPromise])
      .then(() => {
        let reservationArray = dataGenerator.createFakeReservationArray();
        // dataGenerator.createFakeReservationArray() creates fake user_id and restaurant_id values by default
        // override those here with the id's that we've previously collected
        testData.reservationObj = dataGenerator.zipColumnsAndArrayIntoObject(dataGenerator.reservation_columns, reservationArray);
        testData.reservationObj.user_id = testData.userObj.id;
        testData.reservationObj.restaurant_id = testData.restaurantObj.id;

        chai.request(server)
          .post('/reservations')
          .send(testData.reservationObj)
          .end((err, res) => {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object'); 
            res.body.should.have.property('message'); 
            res.body.message.should.be.a('string'); 
            res.body.message.should.equal('Success.');
            res.body.should.have.property('data')
            res.body.data.should.be.a('object');
            res.body.data.should.have.property('id');
            res.body.data.id.should.be.a('number');
            // We're good to go, store the newly created user's id 
            // in our testData.userObj for use by later tests
            // (reservations requires a user_id foreign key)
            testData.reservationObj.id = res.body.data.id;
            done();
          });
      });
  });

  it('should retrieve restaurant information at /restaurants/:restaurant_id', (done) => {
    chai.request(server)
      .get(`/restaurants/${testData.restaurantObj.id}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object'); 
        res.body.should.have.property('id');
        res.body.id.should.be.a('number');
        res.body.id.should.equal(testData.restaurantObj.id);
        res.body.should.have.property('restaurant_name'); 
        res.body.restaurant_name.should.be.a('string'); 
        res.body.restaurant_name.should.equal(testData.restaurantObj.restaurant_name);
        done();
      });
  });

  it('should retrieve reservation information at /restaurants/:restaurant_id/reservations/:reservation_id', (done) => {
    chai.request(server)
      .get(`/restaurants/${testData.restaurantObj.id}/reservations/${testData.reservationObj.id}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object'); 
        res.body.should.have.property('id');
        res.body.id.should.be.a('number');
        res.body.id.should.equal(testData.reservationObj.id);
        res.body.should.have.property('restaurant_id');
        res.body.restaurant_id.should.be.a('number');
        res.body.restaurant_id.should.equal(testData.reservationObj.restaurant_id);
        res.body.should.have.property('user_id');
        res.body.user_id.should.be.a('number');
        res.body.user_id.should.equal(testData.reservationObj.user_id);
        done();
      });
  });

});

