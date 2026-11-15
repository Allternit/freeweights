// Takedown handling lives in D1 (`takedowns`) and is checked inside each route with isTakenDown
// and the 451 helpers in ../http. The Worker has no takedown endpoint of its own.
export { gone, gonePage } from '../http';
