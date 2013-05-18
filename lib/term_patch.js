function TermPatch(buffer) {
	this._buffer = buffer;
  // We need to check if this is a valid buffer
}
module.exports = TermPatch;

TermPatch.prototype.apply = function(diff) {
  this._applySize(diff);
  this._applyCursor(diff);
  this._applyScrollRegion(diff);
  this._applyLeds(diff);
  this._applyChanges(diff);
  this._applyTabs(diff);
  this._applySavedCursor(diff);
};

TermPatch.prototype._applySize = function(diff) {
  if (diff.size) {
    this._buffer.height = diff.size[0].to.height;
    this._buffer.width = diff.size[0].to.width;
  }
};

TermPatch.prototype._applyCursor = function(diff) {
  if (diff.cursor) {
    this._buffer.cursor.x = diff.cursor[0].to.x;
    this._buffer.cursor.y = diff.cursor[0].to.y;
  }
};

TermPatch.prototype._applyScrollRegion = function(diff) {
  if (diff.scrollregion) {
    this._buffer.setScrollRegion(diff.scrollregion[0].to[0] , diff.scrollregion[0].to[1]);
  }
};

TermPatch.prototype._applyLeds = function(diff) {
  if (diff.leds) {
    for (l in diff.leds[0]) {
      this._buffer.setLed(l,diff.leds[0][+l]);
    }
  }
};

TermPatch.prototype._applyTabs = function(diff) {
  if (diff.tabs) {
    //TODO
  }
};

TermPatch.prototype._applySavedCursor = function(diff) {
  if (diff.savedcursor) {
    //TODO
  }
};

TermPatch.prototype._applyChanges = function(diff) {
  if (diff.changes) {
    //TODO
  }
};

TermPatch.prototype._applyModes = function(diff) {
  if (diff.modes) {
    //TODO
  }
};
