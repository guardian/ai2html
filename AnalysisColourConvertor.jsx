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
var abLength = artboards.length;
var mode = 0;
var convertedArtboardsTotal = 0;
guardianNeutralsLookup = {};
var neutralThreshold = 13;
// var skippedColors = [];

var guardianNeutralsMap = [];

// analysis colours
guardianNeutralsMap.push( { analysis: "#a19a99", standard: "#a1a1a1" } );
guardianNeutralsMap.push( { analysis: "#bab2b1", standard: "#bababa" } );
guardianNeutralsMap.push( { analysis: "#dcd3d1", standard: "#dcdcdc" } );
guardianNeutralsMap.push( { analysis: "#f3e8e7", standard: "#f3f3f3" } );
guardianNeutralsMap.push( { analysis: "#fff4f2", standard: "#ffffff" } );


for (var i = 0; i < guardianNeutralsMap.length; i++) {
  var standardColRGB = hexToRgb(guardianNeutralsMap[i].standard);
  var analysisColRGB = hexToRgb(guardianNeutralsMap[i].analysis); 
  var key = String(analysisColRGB.r);
  guardianNeutralsLookup[key] = { standardHex: guardianNeutralsMap[i].standard, analysisHex: guardianNeutralsMap[i].analysis, standardRGB: standardColRGB, analysisRGB: analysisColRGB };
}


// Main Window
var dialog = new Window('dialog', "Analysis Colour Convertor");
dialog.orientation = 'column';
dialog.alignChildren = ['fill', 'center'];

// Input fields
var abGroup = dialog.add('group');
abGroup.orientation = 'column';
abGroup.alignChildren = ['fill', 'top'];
abGroup.add('statictext', undefined, "Artboard conversion mode");
var modeList = abGroup.add('dropdownlist', [0, 0, 280, 30], ["Standard to Analysis", "Analysis to Standard"]);
modeList.selection = 0;

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


cancel.onClick = dialog.close;

ok.onClick = okClick;

dialog.center();
dialog.show();

function okClick() {
dialog.close();
convert();
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

function convert() {

  //alert("Mode=" + mode + " Y offset=" + spacing + " Invert white text=" + invertWhiteText);

    selection = null;
    unlockLayers(doc.layers);
    saveItemsState(doc.layers, '%isLocked', '%isHidden');

for (i = 0; i < abLength; i++) {
    
    doc.artboards.setActiveArtboardIndex(i);

     // Copy Artwork
     doc.selectObjectsOnActiveArtboard();
     var abItems = selection;

     convertArtboard(i, abItems);

     convertedArtboardsTotal++;
}

restoreItemsState(doc.layers, '%isLocked', '%isHidden');
selection = null;

showCompletionAlert();

function showCompletionAlert() {
  var rule = "\n================\n";
  var alertText = "", alertHed;

  if (mode == 1) {
    fromToString = "Analysis to Standard";
  } else {
    fromToString = "Standard to Analysis";
  }

  alertHed = "The script has converted " + convertedArtboardsTotal + " artboards from " + fromToString;
 
  // alertText = "\n";
  // alertText += skippedColors.length + " neutral colours skipped:\n";
  // for (var i = 0; i < skippedColors.length; i++) {
  //   alertText += skippedColors[i];
  //   if (i != skippedColors.length-1) {
  //     alertText += ", ";
  //   }
  // }
  //alertText  = makeList(errors, "Error", "Errors");
  //alertText += makeList(warnings, "Warning", "Warnings");
  //alertText += makeList(feedback, "Information", "Information");
  //alertText += "\n";
   
  alert(alertHed + alertText);
    
  }

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
function convertArtboard(i, items) {
    //var thisAb = doc.artboards[i];

    convertColours(items);
  
  }
  

  // Cycle through items and tweak colours

  function convertColours(collection) {

    var arr = [];
    for (var i = 0, ii, len = collection.length; i < len; i++) {

      if(collection[i].typename == "GroupItem") {
        collection[i].pageItems = convertColours(collection[i].pageItems);
      }
      if(collection[i].typename == "TextFrame") {   
        changeCharacterColors(collection[i]);
      }
      if(collection[i].typename == "PathItem") {    
        changePathColors(collection[i]);
      }
      if(collection[i].typename == "CompoundPathItem" && collection[i].pathItems.length) { 
        for (ii = 0; ii < collection[i].pathItems.length; ii ++)  { 
          changePathColors(collection[i].pathItems[ii]);
        }
      }
    }
    //return collection;

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
         c.fillColor = convertTextColor(c.fillColor);
         
        }
      } catch(error) {
        //alert(error);
      }
      }
    }
  }
  return textObject
  }

  function changePathColors(pathObject) {
    try {
    //if (pathObject.stroked) {
      pathObject.strokeColor = convertPathColor(pathObject.strokeColor);
    //}

    //if (pathObject.filled) {
      pathObject.fillColor = convertPathColor(pathObject.fillColor);
    //}
  } catch(error) {
    //alert(error);
  }
  }

  function getConvertedColor(r, g, b, isText) {

    var originalCol = {r:r, g:g, b:b }, newCol = originalCol;
    
    if (mode == 0) {
      newCol = guardianNeutralsLookup[String(r)].analysisRGB;
     
    if (newCol === undefined) {
      newCol = originalCol;
      //skippedColors.push(rgbToHex(r, g, b)); 
    }
  } else if (mode == 1) {
    newCol = guardianNeutralsLookup[String(r)].standardRGB;
    if (newCol === undefined) {
      newCol = originalCol;
      //skippedColors.push(rgbToHex(r, g, b)); 
    }
  }

  return newCol;

}

function convertTextColor(col) {
  if (col.typename == 'RGBColor') {
    r = col.red;
    g = col.green;
    b = col.blue;

    // white text set to remain white - this should probably be made optional

    if (isApproxMatch(r, g) && isApproxMatch(g, b)) { // looks like a neutral

      var newColor = getConvertedColor(r, g, b, true) // invert value

      col.red = newColor.r;
      col.green = newColor.g;
      col.blue = newColor.b;
    }
  }
  return col;
}

function convertPathColor(col) {

  if (col.typename == 'RGBColor') {
    r = col.red;
    g = col.green;
    b = col.blue;

    if (isApproxMatch(r, g) && isApproxMatch(g, b)) { // looks like a neutral

      var newColor = getConvertedColor(r, g, b, false) // invert value
      col.red = newColor.r;
      col.green = newColor.g;
      col.blue = newColor.b;
    }
  }
  return col;
}

function isApproxMatch(n1, n2) {
  if (Math.abs(n1-n2) <= neutralThreshold) {
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

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}


