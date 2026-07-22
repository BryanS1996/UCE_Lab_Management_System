const CircuitBreaker = require('opossum');
console.log('CircuitBreaker type:', typeof CircuitBreaker);
if (typeof CircuitBreaker === 'function') {
  console.log('Success');
} else {
  console.log('Failed');
}
