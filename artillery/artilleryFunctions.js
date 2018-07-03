'use strict';

const Faker = require('faker');

function generateRandomUserId(context, events, done) {
	const userId = Faker.random.number({min: 1, max: 50000});
	context.vars.userId = userId;
	return done();
}

module.exports = {
	generateRandomUserId
};

