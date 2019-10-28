// vim: fdm=marker fmr={,}

// FIXED PATHS
const DATASET_FILE  = "test.csv";
//const IMAGE_DIR     = "/media/daniel/Datasets/ims_julia/medeiros_imgs/";
const IMAGE_DIR     = "imgs/";

// POSITION CONSTANTS
const controls_top_margin    = 0.01;
const controls_percent       = 0.03;
const controls_bottom_margin = 0.01;
const histogram_left_margin  = 0.02;
const histogram_right_margin = 0.02;
const timeline_top_margin    = 0.01;
const timeline_percent       = 0.15;
const timeline_bottom_margin = 0.01;
//
const controls_bottom        = controls_top_margin + controls_percent + controls_bottom_margin;
const timeline_top           = 1 - (timeline_percent + timeline_bottom_margin);
const plotarea_height        = timeline_top - controls_bottom;

const SHOW_FRAMERATE = 'none';
const FRAMERATE      = 60;

// ENUMS
const HISTOGRAM          = 0;
const DISCRETE_HISTOGRAM = 1;
const MAP                = 2;

// COLORS
var RED, GREEN, BLUE, YELLOW, ORANGE, PURPLE, CYAN, MAGENTA, LIME, PINK, TEAL, LAVENDER, BROWN, BEIGE, MAROON, MINT, OLIVE, APRICOT, NAVY, GREY, WHITE, BLACK;

// Disable the Friendly Error System, as recommended by https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance#disable-the-friendly-error-system-fes
p5.disableFriendlyErrors = true;


class Interactable {
    constructor (x, y, w, h, normaldraw, onHover, onMousePressed, onMouseClicked) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.cx = x + 0.5*w;
        this.cy = y + 0.5*h;
        this.normalDraw = normalDraw;
        this.onHover = onHover;
        this.onMousePressed = onMousePressed;
        this.onMouseClicked = onMouseClicked;

        this.mouse_was_pressed = mouseIsPressed;
    }

    isHovering() {
        return this.x <= mouseX && mouseX <= this.x+this.w && this.y <= mouseY && mouseY <= this.y+this.h;
    }

    draw() {
        push();

        if (typeof this.onMousePressed !== 'undefined' && this.isHovering() && mouseIsPressed)
            this.onMousePressed();
        else if (typeof this.onMouseClicked !== 'undefined' && this.isHovering() && this.mouse_was_pressed && !mouseIsPressed)
            this.onMouseClicked();
        else if (typeof this.onHover !== 'undefined' && this.isHovering())
            this.onHover();
        else
            this.normalDraw();

        pop();

        this.mouse_was_pressed = mouseIsPressed;
    }
}

function centerBox(cx, cy, rx, ry) {
    return [cx-rx, cy-ry, 2*rx, 2*ry];
}

function easyBox(cx, y, rx, h) {
    return [cx-rx, y, 2*rx, h];
}

function cornerBox(x0, y0, x1, y1) {
    return [x0, y0, x1-x0, y1-y0];
}

function constrainedRect(minx, maxx, miny, maxy, x, y, w, h) {
    let x_ = constrain(x, minx, maxx);
    let y_ = constrain(y, miny, maxy);
    rect(x_, y_, constrain(x+w, minx, maxx)-x_, constrain(y+h, miny, maxy)-y_);
}

function constrainedZoomedEasyRect(minx, maxx, miny, maxy, zoom, cx, y, w, h) {
    let x  = zoom*cx - 0.5*w;
    w *= zoom;
    h *= zoom;
    let x_ = constrain(x, minx, maxx);
    let y_ = constrain(y, miny, maxy);
    rect(x_, y_, constrain(x+w, minx, maxx)-x_, constrain(y+h, miny, maxy)-y_);
}

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

// squared euclidean norm
function dist2(x0, y0, x1, y1) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    return dx*dx + dy*dy;
}


let table;
let images = [];
let bins = [];

let imagesLoaded = false;

function preload() {
    console.log("preload");

    table = loadTable(DATASET_FILE, 'csv', 'header', function(table) {
        console.log(table.getRowCount() + "  __");
        for (var i = 0; i < table.getRowCount(); i++) {
            let row = table.getRow(i);

            let fname = row.get('file name');
            let lat = row.get('latitude');
            let lng = row.get('longitude');
            let day = row.getNum('day');
            let month = row.getNum('month');
            let year = row.getNum('year');
            let date;
            if (year == 0)
                date = null;
            else if (month == 0)
                date = new Date(year,     0,   0);
            else if (day == 0)
                date = new Date(year, month,   0);
            else
                date = new Date(year, month, day);

            loadImage(IMAGE_DIR + fname, function(image) {
                images.push({
                    og_image: image,
                    image: image,
                    latitude: lat,
                    longitude: lng,
                    dodraw: false,
                    x: 0,
                    y: 0,
                    size: 0,
                    date: date
                });
            })
        }
    });
};


// Map setup
let myMap
let canvas;
const mappa = new Mappa('Leaflet');
const mappa_options = {
    lat: 0,
    lng: 0,
    zoom: 4,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
}

var plot_selectors, plot_selection = HISTOGRAM;
var frameRateHistory = [];

function disableMap() {
    myMap.map.dragging.disable();
    myMap.map.touchZoom.disable();
    myMap.map.doubleClickZoom.disable();
    myMap.map.scrollWheelZoom.disable();
    myMap.map.boxZoom.disable();
    myMap.map.keyboard.disable();
    if (myMap.map.tap)
        myMap.map.tap.disable();
}

function enableMap() {
    myMap.map.dragging.enable();
    myMap.map.touchZoom.enable();
    myMap.map.doubleClickZoom.enable();
    myMap.map.scrollWheelZoom.enable();
    myMap.map.boxZoom.enable();
    myMap.map.keyboard.enable();
    if (myMap.map.tap)
        myMap.map.tap.enable();
}

let locationMarkerBuffer;

//function locationMarker(x, y, size, frame_color, dot_color, stroke_color)
function locationMarker(buffer, x, y, size) {
    ////push();
    //stroke(stroke_color);
    //fill(frame_color);
    //triangle(x, y, x-size, y-2*size, x+size, y-2*size);
    //triangle(x, y, x-0.75*size, y-size, x+0.75*size, y-size);
    //arc(x, y-2*size, 2*size, 3*size, PI-1, PI);
    //arc(x, y-2*size, 2*size, 3*size,  0, 1);
    //arc(x, y-2*size, 2*size, 2*size, PI, 0);
    //noStroke();
    //triangle(x, y, x-0.75*size, y-1.2*size, x+0.75*size, y-1.2*size);
    //fill(dot_color);
    //ellipse(x, y-2*size, 1.5*size, 1.5*size);
    ////pop();
    image(buffer, x-size, y-3*size, 2*size, 3*size);
}

let lastMouseX, lastMouseY;
function setup() {
    console.log("setup");
    canvas = createCanvas(windowWidth, windowHeight);
    frameRate(FRAMERATE);
    cursor(ARROW);

    // --- colors ---
    RED      = color(230,  25,  75);
    GREEN    = color( 60, 180,  75);
    BLUE     = color(  0, 130, 200);
    YELLOW   = color(255, 255,  25);
    ORANGE   = color(245, 130,  48);
    PURPLE   = color(145,  30, 180);
    CYAN     = color( 70, 240, 140);
    MAGENTA  = color(240,  50, 230);
    LIME     = color(210, 245,  60);
    PINK     = color(250, 190, 190);
    TEAL     = color(  0, 128, 128);
    LAVENDER = color(230, 190, 255);
    BROWN    = color(170, 110,  40);
    BEIGE    = color(255, 250, 200);
    MAROON   = color(128,   0,   0);
    MINT     = color(170, 255, 195);
    OLIVE    = color(128, 128,   0);
    APRICOT  = color(255, 215, 180);
    NAVY     = color(  0,   0, 128);
    GREY     = color(128, 128, 128);
    WHITE    = color(255, 255, 255);
    BLACK    = color(  0,   0,   0);

    var button_widths = width*0.05; // width / 20;
    var button_spacing = width / 9;
    var button_ys = height * controls_top_margin;
    var button_heights = height * controls_percent;
    plot_selectors = [
        new Interactable(...easyBox(width/2 - button_spacing, button_ys, button_widths, button_heights),
            normalDraw = function() {
                if (plot_selection === HISTOGRAM) {
                    strokeWeight(3);
                    fill(200);
                } else
                    fill(255, 0, 0);
                rect(this.x, this.y, this.w, this.h, 5);
                textAlign(CENTER, CENTER);
                fill(0);
                textSize(this.h/2);
                text("Histogram", this.cx, this.cy);
            },
            onHover = function() {
                if (plot_selection === HISTOGRAM) {
                    strokeWeight(3);
                    fill(200);
                } else
                    fill(220, 0, 0);
                rect(this.x, this.y, this.w, this.h, 5);
                textAlign(CENTER, CENTER);
                fill(0);
                textSize(this.h/2);
                text("Histogram", this.cx, this.cy);
            },
            onMousePressed = function() {
                if (plot_selection === HISTOGRAM) {
                    strokeWeight(3);
                    fill(200);
                } else
                    fill(150, 0, 0);
                rect(this.x, this.y, this.w, this.h, 5);
                textAlign(CENTER, CENTER);
                fill(0);
                textSize(this.h/2);
                text("Histogram", this.cx, this.cy);
            },
            onMouseClicked = function() {
                plot_selection = HISTOGRAM;
                this.normalDraw();
                disableMap();
            }),
        new Interactable(...easyBox(width/2, button_ys, button_widths, button_heights),
            normalDraw = function() {
                if (plot_selection === DISCRETE_HISTOGRAM) {
                    strokeWeight(3);
                    fill(200);
                } else
                    fill(0, 255, 0);
                rect(this.x, this.y, this.w, this.h, 5);
                textAlign(CENTER, CENTER);
                fill(0);
                textSize(this.h/2);
                text("Discrete Histogram", this.cx, this.cy);
            },
            onHover = function() {
                if (plot_selection === DISCRETE_HISTOGRAM) {
                    strokeWeight(3);
                    fill(200);
                } else
                    fill(0, 220, 0);
                rect(this.x, this.y, this.w, this.h, 5);
                textAlign(CENTER, CENTER);
                fill(0);
                textSize(this.h/2);
                text("Discrete Histogram", this.cx, this.cy);
            },
            onMousePressed = function() {
                if (plot_selection === DISCRETE_HISTOGRAM) {
                    strokeWeight(3);
                    fill(200);
                } else
                    fill(0, 150, 0);
                rect(this.x, this.y, this.w, this.h, 5);
                textAlign(CENTER, CENTER);
                fill(0);
                textSize(this.h/2);
                text("Discrete Histogram", this.cx, this.cy);
            },
            onMouseClicked = function() {
                plot_selection = DISCRETE_HISTOGRAM;
                this.normalDraw();
                disableMap();
            }),
        new Interactable(...easyBox(width/2 + button_spacing, button_ys, button_widths, button_heights),
            normalDraw = function() {
                if (plot_selection === MAP) {
                    strokeWeight(3);
                    fill(200);
                } else
                    fill(0, 0, 255);
                rect(this.x, this.y, this.w, this.h, 5);
                textAlign(CENTER, CENTER);
                fill(0);
                textSize(this.h/2);
                text("Map", this.cx, this.cy);
            },
            onHover = function() {
                if (plot_selection === MAP) {
                    strokeWeight(3);
                    fill(200);
                } else
                    fill(0, 0, 220);
                rect(this.x, this.y, this.w, this.h, 5);
                textAlign(CENTER, CENTER);
                fill(0);
                textSize(this.h/2);
                text("Map", this.cx, this.cy);
            },
            onMousePressed = function() {
                if (plot_selection === MAP) {
                    strokeWeight(3);
                    fill(200);
                } else
                    fill(0, 0, 150);
                rect(this.x, this.y, this.w, this.h, 5);
                textAlign(CENTER, CENTER);
                fill(0);
                textSize(this.h/2);
                text("Map", this.cx, this.cy);
            },
            onMouseClicked = function() {
                plot_selection = MAP;
                this.normalDraw();
                enableMap();
            })
        ];

    // --- setup the map ---
    myMap = mappa.tileMap(mappa_options);
    myMap.overlay(canvas, function() {
            myMap.map.zoomControl.remove()
            myMap.map.attributionControl.remove()

            disableMap();
        });
    myMap.onChange(updateImagePositionsOnMap)

    // --- setup for drawing ---
    imageMode(CORNER);
    //imageMode(CENTER);

    // --- setup the frameRate history
    for (var i = 0; i < 100; i++)
        frameRateHistory.push(0);

    // --- pre-draw the location markers, since arcs are slow to draw ---
    locationMarkerBuffer = createGraphics(2*30, 3*30);  // should be a 2-by-3 canvas

    // location marker has dimensions {width: 2*size, height: 3*size}
    const x = 30, y = 3*30, size = 30;
    const stroke_color = BLACK, frame_color = BLACK, dot_color = WHITE;
    locationMarkerBuffer.stroke(stroke_color);
    locationMarkerBuffer.fill(frame_color);
    locationMarkerBuffer.triangle(x, y, x-size, y-2*size, x+size, y-2*size);
    locationMarkerBuffer.triangle(x, y, x-0.75*size, y-size, x+0.75*size, y-size);
    locationMarkerBuffer.arc(x, y-2*size, 2*size, 3*size, PI-1, PI);
    locationMarkerBuffer.arc(x, y-2*size, 2*size, 3*size,  0, 1);
    locationMarkerBuffer.arc(x, y-2*size, 2*size, 2*size, PI, 0);
    locationMarkerBuffer.noStroke();
    locationMarkerBuffer.triangle(x, y, x-0.75*size, y-1.2*size, x+0.75*size, y-1.2*size);
    locationMarkerBuffer.fill(dot_color);
    locationMarkerBuffer.ellipse(x, y-2*size, 1.5*size, 1.5*size);

    mkBins();

    lastMouseX = mouseX;
    lastMouseY = mouseY;
};

let histogramOffsetX = 0;
let histogramOffsetY = 0;
let histogramZoom    = 1;
function draw() {
    if (plot_selection !== MAP)
        background(255, 255, 255);
    else
        clear();

    push();
    // draw plot area
    switch (plot_selection) {
        case HISTOGRAM:
            let binwidth = (histogram_left_margin*width -
                            map(1, 0, bins.length-1, histogram_left_margin*width, (1-histogram_right_margin)*width));
            stroke(BLACK);
            noFill();
            rect(...cornerBox(histogram_left_margin*width, controls_bottom*height+10, (1-histogram_right_margin)*width, timeline_top*height-10));
            noStroke();
            fill(GREEN);
            let maxbinlength = max(bins.map(y => y.length));
            maxbinlength *= 1.25;
            for (var i = 0; i < bins.length; i++) {
                constrainedZoomedEasyRect(histogram_left_margin*width, (1-histogram_right_margin)*width, controls_bottom*height+10, timeline_top*height-10, histogramZoom,
                    histogramOffsetX + map(i+0.5, 0, bins.length-1, histogram_left_margin*width, (1-histogram_right_margin)*width), histogramOffsetY + timeline_top*height-10,
                    binwidth, -map(bins[i].length, 0, maxbinlength, 0, plotarea_height*height-20)
                );
            }
            if (mouseIsPressed) {
                histogramOffsetX = histogramOffsetX + (mouseX-lastMouseX)/histogramZoom;
                histogramOffsetY = histogramOffsetY + (mouseY-lastMouseY)/histogramZoom;
                //histogramOffsetX = constrain(histogramOffsetX + (mouseX-lastMouseX)/histogramZoom, (histogram_left_margin*width - minBinX), maxBinX - (1-histogram_right_margin)*width);
                //histogramOffsetY = constrain(histogramOffsetY + (mouseY-lastMouseY)/histogramZoom, controls_bottom*height+10 - minBinY, maxBinY - (timeline_top*height-10));
            }
            break;
        case DISCRETE_HISTOGRAM:
            break;
        case MAP:
            let entry, x, y, w, h;
            for (var i = 0; i < images.length; i++) {
                entry = images[i];
                if (!entry.dodraw)
                    continue;

                locationMarker(locationMarkerBuffer, entry.x, entry.y, entry.size);
                //locationMarker(entry.x, entry.y, entry.size, BLACK, WHITE, BLACK);  // This is the bottleneck!
            }
            for (var i = 0; i < images.length; i++) {
                entry = images[i];
                if (!entry.dodraw)
                    continue;

                if (dist2(entry.x, entry.y-2*entry.size, mouseX, mouseY) < 4*entry.size*entry.size) {
                    x = entry.x;
                    y = entry.y;
                    w = 0.2*width;
                    if (entry.width <= w)
                        h = entry.image.height;
                    else
                        h = w*entry.image.height/entry.image.width;
                    if (x+10+w >= width-10)
                        x -= w + 20;
                    if (y+10+h >= timeline_top*height - 10)
                        y -= h + 20;
                    image(entry.image, x+10, y+10, w, h);
                    break;
                }
            }
            break;
    }
    pop()

    push();
    // draw timeline
    var overTimeline = 10 <= mouseX
        && mouseX <= width-10
        && height*(1 - timeline_percent) <= mouseY
        && mouseY <= height*(1 - timeline_bottom_margin);
    if (overTimeline)
        fill(220, 220, 220); // rgb(220, 220, 220)
    else
        fill(230, 230, 230); // rgb(230, 230, 230)
    rect(10, height - height*timeline_percent, width - 20, height*timeline_percent - height*timeline_bottom_margin);
    pop();

    plot_selectors.forEach(function(x) { x.draw() });

    if (SHOW_FRAMERATE === 'text') {
        push();

        const framerate = frameRate();

        textSize(16);
        textAlign(RIGHT, TOP);
        textStyle(BOLD);

        if (framerate < 10)
            fill(255, 0, 0);    // rgb(255,   0,   0)
        else if (framerate < 30)
            fill(200, 100, 0);  // rgb(200, 100,   0)
        else if (framerate < 45)
            fill(235, 160, 0);  // rgb(235, 160,   0)
        else if (framerate < 55)
            fill(192, 193, 0);  // rgb(192, 193,   0)
        else
            fill(0);            // rgb(  0,   0,   0)

        text(floor(framerate), width-50, 10);
        pop();
    }
    else if (SHOW_FRAMERATE === 'plot') {
        push();

        frameRateHistory.shift();
        frameRateHistory.push(frameRate());

        fill(220, 220, 220);
        rect(width-260, 10, 250, 170);
        fill(BLACK);
        textAlign(LEFT, BOTTOM);
        noStroke();
        text("60", width-250, map(60, 0, FRAMERATE+40, 180, 10)-2);
        stroke(GREEN);
        line(width-260, map(60, 0, FRAMERATE+40, 180, 10), width-10, map(60, 0, FRAMERATE+40, 180, 10));
        noStroke();
        text("30", width-250, map(30, 0, FRAMERATE+40, 180, 10)-2);
        stroke(OLIVE);
        line(width-260, map(30, 0, FRAMERATE+40, 180, 10), width-10, map(30, 0, FRAMERATE+40, 180, 10));
        noStroke();
        text("15", width-250, map(15, 0, FRAMERATE+40, 180, 10)-2);
        stroke(RED);
        line(width-260, map(15, 0, FRAMERATE+40, 180, 10), width-10, map(15, 0, FRAMERATE+40, 180, 10));

        let y;
        for (var i = 0; i < 99; i++) {
            y = min(frameRateHistory[i], frameRateHistory[i+1]);
            if (y < 15)
                stroke(MAROON);
            else if (y < 30)
                stroke(RED);
            else if (y < 50)
                stroke(OLIVE);
            else
                stroke(BLACK);
            line(map(i, 0, FRAMERATE+40, width-260, width-10), map(frameRateHistory[i], 0, FRAMERATE+40, 180, 10),
                 map(i+1, 0, FRAMERATE+40, width-260, width-10), map(frameRateHistory[i+1], 0, FRAMERATE+40, 180, 10));
        }

        pop();
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
};

function mkBins() {
    bins = [];

    let dates = images.map(z => z.date).filter(d => d !== null);
    let bin_start = dates.reduce((x,y) => x < y ? x : y),
        bins_end = dates.reduce((x,y) => x > y ? x : y);

    let bin_end = new Date(bins_end.getTime());
    while (bin_end <= bins_end) {
        bin_end = new Date(bin_start.getTime());
        bin_end.setMonth(bin_end.getMonth()+6);
        bins.push(images.filter(z => bin_start <= z.date && z.date <= bin_end));
        bin_start = new Date(bin_end.getTime());
    }

    print(bins);
}

function updateImagePositionsOnMap() {
    for (var i = 0; i < images.length; i++) {
        var entry = images[i];

        if (!myMap.map.getBounds().contains({lat: entry.latitude, lng: entry.longitude})) {
            images[i].dodraw = false;
            continue;
        }

        const xy = myMap.latLngToPixel(entry.latitude, entry.longitude);
        //const size = 10 + myMap.zoom();
        const size = 4 + myMap.zoom();
        images[i].dodraw = true;
        images[i].x = xy.x;
        images[i].y = xy.y;
        images[i].size = size;
    }
}

function mouseWheel(event) {
    histogramZoom = max(histogramZoom - 0.001*event.delta, 1);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
};
