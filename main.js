let totalRegionCount = 0;
let currentIteration = 0;
let tileBuffer = [];
let tileSize = 13;
const setTileSize = function() {
	tileSize = parseInt(document.getElementById("tileSize").value, 10);
	process();
};
const setSize = function(w, h, id) {
	let canvas = document.getElementById(id);
	let ctx = canvas.getContext('2d');
	ctx.canvas.width = w;
	ctx.canvas.height = h;
};
const cursorWithinBounds = function(canvas, evt) {
	let rect = canvas.getBoundingClientRect();
	let x = Math.floor((evt.clientX - rect.left) / tileSize);
	let y = Math.floor((evt.clientY - rect.top) / tileSize);
	for (let i = 0; i < tileBuffer.length; i++) {
		if ((tileBuffer[i].x + tileBuffer[i].offsetX / tileSize) == x && (tileBuffer[i].y + tileBuffer[i].offsetY / tileSize) == y) {
			return {
				x,
				y,
				i
			};
		}
	}
}
const drawGrid = function(w, h, id, region, plane, jsonData, offsetX, offsetY) {
	if (offsetX == undefined) {
		offsetX = 0;
		offsetY = 0;
	}
	let canvas = document.getElementById(id);
	canvas.onmousemove = function(evt) {
		if (cursorWithinBounds(canvas, evt)) {
			canvas.style.cursor = "pointer";
		} else {
			canvas.style.cursor = "auto";
		}
	}
	canvas.onclick = function(evt) {
		let cursorPos = cursorWithinBounds(canvas, evt);
		if (cursorPos) {
			let selectedTile = tileBuffer[cursorPos.i];
			drawSelection(selectedTile.x + selectedTile.offsetX / tileSize, selectedTile.y + selectedTile.offsetY / tileSize, decimalToHexString(selectedTile.col, false));
			let content;
			let col = "#" + decimalToHexString(selectedTile.col);
			if (selectedTile.label != undefined) {
				content = "Color: " + col + " \n " + selectedTile.label;
			} else {
				content = "Color: " + col;
			}
			drawInfo(0, 0, content, col);
		}
	};
	let ctx = canvas.getContext('2d');
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	let background = new Image();
	background.src = "https://raw.githubusercontent.com/Bram91/TileMarkers/master/tiles/" + plane + "/8/" + getLocation(region).x + "/" + getLocation(region).y + ".png";
	background.onload = function() {

		ctx.drawImage(background, offsetX, offsetY, w, h);
		let alpha = 1 - document.getElementById("transparency").value / 10;
		if (document.getElementById("whiteOverlay").checked == true) {
			ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
		} else {
			ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
		}
		ctx.fillRect(offsetX, offsetY, w, h);
		if (document.getElementById("drawGrid").checked) {
			for (let x = 0; x <= w; x += tileSize) {
				ctx.moveTo(x + offsetX, 0 + offsetY);
				ctx.lineTo(x + offsetX, h + offsetY);
				for (let y = 0; y <= h; y += tileSize) {
					ctx.moveTo(0 + offsetX, y + offsetY);
					ctx.lineTo(w + offsetX, y + offsetY);
				}
			}
		}
		ctx.stroke();

		if (jsonData != undefined) {
			for (let i = 0; i < jsonData.length; i++) {
				if (jsonData[i].regionId == region) {
					tileBuffer.push({
						"x": jsonData[i].regionX,
						"y": 63 - jsonData[i].regionY,
						"col": jsonData[i].color.value,
						"offsetX": offsetX,
						"offsetY": offsetY,
						"label": jsonData[i].label
					});
				}
			}
		}
		currentIteration++;
		if (currentIteration == totalRegionCount) {
			drawTiles();
		}
	};
};
const drawTile = function(x, y, col, offsetX, offsetY, label) {
	let xPos = x * tileSize + offsetX;
	let yPos = y * tileSize + offsetY;
	let canvas = document.getElementById("myCanvas");
	let ctx = canvas.getContext('2d');
	let color = "#" + decimalToHexString(col);
	ctx.fillStyle = color + "44";
	ctx.strokeStyle = color;
	ctx.fillRect(xPos, yPos, tileSize, tileSize);
	ctx.lineWidth = 1;
	ctx.strokeRect(xPos, yPos, tileSize, tileSize);
	if (label) {
		ctx.font = "bold " + tileSize + "px Arial";
		ctx.fillStyle = "#" + decimalToHexString(col, true);
		ctx.fillText("⚠", xPos + 1, yPos + tileSize - 2);
	}
};

const drawArrow = function(xPos, yPos) {
	let canvas = document.getElementById('myInteraction');
	let ctx = canvas.getContext('2d');
	ctx.save()
	ctx.translate((xPos + 3.0) * tileSize, (yPos + 1.5) * tileSize);
	let gradient = ctx.createLinearGradient(0, 0, 0, 40);
	gradient.addColorStop(0, "#F00");
	gradient.addColorStop(1, "#000");
	ctx.fillStyle = gradient;
	ctx.lineWidth = 1;
	ctx.rotate((Math.PI / 180) * 135);
	ctx.beginPath();
	ctx.lineTo(0.2 * tileSize, 1.2 * tileSize);
	ctx.lineTo(1.0 * tileSize, 2.0 * tileSize);
	ctx.lineTo(1.8 * tileSize, 1.2 * tileSize);
	ctx.lineTo(1.2 * tileSize, 1.2 * tileSize);
	ctx.lineTo(1.2 * tileSize, 0 * tileSize);
	ctx.lineTo(0.8 * tileSize, 0 * tileSize);
	ctx.lineTo(0.8 * tileSize, 1.2 * tileSize);
	ctx.lineTo(0.2 * tileSize, 1.2 * tileSize);
	ctx.fill();
	ctx.stroke();
	// ctx.translate((-xPos * tileSize) + 5, (-yPos * tileSize) + 15);
	ctx.restore();
};

const wrapText = function(ctx, x, y, text, fontsize, maxwidth) {
	let startingY = y;
	let words = text.split(' ');
	let line = '';
	let space = '';
	let lineHeight = fontsize * 1.286;
	let currentY = y;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	for (let n = 0; n < words.length; n++) {
		let testLine = line + space + words[n];
		space = ' ';
		if (ctx.measureText(testLine).width > maxwidth || words[n] == "\n") {
			ctx.fillText(line, x, currentY);
			if (words[n] != "\n") {
				line = words[n] + ' ';
			} else {
				line = "";
			}
			currentY += lineHeight;
			space = '';
		} else {
			line = testLine;
		}
	}
	ctx.fillText(line, x, currentY);
	return (currentY + lineHeight - startingY + 7);
};

const drawInfo = function(xPos, yPos, content, color) {
	let canvas = document.getElementById("myInteraction");
	let ctx = canvas.getContext('2d');
	ctx.strokeStyle = "#222";
	ctx.fillStyle = "#333";
	let lineWidth = 2;
	ctx.lineWidth = lineWidth;
	ctx.font = "12px Arial";
	let height = wrapText(ctx, xPos + 2, yPos + 7, content, 12, 200);
	ctx.fillRect(xPos, yPos, 200, height);
	ctx.strokeRect(xPos, yPos, 200, height);
	ctx.fillStyle = "#DADADA";
	wrapText(ctx, xPos + 2, yPos + 7, content, 12, 200);
	ctx.fillStyle = color;
	ctx.fillRect(120, 7, 70, 10);


};
const drawSelection = function(xPos, yPos, col) {
	let canvas = document.getElementById("myInteraction");
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "#" + col;
	let lineWidth = 2;
	ctx.lineWidth = lineWidth;
	ctx.strokeRect(xPos * tileSize - lineWidth / 2, yPos * tileSize - lineWidth / 2, tileSize + lineWidth, tileSize + lineWidth);
	drawArrow(xPos, yPos);
};
const decimalToHexString = function(number, invert) {
	if (invert) {
		number = 0xFFFFFF - number;
	} else {
		number = 0xFFFFFF + number + 1;
	}

	let hex = number.toString(16).toUpperCase();
	while (hex.length < 6) {
		hex = "0" + hex;
	}
	while (hex.length > 6) {
		hex = hex.substring(1)
	}
	return hex;
};

const drawTiles = function() {
	for (let i = 0; i < tileBuffer.length; i++) {
		let tile = tileBuffer[i];
		if (tile.label != undefined) {
			drawTile(tile.x, tile.y, tile.col, tile.offsetX, tile.offsetY, true);
		} else {
			drawTile(tile.x, tile.y, tile.col, tile.offsetX, tile.offsetY);
		}
	}
};

const process = function() {
	totalRegionCount = 0;
	currentIteration = 0;
	tileBuffer = [];
	if (document.getElementById("tiles").value === "") {
		setSize(64 * tileSize, 64 * tileSize, 'myCanvas');
		setSize(64 * tileSize, 64 * tileSize, 'myInteraction');
		drawGrid(64 * tileSize, 64 * tileSize, 'myCanvas', 12850, 0);
	} else {
		let data = JSON.parse(document.getElementById("tiles").value);
		let temp = [];
		for (let i = 0; i < data.length; i++) {
			if (!temp.includes(data[i].regionId)) {
				temp.push(data[i].regionId);
			}
		}
		let startx = 0;
		let starty = 0;
		let endx = 0;
		let endy = 0;
		for (let i = 0; i < temp.length; i++) {
			let location = getLocation(temp[i]);
			if (startx == 0) {
				startx = location.x;
			}
			if (location.x > endx) {
				endx = location.x;
			}
			if (starty == 0) {
				starty = location.y;
			}
			if (location.y > endy) {
				endy = location.y;
			}
		}

		let width = startx - endx;
		let height = starty - endy;
		if (width < 0) {
			width *= -1;
		}
		if (height < 0) {
			height *= -1;
		}
		width++;
		height++;
		totalRegionCount = temp.length;
		setSize(64 * tileSize * width, 64 * tileSize * height, "myCanvas");
		setSize(64 * tileSize * width, 64 * tileSize * height, "myInteraction");
		for (let i = 0; i < temp.length; i++) {
			let offsetX = 0;
			let offsetY = 0;
			if (getLocation(temp[i]).x > startx) {
				offsetX = 64 * tileSize;
			}
			if (getLocation(temp[i]).y < endy) {
				offsetY = 64 * tileSize;
			}
			drawGrid(64 * tileSize, 64 * tileSize, "myCanvas", temp[i], data[0].z, data, offsetX, offsetY);
		}
	}
};

const getLocation = function(region) {
	let x = ((region >>> 8) << 6) / 64 - 18;
	let y = ((region & 0xff) << 6) / 64 - 19;
	return {
		x,
		y
	};
};