// Area of Interest
var admin = ee.FeatureCollection('FAO/GAUL/2015/level2');
var filter = ee.Filter.inList('ADM2_NAME',['Kota Tangerang']);
var area = admin.filter(filter);
var aoi = area;

var image1 = ee.Image('LANDSAT/LC08/C01/T1/LC08_122064_20131012'); // 2013-10-12
var image2 = ee.Image('LANDSAT/LC08/C01/T1/LC08_122064_20210730'); // 2021-07-30

// Palette
var NDVI_Palette = ['white', 'green'];
var NDBI_Palette = ['white', 'red'];
var BUI_Palette = ['white', 'gold'];
var LST_Palette = ['green', 'yellow', 'red'];
var UHI_Palette = ['green', 'yellow', 'red'];

var images = {
  'NDVI 2013': getNDVI2013(),
  'NDVI 2021': getNDVI2021(),
  'NDBI 2013': getNDBI2013(),
  'NDBI 2021': getNDBI2021(),
  'BUI 2013': getBUI2013(),
  'BUI 2021': getBUI2021(),
  'LST 2013': getLST2013(),
  'LST 2021': getLST2021(),
  'UHI 2013': getUHI2013(),
  'UHI 2021': getUHI2021(),
};

// Function Image
function getNDVI2013() {
  var ndvi1 = image1.expression("(b5 - b4) / (b5 + b4)", {
    b5 : image1.select("B5"),
    b4 : image1.select("B4")
  }).rename("ndvi1").clip(aoi);
  
  return ndvi1.visualize({min: -1, max: 1, palette: NDVI_Palette});
}

function getNDVI2021() {
  var ndvi2 = image2.expression("(b5 - b4) / (b5 + b4)", {
    b5 : image2.select("B5"),
    b4 : image2.select("B4")
  }).rename("ndvi2").clip(aoi);
  
  return ndvi2.visualize({min: -1, max: 1, palette: NDVI_Palette});
}

function getNDBI2013() {
  var ndbi1 = image1.expression("(b6 - b5) / (b6 + b5)", {
    b6 : image1.select("B6"),
    b5 : image1.select("B5")
  }).rename("ndbi1").clip(aoi);
  
  return ndbi1.visualize({min: -1, max: 1, palette: NDBI_Palette});
}

function getNDBI2021() {
  var ndbi2 = image2.expression("(b6 - b5) / (b6 + b5)", {
    b6 : image2.select("B6"),
    b5 : image2.select("B5")
  }).rename("ndbi2").clip(aoi);
  
  return ndbi2.visualize({min: -1, max: 1, palette: NDBI_Palette});
}

function getBUI2013() {
  var bui1 = image1.expression("((b6 - b5) / (b6 + b5)) - ((b5 - b4) / (b5 + b4))", {
    b6 : image1.select("B6"),
    b5 : image1.select("B5"),
    b4 : image1.select("B4")
  }).rename("bui1").clip(aoi);
  
  return bui1.visualize({min: -1, max: 1, palette: BUI_Palette});
}

function getBUI2021() {
  var bui2 = image2.expression("((b6 - b5) / (b6 + b5)) - ((b5 - b4) / (b5 + b4))", {
    b6 : image2.select("B6"),
    b5 : image2.select("B5"),
    b4 : image2.select("B4")
  }).rename("bui2").clip(aoi);
  
  return bui2.visualize({min: -1, max: 1, palette: BUI_Palette});
}

function getLST2013() {
  var maskL8 = function(image) {
    var qa = image.select('BQA');
    var mask = qa.bitwiseAnd(1 << 4).eq(0);
    return image.updateMask(mask);
  }
  
  var dataset1 = ee.ImageCollection("LANDSAT/LC08/C01/T1")
    .filterDate('2013-01-01', '2013-12-31')
    .filterBounds(aoi)
    .map(maskL8)
    .select ("B10");

  var first = dataset1.first();

  var K1 = first.get('K1_CONSTANT_BAND_10');
  var K2 = first.get('K2_CONSTANT_BAND_10');
  var A = first.get('RADIANCE_ADD_BAND_10');
  var M = first.get('RADIANCE_MULT_BAND_10');

  var lst1 = dataset1.map(function(img){
    var id= img.id();
    return img.expression ('((1321.08/(log(774.89/((TIR*0.0003342)+0.1)+1)))-272.15)',{'TIR':img})
    .rename('B10')
    .copyProperties (img, ['system:time_start'])
  });

  var lst1mean = lst1.mean().clip(aoi);
  
  return lst1mean.visualize({min: 15, max: 35, palette: LST_Palette});
}


function getLST2021() {
  var maskL8 = function(image) {
    var qa = image.select('BQA');
    var mask = qa.bitwiseAnd(1 << 4).eq(0);
    return image.updateMask(mask);
  }
  
  var dataset2 = ee.ImageCollection("LANDSAT/LC08/C01/T1")
    .filterDate('2021-01-01', '2021-12-31')
    .filterBounds(aoi)
    .map(maskL8)
    .select ("B10");

  var first = dataset2.first();

  var K1 = first.get('K1_CONSTANT_BAND_10');
  var K2 = first.get('K2_CONSTANT_BAND_10');
  var A = first.get('RADIANCE_ADD_BAND_10');
  var M = first.get('RADIANCE_MULT_BAND_10');

  var lst2 = dataset2.map(function(img){
    var id= img.id();
    return img.expression ('((1321.08/(log(774.89/((TIR*0.0003342)+0.1)+1)))-272.15)',{'TIR':img})
    .rename('B10')
    .copyProperties (img, ['system:time_start'])
  });

  var lst2mean = lst2.mean().clip(aoi);
  
  return lst2mean.visualize({min: 15, max: 35, palette: LST_Palette});
}

function getUHI2013() {
  var maskL8 = function(image) {
    var qa = image.select('BQA');
    var mask = qa.bitwiseAnd(1 << 4).eq(0);
    return image.updateMask(mask);
  }
  
  var dataset1 = ee.ImageCollection("LANDSAT/LC08/C01/T1")
    .filterDate('2013-01-01', '2013-12-31')
    .filterBounds(aoi)
    .map(maskL8)
    .select ("B10");

  var first = dataset1.first();

  var K1 = first.get('K1_CONSTANT_BAND_10');
  var K2 = first.get('K2_CONSTANT_BAND_10');
  var A = first.get('RADIANCE_ADD_BAND_10');
  var M = first.get('RADIANCE_MULT_BAND_10');

  var lst1 = dataset1.map(function(img){
    var id= img.id();
    return img.expression ('((1321.08/(log(774.89/((TIR*0.0003342)+0.1)+1)))-272.15)',{'TIR':img})
    .rename('B10')
    .copyProperties (img, ['system:time_start'])
  });

  var lst1mean = lst1.mean().clip(aoi);
  
  var lst1_mean = ee.Number(lst1mean.reduceRegion({
    reducer: ee.Reducer.mean(),
    scale: 30,
    geometry: aoi,
    maxPixels: 1e9
  }).values().get(0));

  var lst1_min = ee.Number(lst1mean.reduceRegion({
    reducer: ee.Reducer.min(),
    scale: 30,
    geometry: aoi,
    maxPixels: 1e9
  }).values().get(0));

  var lst1_max = ee.Number(lst1mean.reduceRegion({
    reducer: ee.Reducer.max(),
    scale: 30,
    geometry: aoi,
    maxPixels: 1e9
  }).values().get(0));

  var lst1_stdev = ee.Number(lst1mean.reduceRegion({
    reducer: ee.Reducer.stdDev(),
    scale: 30,
    geometry: aoi,
    maxPixels: 1e9
  }).values().get(0));

  var alpha = lst1_stdev.multiply(0.5);
  var miu = lst1_mean.add(alpha);
  var UHI1 = lst1mean.select('B10').subtract(miu);
  
  return UHI1.clip(aoi).visualize({min: -10, max: 10, palette: UHI_Palette});
}

function getUHI2021() {
  var maskL8 = function(image) {
    var qa = image.select('BQA');
    var mask = qa.bitwiseAnd(1 << 4).eq(0);
    return image.updateMask(mask);
  }
  
  var dataset2 = ee.ImageCollection("LANDSAT/LC08/C01/T1")
    .filterDate('2021-01-01', '2021-12-31')
    .filterBounds(aoi)
    .map(maskL8)
    .select ("B10");

  var first = dataset2.first();

  var K1 = first.get('K1_CONSTANT_BAND_10');
  var K2 = first.get('K2_CONSTANT_BAND_10');
  var A = first.get('RADIANCE_ADD_BAND_10');
  var M = first.get('RADIANCE_MULT_BAND_10');

  var lst2 = dataset2.map(function(img){
    var id= img.id();
    return img.expression ('((1321.08/(log(774.89/((TIR*0.0003342)+0.1)+1)))-272.15)',{'TIR':img})
    .rename('B10')
    .copyProperties (img, ['system:time_start'])
  });

  var lst2mean = lst2.mean().clip(aoi);
  
  var lst2_mean = ee.Number(lst2mean.reduceRegion({
    reducer: ee.Reducer.mean(),
    scale: 30,
    geometry: aoi,
    maxPixels: 1e9
  }).values().get(0));

  var lst2_min = ee.Number(lst2mean.reduceRegion({
    reducer: ee.Reducer.min(),
    scale: 30,
    geometry: aoi,
    maxPixels: 1e9
  }).values().get(0));

  var lst2_max = ee.Number(lst2mean.reduceRegion({
    reducer: ee.Reducer.max(),
    scale: 30,
    geometry: aoi,
    maxPixels: 1e9
  }).values().get(0));

  var lst2_stdev = ee.Number(lst2mean.reduceRegion({
    reducer: ee.Reducer.stdDev(),
    scale: 30,
    geometry: aoi,
    maxPixels: 1e9
  }).values().get(0));
  
  var alpha = lst2_stdev.multiply(0.5);
  var miu = lst2_mean.add(alpha);
  var UHI2 = lst2mean.select('B10').subtract(miu);
  
  return UHI2.clip(aoi).visualize({min: -10, max: 10, palette: UHI_Palette});
}

/*
 * Set up the maps and control widgets
 */

// Create the left map, and have it display layer 0.
var leftMap = ui.Map();
leftMap.setControlVisibility(false);
var leftSelector = addLayerSelector(leftMap, 0, 'top-left');

// Create the right map, and have it display layer 1.
var rightMap = ui.Map();
rightMap.setControlVisibility(false);
var rightSelector = addLayerSelector(rightMap, 1, 'top-right');

// Adds a layer selection widget to the given map, to allow users to change
// which image is displayed in the associated map.
function addLayerSelector(mapToChange, defaultValue, position) {
  var label = ui.Label('Choose an image to visualize');

  // This function changes the given map to show the selected image.
  function updateMap(selection) {
    mapToChange.layers().set(0, ui.Map.Layer(images[selection]));
  }

  // Configure a selection dropdown to allow the user to choose between images,
  // and set the map to update when a user makes a selection.
  var select = ui.Select({items: Object.keys(images), onChange: updateMap});
  select.setValue(Object.keys(images)[defaultValue], true);

  var controlPanel =
      ui.Panel({widgets: [label, select], style: {position: position}});

  mapToChange.add(controlPanel);
}

/*
 * Tie everything together
 */

// Create a SplitPanel to hold the adjacent, linked maps.
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  wipe: true,
  style: {stretch: 'both'}
});

// Set the SplitPanel as the only thing in the UI root.
ui.root.widgets().reset([splitPanel]);
var linker = ui.Map.Linker([leftMap, rightMap]);
leftMap.setCenter(106.6472, -6.1795, 12);
