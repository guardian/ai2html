/*
  Description: Script for generating dark mode artboards for Guardian graphics
  Requirements: Adobe Illustrator CC and later
  Date: March, 2022
  Author: The Guardian, Garry Blight
  Based on Duplicate_Artboards_Light.jsx for Adobe Illustrator
  Description: Script for copying the selected Artboard with his artwork
  Requirements: Adobe Illustrator CS6 and later
  Date: October, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru
*/


var i, artboardOriginal, artboardOriginalRect, artboardCopy, artboardCopyRect, abHeight;
var doc = app.activeDocument;
var artboards = doc.artboards;
var spacing = 300;
var suffix = "_dark-mode";
var abLength = artboards.length;
var mode = 0;
var invertWhiteText = false;
var opacityBoost = 1.6;
var darkModeBaseVal = 26; // #1A1A1A rgb(26, 26, 26) dark mode background
var skippedColors = [];
var darkArtboardsTotal = 0;
var neutralThreshold = 13; //was 6 // The maximum variation in r, g and b values that comprises a neutral (This figure may need to be adjusted upwards)

var guardianNeutralsMap = [];

guardianNeutralsMap.push( { light: "#ffffff", dark: "#1a1a1a" } ); // White to dark mode background colour
// guardianNeutralsMap.push( { light: "#f6f6f6", dark: "#333333" } );
// guardianNeutralsMap.push( { light: "#efefef", dark: "#565656" } ); // 565656 NOT GUARDIAN COLOUR BUT NEEDS THIS DARKER TONE!!!!!
// guardianNeutralsMap.push( { light: "#eaeaea", dark: "#565656" } ); // 565656 NOT GUARDIAN COLOUR BUT NEEDS THIS DARKER TONE!!!!!
// guardianNeutralsMap.push( { light: "#dcdcdc", dark: "#767676" } );
// guardianNeutralsMap.push( { light: "#dadada", dark: "#767676" } );
// guardianNeutralsMap.push( { light: "#b3b3b4", dark: "#767676" } );
// guardianNeutralsMap.push( { light: "#999999", dark: "#999999" } );
// guardianNeutralsMap.push( { light: "#929297", dark: "#999999" } );
// guardianNeutralsMap.push( { light: "#767676", dark: "#dcdcdc" } );
// guardianNeutralsMap.push( { light: "#676767", dark: "#dcdcdc" } );
// guardianNeutralsMap.push( { light: "#333333", dark: "#eaeaea" } );
// guardianNeutralsMap.push( { light: "#1d1d1b", dark: "#f6f6f6" } ); // Dark text/objects currently not made pure white
// guardianNeutralsMap.push( { light: "#1a1a1a", dark: "#f6f6f6" } ); // Dark text/objects currently not made pure white
// guardianNeutralsMap.push( { light: "#121212", dark: "#f6f6f6" } ); // Dark text/objects currently not made pure white
// guardianNeutralsMap.push( { light: "#000000", dark: "#ffffff" } );

guardianNeutralsMap.push( { light: "#f3f3f3", dark: "#383838" } );
guardianNeutralsMap.push( { light: "#dcdcdc", dark: "#494949" } );
guardianNeutralsMap.push( { light: "#bababa", dark: "#707070" } );
guardianNeutralsMap.push( { light: "#a1a1a1", dark: "#a1a1a1" } );
guardianNeutralsMap.push( { light: "#707070", dark: "#c8c8c8" } );
guardianNeutralsMap.push( { light: "#333333", dark: "#c8c8c8" } );
guardianNeutralsMap.push( { light: "#121212", dark: "#dcdcdc" } );
guardianNeutralsMap.push( { light: "#1a1a1a", dark: "#dcdcdc" } );
guardianNeutralsMap.push( { light: "#000000", dark: "#ffffff" } );

// analysis colours
guardianNeutralsMap.push( { light: "#a19a99", dark: "#a1a1a1" } );
guardianNeutralsMap.push( { light: "#bab2b1", dark: "#707070" } );
guardianNeutralsMap.push( { light: "#dcd3d1", dark: "#494949" } );
guardianNeutralsMap.push( { light: "#f3e8e7", dark: "#383838" } );
guardianNeutralsMap.push( { light: "#fff4f2", dark: "#1a1a1a" } ); // Analysis pink to dark mode background colour


var guardianNeutralsInversion = {};

for (var i = 0; i < guardianNeutralsMap.length; i++) {
  var lightColRGB = hexToRgb(guardianNeutralsMap[i].light);
  var darkColRGB = hexToRgb(guardianNeutralsMap[i].dark); 
  var key = String(lightColRGB.r);
  guardianNeutralsInversion[key] = { hex: guardianNeutralsMap[i].dark, rgb: darkColRGB };
}

var nearestGuardianNeutralArray = []; // used for finding nearest guardian neutral for non-Guardian neutrals

for (var key in guardianNeutralsInversion) {
  if (guardianNeutralsInversion.hasOwnProperty(key)) {
      //console.log(key + " -> " + p[key]);
      nearestGuardianNeutralArray.push(+key);
      //guardianNeutralsArray.push( { hex: key, rgb: hexToRgb(key)} ); // Change to this
  }
}

// Main Window
var dialog = new Window('dialog', "Dark mode artboards generator");
dialog.orientation = 'column';
dialog.alignChildren = ['fill', 'center'];

// Input fields
var abGroup = dialog.add('group');
abGroup.orientation = 'column';
abGroup.alignChildren = ['fill', 'top'];
abGroup.add('statictext', undefined, "Artboard inversion mode");
var modeList = abGroup.add('dropdownlist', [0, 0, 280, 30], ["1. Guardian graphics neutrals (Strict)", "2. Guardian graphics neutrals (Nearest)", "3. Invert - lighten darks", "4. Invert - lighten darks +", "5. Invert - lighten darks ++", "6. Invert - lighten darks +++"]);
modeList.selection = 0;

var inputsGroup = dialog.add('group');
      inputsGroup.orientation = 'row';
      inputsGroup.add('statictext', undefined, "Y offset");
  var spacingVal = inputsGroup.add('edittext', [0, 0, 60, 30], spacing);
  inputsGroup.add('statictext', undefined, "Opacity multiplier");
  var opacityVal = inputsGroup.add('edittext', [0, 0, 60, 30], opacityBoost);

  var invertWhiteTextVal = inputsGroup.add('checkbox', undefined, 'Invert white text');
  invertWhiteTextVal.value = false;

  // Buttons
  var btnsGroup = dialog.add('group');
      btnsGroup.orientation = 'row';
      btnsGroup.alignChildren = ['fill', 'center'];
  var cancel = btnsGroup.add('button', undefined, "Cancel", { name: 'cancel' });
  var ok = btnsGroup.add('button', undefined, "OK",  { name: 'ok' });

  // Change listeners
  modeList.onChange = function() {
    mode = modeList.selection.index;
  }

   spacingVal.onChange = function () {
    this.text = convertToNum(this.text, spacing);
    spacing = +this.text;
  }
  opacityVal.onChange = function () {
    this.text = convertToNum(this.text, opacityBoost);
    opacityBoost = +this.text;
  }


cancel.onClick = dialog.close;

ok.onClick = okClick;

dialog.center();
dialog.show();

function okClick() {
invertWhiteText = invertWhiteTextVal.value;
dialog.close();
generate();
}

function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

// Main wrapper function

function generate() {

  //alert("Mode=" + mode + " Y offset=" + spacing + " Invert white text=" + invertWhiteText);

    selection = null;
    unlockLayers(doc.layers);
    saveItemsState(doc.layers, '%isLocked', '%isHidden');

for (i = 0; i < abLength; i++) {
    
    doc.artboards.setActiveArtboardIndex(i);

     // Copy Artwork
     doc.selectObjectsOnActiveArtboard();
     var abItems = selection;

     duplicateArtboard(i, abItems);

     darkArtboardsTotal++;
}

restoreItemsState(doc.layers, '%isLocked', '%isHidden');
selection = null;

showCompletionAlert();

function showCompletionAlert() {
  var rule = "\n================\n";
  var alertText, alertHed;

  alertHed = "Dark Mode Generator has generated " + darkArtboardsTotal + " dark mode artboards!";
 
  alertText = "\n";
  alertText += skippedColors.length + " neutral colours skipped:\n";
  for (var i = 0; i < skippedColors.length; i++) {
    alertText += skippedColors[i];
    if (i != skippedColors.length-1) {
      alertText += ", ";
    }
  }
  //alertText  = makeList(errors, "Error", "Errors");
  //alertText += makeList(warnings, "Warning", "Warnings");
  //alertText += makeList(feedback, "Information", "Information");
  alertText += "\n";
   
  alert(alertHed + alertText);
    
  }


/**
 * Unlock all Layers & Sublayers
 * @param {object} _layers - the collection of layers
 */
 function unlockLayers(_layers) {
    for (var i = 0, len = _layers.length; i < len; i++) {
      if (_layers[i].locked) _layers[i].locked = false;
      if (_layers[i].layers.length) unlockLayers(_layers[i].layers);
    }
  }

/**
 * Collect items
 * @param {object} obj - collection of items
 * @param {array} arr - output array with childrens
 */
 function getItems(obj, arr) {
    for (var i = 0, len = obj.length; i < len; i++) {
      var currItem = obj[i];
      try {
        switch (currItem.typename) {
          case 'GroupItem':
            arr.push(currItem);
            getItems(currItem.pageItems, arr);
            break;
          default:
            arr.push(currItem);
            break;
        }
      } catch (e) {}
    }
  }


  /**
 * Save information about locked & hidden pageItems & layers
 * @param {object} _layers - the collection of layers
 * @param {string} lKey - keyword for locked items
 * @param {string} hKey - keyword for hidden items
 */
function saveItemsState(_layers, lKey, hKey) {
    var allItems = [];
    for (var i = 0, len = _layers.length; i < len; i++) {
      var currLayer = _layers[i];
      if (currLayer.layers.length > 0) {
        saveItemsState(currLayer.layers, lKey, hKey);
      }
      getItems(currLayer.pageItems, allItems);
      for (var j = 0, iLen = allItems.length; j < iLen; j++) {
        var currItem = allItems[j];
        if (currItem.locked) {
          currItem.locked = false;
          currItem.note += lKey;
        }
        if (currItem.hidden) {
          currItem.hidden = false;
          currItem.note += hKey;
        }
      }
    }
    redraw();
  }

  /**
 * Restoring locked & hidden pageItems & layers
 * @param {object} _layers - the collection of layers
 * @param {string} lKey - keyword for locked items
 * @param {string} hKey - keyword for hidden items
 */
function restoreItemsState(_layers, lKey, hKey) {
    var allItems = [],
        regexp = new RegExp(lKey + '|' + hKey, 'gi');
    for (var i = 0, len = _layers.length; i < len; i++) {
      var currLayer = _layers[i];
      if (currLayer.layers.length > 0) {
        restoreItemsState(currLayer.layers, lKey, hKey);
      }
      getItems(currLayer.pageItems, allItems);
      for (var j = 0, iLen = allItems.length; j < iLen; j++) {
        var currItem = allItems[j];
        if (currItem.note.match(lKey) != null) {
          currItem.note = currItem.note.replace(regexp, '');
          currItem.locked = true;
        }
        if (currItem.note.match(hKey) != null) {
          currItem.note = currItem.note.replace(regexp, '');
          currItem.hidden = true;
        }
      }
    }
  }

  /**
 * Duplicate the selected artboard. Based on the idea of @Silly-V
 * @param {number} i - current artboard index
 * @param {object} items - collection of items on the artboard
 * @param {string} suffix - copy name suffix
 * 
 */
function duplicateArtboard(i, items) {
    var thisAb = doc.artboards[i],
        thisAbRect = thisAb.artboardRect,
        
        abHeight = thisAbRect[1] - thisAbRect[3];

    //doc.artboards.setActiveArtboardIndex(i);
  
      var newAb = doc.artboards.add(thisAbRect);

      newAb.artboardRect = [
        thisAbRect[0],
        thisAbRect[1] - spacing - abHeight,
        thisAbRect[2],
        thisAbRect[3] - spacing - abHeight
    ]
  
      newAb.name = thisAb.name + suffix;

      // Create dark mode background rectangle
      //doc.activeLayer = doc.layers[doc.layers.length-1]; // select base layer
      var top=newAb.artboardRect[1];
      var left=newAb.artboardRect[0];
      var width=newAb.artboardRect[2]-newAb.artboardRect[0];
      var height=newAb.artboardRect[1]-newAb.artboardRect[3];
      var rect = doc.pathItems.rectangle (top, left, width, height);
      var backgroundColor = new RGBColor();
      backgroundColor.red = darkModeBaseVal; // #1A1A1A dark mode background
      backgroundColor.green = darkModeBaseVal;
      backgroundColor.blue = darkModeBaseVal;
      rect.fillColor = backgroundColor;
      rect.strokeColor = new NoColor();

      var layer = doc.layers[doc.layers.length-1];
      // rect.move(layer, ElementPlacement.INSIDE );
      rect.move(layer, ElementPlacement.PLACEATEND );
  
    var docCoordSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM,
        abCoordSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM,
        isDocCoords = app.coordinateSystem == docCoordSystem,
        dupArr = getDuplicates(items);
        dupArr = makeDarkMode(dupArr);
  
    // Move copied items to the new artboard
    for (var i = 0, dLen = dupArr.length; i < dLen; i++) {
      var pos = isDocCoords ? dupArr[i].position : doc.convertCoordinate(dupArr[i].position, docCoordSystem, abCoordSystem);
      dupArr[i].position = [pos[0], pos[1] - (abHeight + spacing)];
    }
  }
  
  /**
   * Duplicate all items
   * @param {object} collection - selected items on active artboard
   * @return {array} arr - duplicated items
   */
  function getDuplicates(collection) {
    var arr = [];
    for (var i = 0, len = collection.length; i < len; i++) {
      arr.push(collection[i].duplicate());
    }
    return arr;
  }

  // DARK MODE STUFF


  // Cycle through items and tweak opacities and colours

  function makeDarkMode(collection) {

    var arr = [];
    for (var i = 0, ii, len = collection.length; i < len; i++) {

      if(collection[i].typename == "GroupItem") {
        adjustOpacity(collection[i]);  
        makeDarkMode(collection[i].pageItems);
      }
      if(collection[i].typename == "TextFrame") {   
        changeCharacterColors(collection[i]);
      }
      if(collection[i].typename == "PathItem") {
        adjustOpacity(collection[i]);     
        changePathColors(collection[i]);
      }
      if(collection[i].typename == "CompoundPathItem" && collection[i].pathItems.length) { 
        adjustOpacity(collection[i]);  
        for (ii = 0; ii < collection[i].pathItems.length; ii ++)  {
          adjustOpacity(collection[i]);  
          changePathColors(collection[i].pathItems[ii]);
        }
      }
    }
    return collection;

  }


  function changeCharacterColors(textObject) {

    if(textObject.textRange.length > 0) {

      var textRange = textObject.textRange;
      var paras = textRange.paragraphs;

    for (var iii=0; iii<paras.length; iii++) {
      if (paras != undefined && paras.length != 0) {
        try {
        var p = paras[iii];

        for (var ii=0, n=p.characters.length; ii<n; ii++) {
          var c = p.characters[ii];
         c.fillColor = invertTextColor(c.fillColor);
         
        }
      } catch(error) {
        //alert(error);
      }
      }
    }
  }
  }

  function changePathColors(pathObject) {
    try {
    //if (pathObject.stroked) {
      pathObject.strokeColor = invertPathColor(pathObject.strokeColor);
    //}

    //if (pathObject.filled) {
      pathObject.fillColor = invertPathColor(pathObject.fillColor);
    //}
  } catch(error) {
    //alert(error);
  }
  }

  function getInvertedColor(r, g, b, isText) {

    var originalCol = {r:r, g:g, b:b }, newCol = originalCol;
    
    if (mode == 0) {
      newCol = guardianNeutralsInversion[String(r)].rgb;
    if (newCol === undefined) {
      newCol = originalCol;
      skippedColors.push(rgbToHex(r, g, b)); 
    }
  } else if (mode == 1) {
      newCol = getNearestGuardianNeutralsInversion(r);
    } else if (isText && mode > 1) {
      newCol = {r: 255-r, g: 255-g, b: 255-b }; // change to newVal = {r: 255-r, g: 255-g, b: 255-b };
    } else if (mode > 1) {
      newCol = {r: 255-r, g: 255-g, b: 255-b }; // Straight invert first change to newVal = {r: 255-r, g: 255-g, b: 255-b };
      var multiplier1 = 2.5, multiplier2 = 2.0;
      if (mode == 3) {
        multiplier1 = 3;
        multiplier2 = 2.2;
      }
      if (mode == 4) {
        multiplier1 = 3.5;
        multiplier2 = 2.4;
      }
      if (mode == 5) {
        multiplier1 = 4;
        multiplier2 = 2.6;
      }

      if (newCol.r == 0) { newCol = {r: darkModeBaseVal, g: darkModeBaseVal, b: darkModeBaseVal } } // Is now dark mode background colour (was white) chamge to newVal.r == 0 newVal = {r: darkModeBaseVal, g: darkModeBaseVal, b: darkModeBaseVal }
        else if (newCol.r < 35) { 
          // Make very dark colours lighter
          newCol.r *= multiplier1; newCol.r += darkModeBaseVal;
          newCol.g *= multiplier1; newCol.g += darkModeBaseVal;
          newCol.b *= multiplier1; newCol.b += darkModeBaseVal;
        } else if (newCol.r < 100) {
          // Make semi dark colours lighter by smaller amount
          newCol.r *= multiplier2; newCol.r += darkModeBaseVal;
          newCol.g *= multiplier2; newCol.g += darkModeBaseVal;
          newCol.b *= multiplier2; newCol.b += darkModeBaseVal; };
    }

    return newCol;
    
  }

  function invertTextColor(col) {
    if (col.typename == 'RGBColor') {
      r = col.red;
      g = col.green;
      b = col.blue;

      // white text set to remain white - this should probably be made optional

      if (isApproxMatch(r, g) && isApproxMatch(g, b)) { // looks like a neutral

        var newColor = getInvertedColor(r, g, b, true) // invert value

        if ( r ==255 && !invertWhiteText ) {
          newColor = { r:255, g: 255, b: 255 };
        }
        
        col.red = newColor.r;
        col.green = newColor.g;
        col.blue = newColor.b;
      }
    }
    return col;
  }

  function invertPathColor(col) {

    if (col.typename == 'RGBColor') {
      r = col.red;
      g = col.green;
      b = col.blue;

      if (isApproxMatch(r, g) && isApproxMatch(g, b)) { // looks like a neutral

        var newColor = getInvertedColor(r, g, b, false) // invert value
        col.red = newColor.r;
        col.green = newColor.g;
        col.blue = newColor.b;
      }
    }
    return col;
  }

  function adjustOpacity(item) {

    var newOpacity;

    if (item.opacity && item.opacity != 100) {
      newOpacity = item.opacity * opacityBoost; // boost opacity against dark background as can appear a bit lost
      if (newOpacity > 100) {
        newOpacity = 100;
      }
      item.opacity = newOpacity;
    }

  }
}

function getNearestGuardianNeutralsInversion(val) {
  var nearest = closest(nearestGuardianNeutralArray, val); 
  return guardianNeutralsInversion[String(nearest)].rgb; 
}

function closest(array, num) {
  var i = 0;
  var minDiff = 1000;
  var ans;
  for (i in array) {
    var m = Math.abs(num - array[i]);
    if (m < minDiff) {
      minDiff = m;
      ans = array[i];
    }
  }
  return ans;
}

function isApproxMatch(n1, n2) {
  if (Math.abs(n1-n2) < neutralThreshold) {
    return true;
  } else {
    return false;
  }
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function invertHexColor(hex) {
  if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
  }
  // invert color components
  var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
      g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
      b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}


