/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.Camera');

goog.require('goog.dom');

goog.require('weapi.CameraAnimator');



/**
 *
 * @param {Cesium.Camera} camera .
 * @param {Cesium.Ellipsoid} ellipsoid .
 * @constructor
 */
weapi.Camera = function(camera, ellipsoid) {
  this.camera = camera;
  this.ellipsoid = ellipsoid;
  this.animator = new weapi.CameraAnimator(this);
};


/**
 * @return {Array.<number>} [latitude, longitude, altitude].
 */
weapi.Camera.prototype.getPos = function() {
  var carto = new Cesium.Cartographic(0, 0, 0);
  this.ellipsoid.cartesianToCartographic(this.camera.position, carto);

  return [carto.latitude, carto.longitude, carto.height];
};


/**
 * @param {number|undefined} latitude .
 * @param {number|undefined} longitude .
 * @param {number|undefined} altitude .
 */
weapi.Camera.prototype.setPos = function(latitude, longitude, altitude) {
  if (!goog.isDef(latitude) ||
      !goog.isDef(longitude) ||
      !goog.isDef(altitude)) {
    var oldPos = this.getPos();
    latitude = latitude || oldPos[0];
    longitude = longitude || oldPos[1];
    altitude = altitude || oldPos[2];
  }
  var carto = new Cesium.Cartographic(longitude, latitude, altitude);

  this.camera.controller.setPositionCartographic(carto);
};


/**
 * @return {number} Heading in radians.
 */
weapi.Camera.prototype.getHeading = function() {
  var camera = this.camera;

  var normal = new Cesium.Cartesian3(-camera.position.y, camera.position.x, 0);
  // = Cesium.Cartesian3.UNIT_Z.cross(camera.position).normalize();
  var angle = (camera.right.angleBetween(normal.normalize()));

  var orientation = Cesium.Cartesian3.cross(camera.position, camera.up).z;

  return (orientation < 0 ? angle : -angle);
};


/**
 * @return {number} Tilt in radians.
 */
weapi.Camera.prototype.getTilt = function() {
  var camera = this.camera;

  var angle = Math.acos(camera.up.dot(camera.position.normalize()));

  return -angle + Math.PI / 2;
};


/**
 * @param {number} heading .
 */
weapi.Camera.prototype.setHeading = function(heading) {
  var heading_, tilt_ = this.getTilt();

  // repeat correct the heading modification caused by tilting
  //for (var i = 0; i < 1; ++i) {
  heading_ = heading - this.getHeading();
  this.camera.controller.lookDown(tilt_);
  //heading_ = heading - this.getHeading();
  this.camera.controller.twistLeft(heading_);
  this.camera.controller.lookUp(tilt_);
  //}

  /*
  //this.camera.controller.lookAt(this.camera.position,
  //                              Cesium.Cartesian3.ZERO,
  //                              Cesium.Cartesian3.UNIT_Z);

  var rotation;
  var direction = this.camera.direction;
  var up = this.camera.up;
  var right = this.camera.right;

  rotation = Cesium.Matrix3.fromQuaternion(
      Cesium.Quaternion.fromAxisAngle(direction, heading_));
  //Cesium.Matrix3.multiplyByVector(rotation, direction, direction);
  Cesium.Matrix3.multiplyByVector(rotation, up, up);
  Cesium.Matrix3.multiplyByVector(rotation, right, right);

  //this.camera.controller.twistLeft(heading);
  window['console']['log'](this.camera.up);
  //this.camera.controller.lookUp(tilt);

  rotation = Cesium.Matrix3.fromQuaternion(
      Cesium.Quaternion.fromAxisAngle(right, -tilt_));
  Cesium.Matrix3.multiplyByVector(rotation, direction, direction);
  Cesium.Matrix3.multiplyByVector(rotation, up, up);
  //Cesium.Matrix3.multiplyByVector(rotation, right, right);

  window['console']['log'](this.camera.up);*/
};


/**
 * @param {number} tilt .
 */
weapi.Camera.prototype.setTilt = function(tilt) {
  var tilt_ = tilt - this.getTilt();

  var heading_ = this.getHeading();
  this.camera.controller.lookUp(tilt_);
  this.setHeading(heading_); //re-set the heading
};
