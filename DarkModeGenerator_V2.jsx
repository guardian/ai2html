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
var spacingX = 0;
var spacingY = 300;
var suffix = "_dark-mode";
var abLength = artboards.length;
var mode = 0;
var colourMode = 0;
var invertWhiteText = false;
var opacityBoost = 1.6;
var darkModeBaseVal = 26; // #1A1A1A rgb(26, 26, 26) dark mode background
var skippedColors = [];
var darkArtboardsTotal = 0;
var neutralThreshold = 13; //was 6 // The maximum variation in r, g and b values that comprises a neutral (This figure may need to be adjusted upwards)

var guardianNeutralsMap = [];
var guardianColoursMap = [];
var guardianColoursLookup = {};

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


guardianColoursMap.push( { type: "news", light: "#0094DA", dark: "#009CE3" } );
guardianColoursMap.push( { type: "news", light: "#C70000", dark: "#CE0E09" } );
guardianColoursMap.push( { type: "news", light: "#23B4A9", dark: "#35BBB1" } );
guardianColoursMap.push( { type: "news", light: "#A1A1A1", dark: "#A1A1A1" } );
guardianColoursMap.push( { type: "news", light: "#CBA36E", dark: "#CBA36E" } );
guardianColoursMap.push( { type: "news", light: "#F678BB", dark: "#F678BB" } );
guardianColoursMap.push( { type: "news", light: "#FF7F0F", dark: "#FF8B25" } );
guardianColoursMap.push( { type: "news", light: "#005689", dark: "#00669D" } );
guardianColoursMap.push( { type: "news", light: "#8B0000", dark: "#9A0000" } );
guardianColoursMap.push( { type: "news", light: "#0C7A73", dark: "#128981" } );
guardianColoursMap.push( { type: "news", light: "#494949", dark: "#5F5F5F" } );
guardianColoursMap.push( { type: "news", light: "#866D50", dark: "#866D50" } );
guardianColoursMap.push( { type: "news", light: "#9C2274", dark: "#9C2274" } );
guardianColoursMap.push( { type: "news", light: "#C74600", dark: "#C74600" } );
guardianColoursMap.push( { type: "news", light: "#D4EDFF", dark: "#244057" } );
guardianColoursMap.push( { type: "news", light: "#FFDBD4", dark: "#5f2116" } );
guardianColoursMap.push( { type: "news", light: "#D9F2EF", dark: "#254a46" } );
guardianColoursMap.push( { type: "news", light: "#E7E7E7", dark: "#383838" } );
guardianColoursMap.push( { type: "news", light: "#F7EBDC", dark: "#493D30" } );
guardianColoursMap.push( { type: "news", light: "#FFE6F4", dark: "#6b2251" } );
guardianColoursMap.push( { type: "news", light: "#FFE2CD", dark: "#64381a" } );

guardianColoursMap.push( { type: "sentiment", light: "#004E7C", dark: "#004E7C" } );
guardianColoursMap.push( { type: "sentiment", light: "#0077B6", dark: "#0077B6" } );
guardianColoursMap.push( { type: "sentiment", light: "#00B2FF", dark: "#00B2FF" } );
guardianColoursMap.push( { type: "sentiment", light: "#FF5943", dark: "#FF5943" } );
guardianColoursMap.push( { type: "sentiment", light: "#C70000", dark: "#C70000" } );
guardianColoursMap.push( { type: "sentiment", light: "#8B0000", dark: "#8B0000" } );

guardianColoursMap.push( { type: "politics", party: "Lab", light: "#C70000", dark: "#e33824" } );
guardianColoursMap.push( { type: "politics", party: "Con", light: "#0077B6", dark: "#009ae1" } );
guardianColoursMap.push( { type: "politics", party: "Lib_Dem", light: "#FF7F0F", dark: "#FF7F0F" } );
guardianColoursMap.push( { type: "politics", party: "Reform", light: "#3DBBE2", dark: "#3DBBE2" } );
guardianColoursMap.push( { type: "politics", party: "Green", light: "#39A566", dark: "#39A566" } );
guardianColoursMap.push( { type: "politics", party: "SNP", light: "#F5DC00", dark: "#F5DC00" } );
guardianColoursMap.push( { type: "politics", party: "Other", light: "#848484", dark: "#707070" } );

guardianColoursMap.push( { type: "structure", light: "#121212", dark: "#DCDCDC" } );
guardianColoursMap.push( { type: "structure", light: "#707070", dark: "#C8C8C8" } );
guardianColoursMap.push( { type: "structure", light: "#BABABA", dark: "#707070" } );
guardianColoursMap.push( { type: "structure", light: "#DCDCDC", dark: "#494949" } );
guardianColoursMap.push( { type: "structure", light: "#F3F3F3", dark: "#383838" } );

// additional
guardianColoursMap.push( { type: "structure", light: "#FFFFFF", dark: "#1a1a1a" } );







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
var dialog = new Window('dialog', "Dark mode artboards generator V2");
dialog.orientation = 'column';
dialog.alignChildren = ['fill', 'center'];

// Input fields
var abGroup = dialog.add('group');
abGroup.orientation = 'column';
abGroup.alignChildren = ['fill', 'top'];
// abGroup.add('statictext', undefined, "Neutrals/structure conversion mode");
// var modeList = abGroup.add('dropdownlist', [0, 0, 280, 30], ["1. Guardian graphics neutrals (Strict)", "2. Guardian graphics neutrals (Nearest)", "3. Invert - lighten darks", "4. Invert - lighten darks +", "5. Invert - lighten darks ++", "6. Invert - lighten darks +++"]);
// modeList.selection = 0;

abGroup.add('statictext', undefined, "Colour conversion mode");
var colourModeList = abGroup.add('dropdownlist', [0, 0, 280, 30], ["1. Structure (neutrals only)", "2. Categorical: news", "3. Categorical: politics", "4. Categorical: sentiment"]);
colourModeList.selection = 0;

var inputsGroup = dialog.add('group');
      inputsGroup.orientation = 'row';
      inputsGroup.add('statictext', undefined, "X offset");
  var spacingValX = inputsGroup.add('edittext', [0, 0, 60, 30], spacingX);
   inputsGroup.add('statictext', undefined, "Y offset");
  var spacingValY = inputsGroup.add('edittext', [0, 0, 60, 30], spacingY);
  inputsGroup.add('statictext', undefined, "Opacity multiplier");
  var opacityVal = inputsGroup.add('edittext', [0, 0, 60, 30], opacityBoost);

  // var invertWhiteTextVal = inputsGroup.add('checkbox', undefined, 'Invert white text');
  // invertWhiteTextVal.value = false;

  // Buttons
  var btnsGroup = dialog.add('group');
      btnsGroup.orientation = 'row';
      btnsGroup.alignChildren = ['fill', 'center'];
  var cancel = btnsGroup.add('button', undefined, "Cancel", { name: 'cancel' });
  var ok = btnsGroup.add('button', undefined, "OK",  { name: 'ok' });

  // Change listeners
  // modeList.onChange = function() {
  //   mode = modeList.selection.index;
  // }

  colourModeList.onChange = function() {
    colourMode = colourModeList.selection.index;
  }

   spacingValX.onChange = function () {
    this.text = convertToNum(this.text, spacingX);
    spacingX = +this.text;
  }
    spacingValY.onChange = function () {
    this.text = convertToNum(this.text, spacingY);
    spacingY = +this.text;
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
//invertWhiteText = invertWhiteTextVal.value;
dialog.close();
getColours();
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

function getColours() {


  for (var i = 0; i < guardianColoursMap.length; i++) {

    var key = String(guardianColoursMap[i].light).toLowerCase();
    var val = String(guardianColoursMap[i].dark).toLowerCase();

    
    if (guardianColoursMap[i].type == "structure") {
      guardianColoursLookup[key] = val;
    }

    if (colourMode == 1 && guardianColoursMap[i].type == "news") {
      guardianColoursLookup[key] = val;
     
    }

    if (colourMode == 2 && guardianColoursMap[i].type == "politics") {
      guardianColoursLookup[key] = val;
    }

    if (colourMode == 3 && guardianColoursMap[i].type == "sentiment") {
      guardianColoursLookup[key] = val;
    }

  }

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
        abHeight = thisAbRect[1] - thisAbRect[3],
        abWidth = thisAbRect[2] - thisAbRect[0], x1,y1,x2,y2;


    //doc.artboards.setActiveArtboardIndex(i);
  
      var newAb = doc.artboards.add(thisAbRect);

      if (spacingX > 0) {
        x1 = thisAbRect[0] + spacingX + abWidth;
        x2 = thisAbRect[2] + spacingX + abWidth;
      } else {
        x1 = thisAbRect[0];
        x2 = thisAbRect[2];
      }

      if (spacingY > 0) {
        y1 = thisAbRect[1] - spacingY - abHeight;
        y2 = thisAbRect[3] - spacingY - abHeight;
      } else {
        y1 = thisAbRect[1];
        y2 = thisAbRect[3];
      }

       newAb.artboardRect = [
        x1,
        y1,
        x2,
        y2
      ]

    // add detect code for steps

    var additionalSuffix = "", splitNameIndex, forceMinWidth = "", abName = thisAb.name;

    var splitNameArray = thisAb.name.split(" "); // should this be a space or underscore ?

    var lastSplitPart = splitNameArray[splitNameArray.length - 1];

    if (String(lastSplitPart).indexOf(":") > -1) { // It probably has a forced artboard minwidth
      forceMinWidth = ":" + lastSplitPart.split(":")[1];
      abName = abName.replace(new RegExp(forceMinWidth, 'g'), ''); // Remove any existing forced min width from the name as colon will cause issues in ai2html
      splitNameIndex = +lastSplitPart.split(":")[0];
    } else {
      splitNameIndex = +splitNameArray[splitNameArray.length - 1];
    }


    // var splitNameIndex = +splitNameArray[splitNameArray.length - 1];
    if (typeof (splitNameIndex) == 'number' && splitNameIndex < 300) { // assume is a step for stepper type graphic (has to be less than 300 because of mobile artboard naming convention)
      additionalSuffix = " " + splitNameIndex + forceMinWidth;
    }

     
  
      newAb.name = abName + suffix + additionalSuffix;

      // Create dark mode background rectangle
      //doc.activeLayer = doc.layers[doc.layers.length-1]; // select base layer
      var top=newAb.artboardRect[1] + 1;
      var left=newAb.artboardRect[0] - 1;
      var width=newAb.artboardRect[2]-newAb.artboardRect[0] + 2;
      var height=newAb.artboardRect[1]-newAb.artboardRect[3] + 2;
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
        dupArr = makeDarkMode2(dupArr);
  
    // Move copied items to the new artboard
     for (var i = 0, dLen = dupArr.length; i < dLen; i++) {
      var pos = isDocCoords ? dupArr[i].position : doc.convertCoordinate(dupArr[i].position, docCoordSystem, abCoordSystem);

      var yOffset, xOffset;

      if (spacingY > 0) {
         yOffset = abHeight + spacingY;
      } else {
        yOffset = 0;
      }
      if (spacingX > 0) {
         xOffset = abWidth + spacingX;
      } else {
        xOffset = 0;
      }
        dupArr[i].position = [pos[0] + xOffset, pos[1] - yOffset];
      }

      //dupArr[i].position = [pos[0], pos[1] - (abHeight + spacingY)];
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

  function makeDarkMode2(collection) {

    for (var i = 0, ii, len = collection.length; i < len; i++) {

      if(collection[i].typename == "GroupItem") {
        adjustOpacity(collection[i]);  
        makeDarkMode2(collection[i].pageItems);
      }
      if(collection[i].typename == "TextFrame") {   
        changeCharacterColors2(collection[i]);
      }
      if(collection[i].typename == "PathItem") {
        adjustOpacity(collection[i]);     
       changePathColors2(collection[i]);
      }
      if(collection[i].typename == "CompoundPathItem" && collection[i].pathItems.length) { 
        adjustOpacity(collection[i]);  
        for (ii = 0; ii < collection[i].pathItems.length; ii ++)  {
          adjustOpacity(collection[i]);  
          changePathColors2(collection[i].pathItems[ii]);
        }
      }
    }
    return collection;

  }


  function changeCharacterColors2(textObject) {

    if(textObject.textRange.length > 0) {

      var textRange = textObject.textRange;
      var paras = textRange.paragraphs;

    for (var iii=0; iii<paras.length; iii++) {
      if (paras != undefined && paras.length != 0) {
        try {
        var p = paras[iii];

        for (var ii=0, n=p.characters.length; ii<n; ii++) {
          var c = p.characters[ii];
         c.fillColor = invertTextColor2(c.fillColor);
         
        }
      } catch(error) {
        //alert(error);
      }
      }
    }
  }
  }

  function changePathColors2(pathObject) {
    try {
    //if (pathObject.stroked) {
      pathObject.strokeColor = invertPathColor2(pathObject.strokeColor);
    //}

    //if (pathObject.filled) {
      pathObject.fillColor = invertPathColor2(pathObject.fillColor);
    //}
  } catch(error) {
    //alert(error);
  }
  }

  function invertTextColor2(col) {
    if (col.typename == 'RGBColor') {
      r = col.red;
      g = col.green;
      b = col.blue;

      var hexCol = rgbToHex(r, g, b);
      var newCol = guardianColoursLookup[hexCol];

      if (newCol != undefined) {
        var newColRGB = hexToRgb(newCol);
        if (newColRGB != null) {
          col.red = newColRGB.r;
          col.green = newColRGB.g;
          col.blue = newColRGB.b;
        }
      }
    }
    return col;
  }

  function invertPathColor2(col) {

    if (col.typename == 'RGBColor') {
      r = col.red;
      g = col.green;
      b = col.blue;

      var hexCol = rgbToHex(r, g, b);
      //alert("hexCol=" + hexCol);
      var newCol = guardianColoursLookup[hexCol];
      //alert("newCol=" + newCol);

      if (newCol != undefined) {
        var newColRGB = hexToRgb(newCol);
        if (newColRGB != null) {
          col.red = newColRGB.r;
          col.green = newColRGB.g;
          col.blue = newColRGB.b;
        }
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


