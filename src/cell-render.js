// align: left | center | right
// width: the width of cell
// padding: the padding of cell
function textx(align, width, padding) {
  switch (align) {
    case 'left':
      return padding;
    case 'center':
      return width / 2;
    case 'right':
      return width - padding;
    default:
      return 0;
  }
}

// align: top | middle | bottom
// height: the height of cell
// txtHeight: the height of text
// padding: the padding of cell
function texty(align, height, txtHeight, padding) {
  switch (align) {
    case 'top':
      return padding;
    case 'middle':
      return height / 2 - txtHeight / 2;
    case 'bottom':
      return height - padding - txtHeight;
    default:
      return 0;
  }
}

// type: underline | strike
// align: left | center | right
// valign: top | middle | bottom
function textLine(type, align, valign, x, y, w, h) {
  // y
  let ty = 0;
  if (type === 'underline') {
    if (valign === 'top') {
      ty = -h;
    } else if (valign === 'middle') {
      ty = -h / 2;
    }
  } else if (type === 'strike') {
    if (valign === 'top') {
      ty = -h / 2;
    } else if (valign === 'bottom') {
      ty = h / 2;
    }
  }
  // x
  let tx = 0;
  if (align === 'center') {
    tx = w / 2;
  } else if (align === 'right') {
    tx = w;
  }
  return [
    [x - tx, y - ty],
    [x - tx + w, y - ty],
  ];
}

function renderBorder(draw, width, height, border) {
  if (border) {
    const {
      top, right, bottom, left,
    } = border;
    draw.save();
    if (top) draw.lineStyle(...top).line([0, 0], [width, 0]);
    if (right) draw.lineStyle(...right).line([width, 0], [width, height]);
    if (bottom) draw.lineStyle(...bottom).line([0, height], [width, height]);
    if (left) draw.lineStyle(...left).line([0, 0], [0, height]);
    draw.restore();
  }
}

function fontString(family, size, italic, bold) {
  if (family && size) {
    let font = '';
    if (italic) font += 'italic ';
    if (bold) font += 'bold ';
    return `${font} ${size}pt ${family}`;
  }
  return undefined;
}

// draw: Canvas2d
// style:
export function cellRender(draw, text, rect, {
  border, fontSize, fontFamily,
  bold, italic, color, bgcolor,
  align, valign, underline, strike,
  textwrap, padding,
} = {}) {
  // at first move to (left, top)
  draw.save().beginPath()
    .translate(rect.x, rect.y);

  // border
  renderBorder(draw, rect.w, rect.h, border);

  // clip
  draw.attr({ fillStyle: bgcolor })
    .rect(0.5, 0.5, rect.w - 1, rect.h - 1)
    .clip()
    .fill();

  // text style
  draw.save().beginPath().attr({
    textAlign: align,
    textBaseline: valign,
    font: fontString(fontFamily, fontSize, italic, bold),
    fillStyle: color,
  });

  const [xp, yp] = padding || [5, 5];
  const tx = textx(align, rect.w, xp);
  const txts = text.split('\n');
  const innerWidth = rect.w - (xp * 2);
  const ntxts = [];
  txts.forEach((it) => {
    const txtWidth = draw.textWidth(it);
    if (textwrap && txtWidth > innerWidth) {
      let txtLine = { w: 0, len: 0, start: 0 };
      for (let i = 0; i < it.length; i += 1) {
        if (txtLine.w > innerWidth) {
          ntxts.push(it.substr(txtLine.start, txtLine.len));
          txtLine = { w: 0, len: 0, start: i };
        }
        txtLine.len += 1;
        txtLine.w += draw.textWidth(it[i]) + 1;
      }
      if (txtLine.len > 0) {
        ntxts.push(it.substr(txtLine.start, txtLine.len));
      }
    } else {
      ntxts.push(it);
    }
  });

  const lineHeight = fontSize * 1.425;
  const txtHeight = (ntxts.length - 1) * lineHeight;
  const lineTypes = [];
  if (underline) lineTypes.push('underline');
  if (strike) lineTypes.push('strike');
  let ty = texty(valign, rect.h, txtHeight, yp);
  ntxts.forEach((it) => {
    const txtWidth = draw.textWidth(it);
    draw.fillText(it, tx, ty);
    lineTypes.forEach((type) => {
      draw.line(...textLine(type, align, valign, tx, ty, txtWidth, fontSize));
    });
    ty += lineHeight;
  });
  draw.restore();

  draw.restore();
}

export default {};
