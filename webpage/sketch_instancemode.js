// vim: fdm=marker fmr={,}

// FIXED PATHS
const DATASET_FILE  = "output.csv";
const IMAGE_DIR     = "images/";

// POSITION CONSTANTS
const controls_top_margin    = 0.01;
const controls_percent       = 0.03;
const controls_bottom_margin = 0.01;
// NOTE: plot area actually goes here
const timeline_top_margin    = 0.01;
const timeline_percent       = 0.15;
const timeline_bottom_margin = 0.01;
// Out of place defs.
const plotarea_top           = controls_top_margin + controls_percent + controls_bottom_margin;
const plotarea_percent       = 1-(timeline_top_margin+timeline_percent+timeline_bottom_margin) - plotarea_top;

// ENUMS
const HISTOGRAM          = 0;
const DISCRETE_HISTOGRAM = 1;
const MAP                = 2;


class Interactable {
    constructor (p, x, y, w, h, normaldraw, onHover, onMousePressed, onMouseClicked) {
        this.p = p;
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

        this.mouse_was_pressed = p.mouseIsPressed;
    }

    isHovering() {
        return this.x <= this.p.mouseX && this.p.mouseX <= this.x+this.w && this.y <= this.p.mouseY && this.p.mouseY <= this.y+this.h;
    }

    draw() {
        this.p.push();

        if (typeof this.onMousePressed !== 'undefined' && this.isHovering() && this.p.mouseIsPressed)
            this.onMousePressed(this.p);
        else if (typeof this.onMouseClicked !== 'undefined' && this.isHovering() && this.mouse_was_pressed && !this.p.mouseIsPressed)
            this.onMouseClicked(this.p);
        else if (typeof this.onHover !== 'undefined' && this.isHovering())
            this.onHover(this.p);
        else
            this.normalDraw(this.p);

        this.p.pop();

        this.mouse_was_pressed = this.p.mouseIsPressed;
    }
}

function centerBox(cx, cy, rx, ry) {
    return [cx-rx, cy-ry, 2*rx, 2*ry];
}

function box(cx, y, rx, h) {
    return [cx-rx, y, 2*rx, h];
}


const s = function(p) {
    let table;
    let images = [];

    var tmap, s, stagIndex;
    var x = 0, y = 0;
    var showCoords = false;

    // --- map setup ---
    // adapted from https://mappa.js.org/docs/simple-map.html

    p.preload = function() {
        console.log("preload");

        table = p.loadTable(DATASET_FILE, "csv");

        // TODO: load images

        // preload the tilemap
        tmap = p.loadTiledMap("desert", "map_data");
    };


    var points, seed, plot, i;

    var plot_selectors, plot_selection = HISTOGRAM;

    p.setup = function() {
        console.log("setup");
        canvas = p.createCanvas(p.windowWidth-30, p.windowHeight-30);
        p.frameRate(60);

        var button_widths = p.width / 20;
        var button_spacing = p.width / 9;
        var button_ys = p.height * controls_top_margin;
        var button_heights = p.height * controls_percent;
        plot_selectors = [
            new Interactable(p, ...box(p.width/2 - button_spacing, button_ys, button_widths, button_heights),
                normalDraw = function(p) {
                    p.fill(255, 0, 0);
                    p.rect(this.x, this.y, this.w, this.h, 5);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.fill(0);
                    p.textSize(this.h/2);
                    p.text("Histogram", this.cx, this.cy);
                },
                onHover = function(p) {
                    p.fill(220, 0, 0);
                    p.rect(this.x, this.y, this.w, this.h, 5);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.fill(0);
                    p.textSize(this.h/2);
                    p.text("Histogram", this.cx, this.cy);
                },
                onMousePressed = function(p) {
                    p.fill(150, 0, 0);
                    p.rect(this.x, this.y, this.w, this.h, 5);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.fill(0);
                    p.textSize(this.h/2);
                    p.text("Histogram", this.cx, this.cy);
                },
                onMouseClicked = function(p) {
                    plot_selection = HISTOGRAM;
                    this.normalDraw(p);
                }),
            new Interactable(p, ...box(p.width/2, button_ys, button_widths, button_heights),
                normalDraw = function(p) {
                    p.fill(0, 255, 0);
                    p.rect(this.x, this.y, this.w, this.h, 5);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.fill(0);
                    p.textSize(this.h/2);
                    p.text("Discrete Histogram", this.cx, this.cy);
                },
                onHover = function(p) {
                    p.fill(0, 220, 0);
                    p.rect(this.x, this.y, this.w, this.h, 5);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.fill(0);
                    p.textSize(this.h/2);
                    p.text("Discrete Histogram", this.cx, this.cy);
                },
                onMousePressed = function(p) {
                    p.fill(0, 150, 0);
                    p.rect(this.x, this.y, this.w, this.h, 5);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.fill(0);
                    p.textSize(this.h/2);
                    p.text("Discrete Histogram", this.cx, this.cy);
                },
                onMouseClicked = function(p) {
                    plot_selection = DISCRETE_HISTOGRAM;
                    this.normalDraw(p);
                }),
            new Interactable(p, ...box(p.width/2 + button_spacing, button_ys, button_widths, button_heights),
                normalDraw = function(p) {
                    p.fill(0, 0, 255);
                    p.rect(this.x, this.y, this.w, this.h, 5);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.fill(0);
                    p.textSize(this.h/2);
                    p.text("Map", this.cx, this.cy);
                },
                onHover = function(p) {
                    p.fill(0, 0, 220);
                    p.rect(this.x, this.y, this.w, this.h, 5);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.fill(0);
                    p.textSize(this.h/2);
                    p.text("Map", this.cx, this.cy);
                },
                onMousePressed = function(p) {
                    p.fill(0, 0, 150);
                    p.rect(this.x, this.y, this.w, this.h, 5);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.fill(0);
                    p.textSize(this.h/2);
                    p.text("Map", this.cx, this.cy);
                },
                onMouseClicked = function(p) {
                    plot_selection = MAP;
                    this.normalDraw(p);
                })
            ];

        // --- setup the plot ---
        points = [];
        seed = 100 * p.random();
        for (i = 0; i < 100; i++)
            points[i] = new GPoint(i, 10 * p.noise(0.1 * i + seed));

        plot = new GPlot(p);
        plot.setPos(0, p.height * plotarea_top);
        //plot.setOuterDim(p.width, p.height);
        plot.setOuterDim(p.width, p.height * plotarea_percent);

        plot.setPoints(points);

        plot.activatePanning();
        plot.activateZooming(0.9, p.CENTER, p.CENTER);

        // --- setup the map ---

        //p.noLoop();
    };

    p.draw = function() {
        p.background(255, 255, 255);

        plot_selectors.forEach(function(x) { x.draw() });

        p.push();
        // draw plot area
        if (plot_selection === HISTOGRAM)
        {
            plot.defaultDraw();
        }
        else if (plot_selection == DISCRETE_HISTOGRAM)
        {
            ;
        }
        else if (plot_selection == MAP)
        {
            tmap.draw(x, y);
        }
        p.pop()

        p.push();
        // draw timeline
        var overTimeline = 10 <= p.mouseX
            && p.mouseX <= p.width-10
            && p.height*(1 - timeline_percent) <= p.mouseY
            && p.mouseY <= p.height*(1 - timeline_bottom_margin);
        p.noStroke();
        if (overTimeline)
            p.fill(220, 220, 220);
        else
            p.fill(230, 230, 230);
        p.rect(10, p.height - p.height*timeline_percent, p.width - 20, p.height*timeline_percent - p.height*timeline_bottom_margin);
        p.pop();
    };

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth-30, p.windowHeight-30);
        plot.setOuterDim(p.width, p.height * plotarea_percent);
    };
};

let myp5 = new p5(s);
