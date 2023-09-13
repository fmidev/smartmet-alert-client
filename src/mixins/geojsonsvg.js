// GeoJSON to SVG
// Adapted from https://github.com/mbloch/mapshaper
import Flatbush from 'flatbush'

const rxp = /[&<>"']/g
const map = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

const commonProperties =
  'class,opacity,stroke,stroke-width,stroke-dasharray,stroke-opacity,fill-opacity'.split(
    ','
  )

const arrayToIndex = function (arr, val) {
  const init = arguments.length > 1
  return arr.reduce(function (index, key) {
    index[key] = init ? val : true
    return index
  }, {})
}

const propertiesBySymbolType = {
  polygon: arrayToIndex(commonProperties.concat('fill', 'fill-pattern')),
  polyline: arrayToIndex(commonProperties),
  point: arrayToIndex(commonProperties.concat('fill', 'r')),
  label: arrayToIndex(
    commonProperties.concat(
      'fill,r,font-family,font-size,text-anchor,font-weight,font-style,letter-spacing,dominant-baseline'.split(
        ','
      )
    )
  ),
}

const getPathBounds = function (points) {
  const bounds = new Bounds()
  for (let i = 0, n = points.length; i < n; i++) {
    bounds.mergePoint(points[i][0], points[i][1])
  }
  return bounds
}

const getPlanarPathArea2 = function (points) {
  let sum = 0
  let ax
  let ay
  let bx
  let by
  let dx
  let dy
  let p
  for (let i = 0, n = points.length; i < n; i++) {
    p = points[i]
    if (i === 0) {
      ax = 0
      ay = 0
      dx = -p[0]
      dy = -p[1]
    } else {
      ax = p[0] + dx
      ay = p[1] + dy
      sum += ax * by - bx * ay
    }
    bx = ax
    by = ay
  }
  return sum / 2
}

const exportPointData = function (points) {
  let data, path
  if (!points || points.length === 0) {
    data = { partCount: 0, pointCount: 0 }
  } else {
    path = {
      points,
      pointCount: points.length,
      bounds: getPathBounds(points),
    }
    data = {
      bounds: path.bounds,
      pathData: [path],
      partCount: 1,
      pointCount: path.pointCount,
    }
  }
  return data
}

const exportPathCoords = function (iter) {
  const points = []
  let i = 0
  let x
  let y
  let prevX
  let prevY
  while (iter.hasNext()) {
    x = iter.x
    y = iter.y
    if (i === 0 || prevX != x || prevY != y) {
      points.push([x, y])
      i++
    }
    prevX = x
    prevY = y
  }
  return {
    points,
    pointCount: points.length,
  }
}

const exportPathData = function (shape, arcs, type) {
  // kludge until Shapefile exporting is refactored
  if (type === 'point') return exportPointData(shape)

  let pointCount = 0
  const bounds = new Bounds()
  const paths = []

  if (shape && (type === 'polyline' || type === 'polygon')) {
    shape.forEach(function (arcIds, i) {
      const iter = arcs.getShapeIter(arcIds)
      const path = exportPathCoords(iter)
      let valid = true
      path.ids = arcIds
      if (type === 'polygon') {
        path.area = getPlanarPathArea2(path.points)
        valid = path.pointCount > 3 && path.area !== 0
      } else if (type === 'polyline') {
        valid = path.pointCount > 1
      }
      if (valid) {
        pointCount += path.pointCount
        path.bounds = getPathBounds(path.points)
        bounds.mergeBounds(path.bounds)
        paths.push(path)
      } else {
        console.log('Skipping a collapsed', type, 'path')
      }
    })
  }

  return {
    pointCount,
    pathData: paths,
    pathCount: paths.length,
    bounds,
  }
}

const getBoundsSearchFunction = function (boxes) {
  if (!boxes.length) {
    return function () {
      return []
    }
  }
  const index = new Flatbush(boxes.length)
  boxes.forEach(function (ring) {
    const b = ring.bounds
    index.add(b.xmin, b.ymin, b.xmax, b.ymax)
  })
  index.finish()

  function idxToObj(i) {
    return boxes[i]
  }

  // Receives xmin, ymin, xmax, ymax parameters
  // Returns subset of original @bounds array
  return function (a, b, c, d) {
    return index.search(a, b, c, d).map(idxToObj)
  }
}

const groupPolygonRings = function (paths, arcs, reverseWinding) {
  const holes = []
  const groups = []
  const sign = reverseWinding ? -1 : 1
  ;(paths || []).forEach(function (path) {
    if (path.area * sign > 0) {
      groups.push([path])
    } else if (path.area * sign < 0) {
      holes.push(path)
    } else {
      // Zero-area ring, skipping
    }
  })

  if (holes.length === 0) {
    return groups
  }

  const boundsQuery = getBoundsSearchFunction(
    groups.map(function (group, i) {
      return {
        bounds: group[0].bounds,
        idx: i,
      }
    })
  )

  // Group each hole with its containing ring
  holes.forEach(function (hole) {
    let containerId = -1
    let containerArea = 0
    const holeArea = hole.area * -sign
    const b = hole.bounds
    const candidates = boundsQuery(b.xmin, b.ymin, b.xmax, b.ymax)
    let ring
    let ringId
    let ringArea
    let isContained
    for (let i = 0, n = candidates.length; i < n; i++) {
      ringId = candidates[i].idx
      ring = groups[ringId][0]
      ringArea = ring.area * sign
      isContained = ring.bounds.contains(hole.bounds) && ringArea > holeArea
      if (
        isContained &&
        candidates.length > 1 &&
        !testRingInRing(hole, ring, arcs)
      ) {
        continue
      }
      if (isContained && (containerArea === 0 || ringArea < containerArea)) {
        containerArea = ringArea
        containerId = ringId
      }
    }
    if (containerId == -1) {
      console.log(
        '[groupPolygonRings()] polygon hole is missing a containing ring, dropping.'
      )
    } else {
      groups[containerId].push(hole)
    }
  })

  return groups
}

const exportPointGeom = function (points, arcs) {
  let geom = null
  if (points.length === 1) {
    geom = {
      type: 'Point',
      coordinates: points[0],
    }
  } else if (points.length > 1) {
    geom = {
      type: 'MultiPoint',
      coordinates: points,
    }
  }
  return geom
}

const exportLineGeom = function (ids, arcs) {
  const obj = exportPathData(ids, arcs, 'polyline')
  if (obj.pointCount === 0) return null
  const coords = obj.pathData.map(function (path) {
    return path.points
  })
  return coords.length === 1
    ? {
        type: 'LineString',
        coordinates: coords[0],
      }
    : {
        type: 'MultiLineString',
        coordinates: coords,
      }
}

const exportPolygonGeom = function (ids, arcs, opts) {
  const obj = exportPathData(ids, arcs, 'polygon')
  if (obj.pointCount === 0) return null
  const groups = groupPolygonRings(obj.pathData, arcs, opts.invert_y)
  const reverse = (opts.rfc7946 || opts.v2) && !opts.invert_y
  const coords = groups.map(function (paths) {
    return paths.map(function (path) {
      if (reverse) path.points.reverse()
      return path.points
    })
  })
  return coords.length === 1
    ? {
        type: 'Polygon',
        coordinates: coords[0],
      }
    : {
        type: 'MultiPolygon',
        coordinates: coords,
      }
}

const GeoJSON = {
  ID_FIELD: 'FID',
  typeLookup: {
    LineString: 'polyline',
    MultiLineString: 'polyline',
    Polygon: 'polygon',
    MultiPolygon: 'polygon',
    Point: 'point',
    MultiPoint: 'point',
  },
  pathImporters: {
    LineString: function (coords, importer) {
      importer.importLine(coords)
    },
    MultiLineString: function (coords, importer) {
      for (let i = 0; i < coords.length; i++) {
        GeoJSON.pathImporters.LineString(coords[i], importer)
      }
    },
    Polygon: function (coords, importer) {
      for (let i = 0; i < coords.length; i++) {
        importer.importRing(coords[i], i > 0)
      }
    },
    MultiPolygon: function (coords, importer) {
      for (let i = 0; i < coords.length; i++) {
        GeoJSON.pathImporters.Polygon(coords[i], importer)
      }
    },
    Point: function (coord, importer) {
      importer.importPoints([coord])
    },
    MultiPoint: function (coords, importer) {
      importer.importPoints(coords)
    },
  },
  translateGeoJSONType: function (type) {
    return GeoJSON.typeLookup[type] || null
  },
  pathIsRing: function (coords) {
    const first = coords[0]
    const last = coords[coords.length - 1]
    return coords.length >= 4 && first[0] === last[0] && first[1] === last[1]
  },
  importGeometry: function (geom, importer) {
    const type = geom.type
    if (type in GeoJSON.pathImporters) {
      GeoJSON.pathImporters[type](geom.coordinates, importer)
    } else if (type === 'GeometryCollection') {
      geom.geometries.forEach(function (geom) {
        GeoJSON.importGeometry(geom, importer)
      })
    } else {
      console.log(
        'GeoJSON.importGeometry() Unsupported geometry type:',
        geom.type
      )
    }
  },

  exporters: {
    polygon: exportPolygonGeom,
    polyline: exportLineGeom,
    point: exportPointGeom,
  },
}

const stringifyVertex = function (p) {
  return p[0] + ' ' + p[1]
}

const stringifyCP = function (p) {
  return p[2].toFixed(2) + ' ' + p[3].toFixed(2)
}

const stringifyBezierArc = function (coords) {
  const p1 = coords[0]
  const p2 = coords[1]
  return (
    'M ' +
    stringifyVertex(p1) +
    ' C ' +
    stringifyCP(p1) +
    ' ' +
    stringifyCP(p2) +
    ' ' +
    stringifyVertex(p2)
  )
}

const stringifyLineStringCoords = function (coords) {
  let d
  if (coords.length === 0) {
    d = ''
  } else if (
    coords.length === 2 &&
    coords[0].length === 4 &&
    coords[1].length === 4
  ) {
    d = stringifyBezierArc(coords)
  } else {
    d = 'M ' + coords.map(stringifyVertex).join(' ')
  }
  return d
}

const importStandardPoint = function (coords, rec, layerOpts) {
  const isLabel = 'label-text' in rec
  const symbolType = layerOpts.point_symbol || ''
  const children = []
  const halfSize = rec.r || 0 // radius or half of symbol size
  let p
  if (halfSize > 0 || !isLabel) {
    if (symbolType === 'square') {
      p = {
        tag: 'rect',
        properties: {
          x: coords[0] - halfSize,
          y: coords[1] - halfSize,
          width: halfSize * 2,
          height: halfSize * 2,
        },
      }
    } else {
      p = {
        tag: 'circle',
        properties: {
          cx: coords[0],
          cy: coords[1],
        },
      }
      if (halfSize > 0) {
        p.properties.r = halfSize
      }
    }
    children.push(p)
  }
  return children.length > 1 ? { tag: 'g', children } : children[0]
}

const importPoint = function (coords, rec, layerOpts) {
  rec = rec || {}
  return importStandardPoint(coords, rec, layerOpts || {})
}

const importLineString = function (coords) {
  const d = stringifyLineStringCoords(coords)
  return {
    tag: 'path',
    properties: { d },
  }
}

const importPolygon = function (coords) {
  let d, o
  for (let i = 0; i < coords.length; i++) {
    d = o ? o.properties.d + ' ' : ''
    o = importLineString(coords[i])
    o.properties.d = d + o.properties.d + ' Z'
  }
  return o
}

const importMultiPath = function (coords, importer) {
  let o
  for (let i = 0; i < coords.length; i++) {
    if (i === 0) {
      o = importer(coords[i])
    } else {
      o.properties.d += ' ' + importer(coords[i]).properties.d
    }
  }
  return o
}

const geojsonImporters = {
  Point: importPoint,
  Polygon: importPolygon,
  MultiPolygon: function (coords) {
    return importMultiPath(coords, importPolygon)
  },
}

const GeoJSONParser = function () {
  const idField = GeoJSON.ID_FIELD
  const importer = new PathImporter()

  this.parseObject = function (o) {
    let geom, rec
    if (!o || !o.type) {
      geom = null
    } else if (o.type === 'Feature') {
      geom = o.geometry
      rec = o.properties || {}
      if ('id' in o) {
        rec[idField] = o.id
      }
    } else {
      geom = o
    }
    importer.startShape(rec)
    if (geom) GeoJSON.importGeometry(geom, importer)
  }

  this.done = function () {
    return importer.done()
  }
}

const PathImporter = function () {
  const bufSize = 20000
  let xx = new Float64Array(bufSize)
  let yy = new Float64Array(bufSize)
  const shapes = []
  const properties = []
  const nn = []
  const types = []
  let collectionType = null
  const round = null
  let pathId = -1
  let shapeId = -1
  let pointId = 0
  let dupeCount = 0
  let openRingCount = 0
  // mix in #addPoint() and #endPath() methods
  ;(function (o) {
    const dest = o || {}
    const n = arguments.length
    let key
    let i
    let src
    for (i = 1; i < n; i++) {
      src = arguments[i] || {}
      for (key in src) {
        if (src.hasOwnProperty(key)) {
          dest[key] = src[key]
        }
      }
    }
    return dest
  })(this, new PathImportStream(importPathCoords))

  this.startShape = function (d) {
    shapes[++shapeId] = null
    if (d) properties[shapeId] = d
  }

  this.importLine = function (points) {
    if (points.length < 2) {
      console.log('Skipping a defective line')
      return
    }
    setShapeType('polyline')
    this.importPath(points)
  }

  this.importPoints = function (points) {
    setShapeType('point')
    points = points.filter(function (p) {
      return p[0] > -1e38 && p[1] > -1e38
    })
    if (round) {
      points.forEach(function (p) {
        p[0] = round(p[0])
        p[1] = round(p[1])
      })
    }
    points.forEach(appendToShape)
  }

  this.importRing = function (points, isHole) {
    const area = (function (points) {
      let sum = 0
      let ax
      let ay
      let bx
      let by
      let dx
      let dy
      let p
      for (let i = 0, n = points.length; i < n; i++) {
        p = points[i]
        if (i === 0) {
          ax = 0
          ay = 0
          dx = -p[0]
          dy = -p[1]
        } else {
          ax = p[0] + dx
          ay = p[1] + dy
          sum += ax * by - bx * ay
        }
        bx = ax
        by = ay
      }
      return sum / 2
    })(points)
    if (!area || points.length < 4) {
      console.log('Skipping a defective ring')
      return
    }
    setShapeType('polygon')
    if ((isHole === true && area > 0) || (isHole === false && area < 0)) {
      // GeoJSON rings may be either direction -- no point in logging reversal
      // verbose("Reversing", isHole ? "a CW hole" : "a CCW ring");
      points.reverse()
    }
    this.importPath(points)
  }

  // Import an array of [x, y] Points
  this.importPath = function importPath(points) {
    let p
    for (let i = 0, n = points.length; i < n; i++) {
      p = points[i]
      this.addPoint(p[0], p[1])
    }
    this.endPath()
  }

  // Return imported dataset
  // Apply any requested snapping and rounding
  // Remove duplicate points, check for ring inversions
  //
  this.done = function () {
    const divideFeaturesByType = function (shapes, properties, types) {
      const typeSet = (function uniq(src) {
        const index = {}
        return src.reduce(function (memo, el) {
          if (el in index === false) {
            index[el] = true
            memo.push(el)
          }
          return memo
        }, [])
      })(types)
      return typeSet.map(function (geoType) {
        const p = []
        const s = []
        let dataNulls = 0
        let rec
        for (let i = 0, n = shapes.length; i < n; i++) {
          if (types[i] !== geoType) continue
          if (geoType) s.push(shapes[i])
          rec = properties[i]
          p.push(rec)
          if (!rec) dataNulls++
        }
        return {
          geometry_type: geoType,
          shapes: s,
          data: dataNulls < s.length ? new DataTable(p) : null,
        }
      })
    }
    let arcs
    let layers
    let lyr = { name: '' }

    if (dupeCount > 0) {
      console.log('Removed duplicate point(s).')
    }
    if (openRingCount > 0) {
      console.log('Closed open polygon ring(s).')
    }
    if (pointId > 0) {
      if (pointId < xx.length) {
        xx = xx.subarray(0, pointId)
        yy = yy.subarray(0, pointId)
      }
      arcs = new ArcCollection(nn, xx, yy)
    }

    if (collectionType === 'mixed') {
      layers = divideFeaturesByType(shapes, properties, types)
    } else {
      lyr = { geometry_type: collectionType }
      if (collectionType) {
        lyr.shapes = shapes
      }
      if (properties.length > 0) {
        lyr.data = new DataTable(properties)
      }
      layers = [lyr]
    }

    const findIncompleteFields = function (records) {
      const counts = {}
      let i
      let j
      let keys
      for (i = 0; i < records.length; i++) {
        keys = Object.keys(records[i] || {})
        for (j = 0; j < keys.length; j++) {
          counts[keys[j]] = (counts[keys[j]] | 0) + 1
        }
      }
      return Object.keys(counts).filter(function (k) {
        return counts[k] < records.length
      })
    }

    const patchMissingFields = function (records, fields) {
      let rec, i, j, f
      for (i = 0; i < records.length; i++) {
        rec = records[i] || (records[i] = {})
        for (j = 0; j < fields.length; j++) {
          f = fields[j]
          if (f in rec === false) {
            rec[f] = undefined
          }
        }
      }
    }

    layers.forEach(function (lyr) {
      if (lyr.data) {
        ;(function (records) {
          const fields = findIncompleteFields(records)
          patchMissingFields(records, fields)
        })(lyr.data.getRecords())
      }
    })

    return {
      arcs: arcs || null,
      info: {},
      layers,
    }
  }

  function setShapeType(t) {
    const currType = shapeId < types.length ? types[shapeId] : null
    if (!currType) {
      types[shapeId] = t
      if (!collectionType) {
        collectionType = t
      } else if (t !== collectionType) {
        collectionType = 'mixed'
      }
    } else if (currType !== t) {
      stop('Unable to import mixed-geometry GeoJSON features')
    }
  }

  function checkBuffers(needed) {
    if (needed > xx.length) {
      const newLen = Math.max(needed, Math.ceil(xx.length * 1.5))
      xx = extendBuffer(xx, newLen, pointId)
      yy = extendBuffer(yy, newLen, pointId)
    }
  }

  function appendToShape(part) {
    const currShape = shapes[shapeId] || (shapes[shapeId] = [])
    currShape.push(part)
  }

  function appendPath(n) {
    pathId++
    nn[pathId] = n
    appendToShape([pathId])
  }

  function importPathCoords(xsrc, ysrc, n) {
    let count = 0
    let x, y, prevX, prevY
    checkBuffers(pointId + n)
    for (let i = 0; i < n; i++) {
      x = xsrc[i]
      y = ysrc[i]
      if (round) {
        x = round(x)
        y = round(y)
      }
      if (i > 0 && x === prevX && y === prevY) {
        dupeCount++
      } else {
        xx[pointId] = x
        yy[pointId] = y
        pointId++
        count++
      }
      prevY = y
      prevX = x
    }

    // check for open rings
    if (collectionType === 'polygon' && count > 0) {
      if (xsrc[0] !== xsrc[n - 1] || ysrc[0] !== ysrc[n - 1]) {
        checkBuffers(pointId + 1)
        xx[pointId] = xsrc[0]
        yy[pointId] = ysrc[0]
        openRingCount++
        pointId++
        count++
      }
    }

    appendPath(count)
  }
}

const PathImportStream = function (drain) {
  let buflen = 10000
  let xx = new Float64Array(buflen)
  let yy = new Float64Array(buflen)
  let i = 0

  this.endPath = function () {
    drain(xx, yy, i)
    i = 0
  }

  this.addPoint = function (x, y) {
    if (i >= buflen) {
      buflen = Math.ceil(buflen * 1.3)
      xx = extendBuffer(xx, buflen)
      yy = extendBuffer(yy, buflen)
    }
    xx[i] = x
    yy[i] = y
    i++
  }
}

const ArcCollection = function () {
  let _xx
  let _yy // coordinates data
  let _ii
  let _nn // indexes, sizes
  let _zz
  let _zlimit = 0 // simplification
  let _bb
  let _allBounds // bounding boxes
  let _arcIter
  let _filteredArcIter // path iterators

  if (arguments.length === 1) {
    initLegacyArcs(arguments[0]) // want to phase this out
  } else if (arguments.length === 3) {
    initXYData.apply(this, arguments)
  } else {
    console.log('ArcCollection() Invalid arguments')
  }

  function initLegacyArcs(arcs) {
    const xx = []
    const yy = []
    const nn = arcs.map(function (points) {
      const n = points ? points.length : 0
      for (let i = 0; i < n; i++) {
        xx.push(points[i][0])
        yy.push(points[i][1])
      }
      return n
    })
    initXYData(nn, xx, yy)
  }

  function initXYData(nn, xx, yy) {
    const size = nn.length
    if (nn instanceof Array) nn = new Uint32Array(nn)
    if (xx instanceof Array) xx = new Float64Array(xx)
    if (yy instanceof Array) yy = new Float64Array(yy)
    _xx = xx
    _yy = yy
    _nn = nn
    _zz = null
    _zlimit = 0
    _filteredArcIter = null

    // generate array of starting idxs of each arc
    _ii = new Uint32Array(size)
    for (var idx = 0, j = 0; j < size; j++) {
      _ii[j] = idx
      idx += nn[j]
    }

    if (idx !== _xx.length || _xx.length !== _yy.length) {
      console.log('ArcCollection#initXYData() Counting error')
    }

    initBounds()
    // Pre-allocate some path iterators for repeated use.
    _arcIter = new ArcIter(_xx, _yy)
    return this
  }

  function initZData(zz) {
    if (!zz) {
      _zz = null
      _zlimit = 0
      _filteredArcIter = null
    } else {
      if (zz.length !== _xx.length)
        console.log('ArcCollection#initZData() mismatched arrays')
      if (zz instanceof Array) zz = new Float64Array(zz)
      _zz = zz
      _filteredArcIter = new FilteredArcIter(_xx, _yy, _zz)
    }
  }

  function initBounds() {
    const data = calcArcBounds2(_xx, _yy, _nn)
    _bb = data.bb
    _allBounds = data.bounds
  }

  function calcArcBounds2(xx, yy, nn) {
    const numArcs = nn.length
    const bb = new Float64Array(numArcs * 4)
    const bounds = new Bounds()
    let arcOffs = 0
    let arcLen
    let j
    let b
    const calcArcBounds = function (xx, yy, start, len) {
      let i = start | 0
      const n = isNaN(len) ? xx.length - i : len + i
      let x
      let y
      let xmin
      let ymin
      let xmax
      let ymax
      if (n > 0) {
        xmin = xmax = xx[i]
        ymin = ymax = yy[i]
      }
      for (i++; i < n; i++) {
        x = xx[i]
        y = yy[i]
        if (x < xmin) xmin = x
        if (x > xmax) xmax = x
        if (y < ymin) ymin = y
        if (y > ymax) ymax = y
      }
      return [xmin, ymin, xmax, ymax]
    }
    for (let i = 0; i < numArcs; i++) {
      arcLen = nn[i]
      if (arcLen > 0) {
        j = i * 4
        b = calcArcBounds(xx, yy, arcOffs, arcLen)
        bb[j++] = b[0]
        bb[j++] = b[1]
        bb[j++] = b[2]
        bb[j] = b[3]
        arcOffs += arcLen
        bounds.mergeBounds(b)
      }
    }
    return {
      bb,
      bounds,
    }
  }

  this.updateVertexData = function (nn, xx, yy, zz) {
    initXYData(nn, xx, yy)
    initZData(zz || null)
  }

  // Give access to raw data arrays...
  this.getVertexData = function () {
    return {
      xx: _xx,
      yy: _yy,
      zz: _zz,
      bb: _bb,
      nn: _nn,
      ii: _ii,
    }
  }

  this.getCopy = function () {
    const copy = new ArcCollection(
      new Int32Array(_nn),
      new Float64Array(_xx),
      new Float64Array(_yy)
    )
    if (_zz) {
      copy.setThresholds(new Float64Array(_zz))
      copy.setRetainedInterval(_zlimit)
    }
    return copy
  }

  function getFilteredPointCount() {
    const zz = _zz
    const z = _zlimit
    if (!zz || !z) return this.getPointCount()
    let count = 0
    for (let i = 0, n = zz.length; i < n; i++) {
      if (zz[i] >= z) count++
    }
    return count
  }

  function getFilteredVertexData() {
    const len2 = getFilteredPointCount()
    const arcCount = _nn.length
    const xx2 = new Float64Array(len2)
    const yy2 = new Float64Array(len2)
    const zz2 = new Float64Array(len2)
    const nn2 = new Int32Array(arcCount)
    let i = 0
    let i2 = 0
    let n
    let n2

    for (let arcId = 0; arcId < arcCount; arcId++) {
      n2 = 0
      n = _nn[arcId]
      for (let end = i + n; i < end; i++) {
        if (_zz[i] >= _zlimit) {
          xx2[i2] = _xx[i]
          yy2[i2] = _yy[i]
          zz2[i2] = _zz[i]
          i2++
          n2++
        }
      }
      if (n2 === 1) {
        console.log('Collapsed arc')
      } else if (n2 === 0) {
        // collapsed arc... ignoring
      }
      nn2[arcId] = n2
    }
    return {
      xx: xx2,
      yy: yy2,
      zz: zz2,
      nn: nn2,
    }
  }

  this.getFilteredCopy = function () {
    if (!_zz || _zlimit === 0) return this.getCopy()
    const data = getFilteredVertexData()
    const copy = new ArcCollection(data.nn, data.xx, data.yy)
    copy.setThresholds(data.zz)
    return copy
  }

  // Return arcs as arrays of [x, y] points (intended for testing).
  this.toArray = function () {
    const arr = []
    this.forEach(function (iter) {
      const arc = []
      while (iter.hasNext()) {
        arc.push([iter.x, iter.y])
      }
      arr.push(arc)
    })
    return arr
  }

  this.toJSON = function () {
    return this.toArray()
  }

  // @cb function(i, j, xx, yy)
  this.forEachArcSegment = function (arcId, cb) {
    const fw = arcId >= 0
    const absId = fw ? arcId : ~arcId
    const zlim = this.getRetainedInterval()
    const n = _nn[absId]
    const step = fw ? 1 : -1
    let v1 = fw ? _ii[absId] : _ii[absId] + n - 1
    let v2 = v1
    const xx = _xx
    const yy = _yy
    const zz = _zz
    let count = 0

    for (let j = 1; j < n; j++) {
      v2 += step
      if (zlim === 0 || zz[v2] >= zlim) {
        cb(v1, v2, xx, yy)
        v1 = v2
        count++
      }
    }
    return count
  }

  // @cb function(i, j, xx, yy)
  this.forEachSegment = function (cb) {
    let count = 0
    for (let i = 0, n = this.size(); i < n; i++) {
      count += this.forEachArcSegment(i, cb)
    }
    return count
  }

  this.transformPoints = function (f) {
    const xx = _xx
    const yy = _yy
    let arcId = -1
    let n = 0
    let p
    for (let i = 0, len = xx.length; i < len; i++, n--) {
      while (n === 0) {
        n = _nn[++arcId]
      }
      p = f(xx[i], yy[i], arcId)
      if (p) {
        xx[i] = p[0]
        yy[i] = p[1]
      }
    }
    initBounds()
  }

  // Return an ArcIter object for each path in the dataset
  //
  this.forEach = function (cb) {
    for (let i = 0, n = this.size(); i < n; i++) {
      cb(this.getArcIter(i), i)
    }
  }

  // Iterate over arcs with access to low-level data
  //
  this.forEach2 = function (cb) {
    for (let arcId = 0, n = this.size(); arcId < n; arcId++) {
      cb(_ii[arcId], _nn[arcId], _xx, _yy, _zz, arcId)
    }
  }

  this.forEach3 = function (cb) {
    let start, end, xx, yy, zz
    for (let arcId = 0, n = this.size(); arcId < n; arcId++) {
      start = _ii[arcId]
      end = start + _nn[arcId]
      xx = _xx.subarray(start, end)
      yy = _yy.subarray(start, end)
      if (_zz) zz = _zz.subarray(start, end)
      cb(xx, yy, zz, arcId)
    }
  }

  this.filter = function (cb) {
    const test = function (i) {
      return cb(this.getArcIter(i), i)
    }.bind(this)
    return this.deleteArcs(test)
  }

  this.deleteArcs = function (test) {
    const n = this.size()
    const map = new Int32Array(n)
    let goodArcs = 0
    let goodPoints = 0
    for (let i = 0; i < n; i++) {
      if (test(i)) {
        map[i] = goodArcs++
        goodPoints += _nn[i]
      } else {
        map[i] = -1
      }
    }
    if (goodArcs < n) {
      condenseArcs(map)
    }
    return map
  }

  function condenseArcs(map) {
    let goodPoints = 0
    let goodArcs = 0
    let k
    let arcLen
    for (let i = 0, n = map.length; i < n; i++) {
      k = map[i]
      arcLen = _nn[i]
      if (k > -1) {
        copyElements(_xx, _ii[i], _xx, goodPoints, arcLen)
        copyElements(_yy, _ii[i], _yy, goodPoints, arcLen)
        if (_zz) copyElements(_zz, _ii[i], _zz, goodPoints, arcLen)
        _nn[k] = arcLen
        goodPoints += arcLen
        goodArcs++
      }
    }

    initXYData(
      _nn.subarray(0, goodArcs),
      _xx.subarray(0, goodPoints),
      _yy.subarray(0, goodPoints)
    )
    if (_zz) initZData(_zz.subarray(0, goodPoints))
  }

  this.dedupCoords = function () {
    let arcId = 0
    let i = 0
    let i2 = 0
    const arcCount = this.size()
    const zz = _zz
    let arcLen
    let arcLen2
    while (arcId < arcCount) {
      arcLen = _nn[arcId]
      arcLen2 = this.dedupArcCoords(i, i2, arcLen, _xx, _yy, zz)
      _nn[arcId] = arcLen2
      i += arcLen
      i2 += arcLen2
      arcId++
    }
    if (i > i2) {
      initXYData(_nn, _xx.subarray(0, i2), _yy.subarray(0, i2))
      if (zz) initZData(zz.subarray(0, i2))
    }
    return i - i2
  }

  this.dedupArcCoords = function (src, dest, arcLen, xx, yy, zz) {
    let n = 0
    let n2 = 0 // counters
    let x, y, i, j, keep
    while (n < arcLen) {
      j = src + n
      x = xx[j]
      y = yy[j]
      keep = x == x && y == y && (n2 === 0 || x != xx[j - 1] || y != yy[j - 1])
      if (keep) {
        i = dest + n2
        xx[i] = x
        yy[i] = y
        n2++
      }
      if (zz && n2 > 0 && (keep || zz[j] > zz[i])) {
        zz[i] = zz[j]
      }
      n++
    }
    return n2 > 1 ? n2 : 0
  }

  this.getVertex = function (arcId, nth) {
    const i = this.indexOfVertex(arcId, nth)
    return {
      x: _xx[i],
      y: _yy[i],
    }
  }

  // @nth: index of vertex. ~(idx) starts from the opposite endpoint
  this.indexOfVertex = function (arcId, nth) {
    const absId = arcId < 0 ? ~arcId : arcId
    const len = _nn[absId]
    if (nth < 0) nth = len + nth
    if (absId !== arcId) nth = len - nth - 1
    if (nth < 0 || nth >= len)
      console.log('[ArcCollection] out-of-range vertex id')
    return _ii[absId] + nth
  }

  // Tests if arc endpoints have same x, y coords
  // (arc may still have collapsed);
  this.arcIsClosed = function (arcId) {
    const i = this.indexOfVertex(arcId, 0)
    const j = this.indexOfVertex(arcId, -1)
    return i !== j && _xx[i] === _xx[j] && _yy[i] === _yy[j]
  }

  // Tests if first and last segments mirror each other
  // A 3-vertex arc with same endpoints tests true
  this.arcIsLollipop = function (arcId) {
    const len = this.getArcLength(arcId)
    if (len <= 2 || !this.arcIsClosed(arcId)) return false
    const i = this.indexOfVertex(arcId, 1)
    const j = this.indexOfVertex(arcId, -2)
    return _xx[i] === _xx[j] && _yy[i] === _yy[j]
  }

  this.arcIsDegenerate = function (arcId) {
    const iter = this.getArcIter(arcId)
    let i = 0
    let x
    let y
    while (iter.hasNext()) {
      if (i > 0) {
        if (x !== iter.x || y !== iter.y) return false
      }
      x = iter.x
      y = iter.y
      i++
    }
    return true
  }

  this.getArcLength = function (arcId) {
    return _nn[arcId >= 0 ? arcId : ~arcId]
  }

  this.getArcIter = function (arcId) {
    const fw = arcId >= 0
    const i = fw ? arcId : ~arcId
    const iter = _zz && _zlimit ? _filteredArcIter : _arcIter
    if (i >= _nn.length) {
      console.log('#getArcId() out-of-range arc id:', arcId)
    }
    return iter.init(_ii[i], _nn[i], fw, _zlimit)
  }

  this.getShapeIter = function (ids) {
    return new ShapeIter(this).init(ids)
  }

  this.setThresholds = function (thresholds) {
    const n = this.getPointCount()
    let zz = null
    if (!thresholds) {
      // nop
    } else if (thresholds.length === n) {
      zz = thresholds
    } else if (thresholds.length === this.size()) {
      zz = flattenThresholds(thresholds, n)
    } else {
      console.log('Invalid threshold data')
    }
    initZData(zz)
    return this
  }

  function flattenThresholds(arr, n) {
    const zz = new Float64Array(n)
    let i = 0
    arr.forEach(function (arr) {
      for (let j = 0, n = arr.length; j < n; i++, j++) {
        zz[i] = arr[j]
      }
    })
    if (i != n) error('Mismatched thresholds')
    return zz
  }

  // bake in current simplification level, if any
  this.flatten = function () {
    if (_zlimit > 0) {
      const data = getFilteredVertexData()
      this.updateVertexData(data.nn, data.xx, data.yy)
      _zlimit = 0
    } else {
      _zz = null
    }
  }

  this.getRetainedInterval = function () {
    return _zlimit
  }

  this.setRetainedInterval = function (z) {
    _zlimit = z
    return this
  }

  this.getRetainedPct = function () {
    return this.getPctByThreshold(_zlimit)
  }

  this.setRetainedPct = function (pct) {
    const clampIntervalByPct = function (z, pct) {
      if (pct <= 0) z = Infinity
      else if (pct >= 1) z = 0
      return z
    }
    if (pct >= 1) {
      _zlimit = 0
    } else {
      _zlimit = this.getThresholdByPct(pct)
      _zlimit = clampIntervalByPct(_zlimit, pct)
    }
    return this
  }

  this.getRemovableThresholds = function (nth) {
    if (!_zz) console.log('[arcs] Missing simplification data.')
    const skip = nth | 1
    const arr = new Float64Array(Math.ceil(_zz.length / skip))
    let z
    for (var i = 0, j = 0, n = this.getPointCount(); i < n; i += skip) {
      z = _zz[i]
      if (z != Infinity) {
        arr[j++] = z
      }
    }
    return arr.subarray(0, j)
  }

  this.getArcThresholds = function (arcId) {
    if (!(arcId >= 0 && arcId < this.size())) {
      console.log('[arcs] Invalid arc id:', arcId)
    }
    const start = _ii[arcId]
    const end = start + _nn[arcId]
    return _zz.subarray(start, end)
  }

  // nth (optional): sample every nth threshold (use estimate for speed)
  this.getPctByThreshold = function (val, nth) {
    let arr, rank, pct
    const findRankByValue = function (arr, value) {
      if (isNaN(value)) return arr.length
      let rank = 1
      for (let i = 0, n = arr.length; i < n; i++) {
        if (value > arr[i]) rank++
      }
      return rank
    }
    if (val > 0) {
      arr = this.getRemovableThresholds(nth)
      rank = findRankByValue(arr, val)
      pct = arr.length > 0 ? 1 - (rank - 1) / arr.length : 1
    } else {
      pct = 1
    }
    return pct
  }

  this.getThresholdByPct = (pct, nth) => {
    return this.getThresholdByPct(pct, this, nth)
  }

  this.arcIntersectsBBox = function (i, b1) {
    const b2 = _bb
    const j = i * 4
    return (
      b2[j] <= b1[2] &&
      b2[j + 2] >= b1[0] &&
      b2[j + 3] >= b1[1] &&
      b2[j + 1] <= b1[3]
    )
  }

  this.arcIsContained = function (i, b1) {
    const b2 = _bb
    const j = i * 4
    return (
      b2[j] >= b1[0] &&
      b2[j + 2] <= b1[2] &&
      b2[j + 1] >= b1[1] &&
      b2[j + 3] <= b1[3]
    )
  }

  this.arcIsSmaller = function (i, units) {
    const bb = _bb
    const j = i * 4
    return bb[j + 2] - bb[j] < units && bb[j + 3] - bb[j + 1] < units
  }

  // TODO: allow datasets in lat-lng coord range to be flagged as planar
  this.isPlanar = function () {
    return !probablyDecimalDegreeBounds(this.getBounds())
  }

  this.size = function () {
    return (_ii && _ii.length) || 0
  }

  this.getPointCount = function () {
    return (_xx && _xx.length) || 0
  }

  this.getFilteredPointCount = getFilteredPointCount

  this.getBounds = function () {
    return _allBounds.clone()
  }

  this.getSimpleShapeBounds = function (arcIds, bounds) {
    bounds = bounds || new Bounds()
    for (let i = 0, n = arcIds.length; i < n; i++) {
      this.mergeArcBounds(arcIds[i], bounds)
    }
    return bounds
  }

  this.getSimpleShapeBounds2 = function (arcIds, arr) {
    const bbox = arr || []
    const bb = _bb
    let id = (arcIds[0] >= 0 ? arcIds[0] : ~arcIds[0]) * 4
    bbox[0] = bb[id]
    bbox[1] = bb[++id]
    bbox[2] = bb[++id]
    bbox[3] = bb[++id]
    for (let i = 1, n = arcIds.length; i < n; i++) {
      id = (arcIds[i] >= 0 ? arcIds[i] : ~arcIds[i]) * 4
      if (bb[id] < bbox[0]) bbox[0] = bb[id]
      if (bb[++id] < bbox[1]) bbox[1] = bb[id]
      if (bb[++id] > bbox[2]) bbox[2] = bb[id]
      if (bb[++id] > bbox[3]) bbox[3] = bb[id]
    }
    return bbox
  }

  // TODO: move this and similar methods out of ArcCollection
  this.getMultiShapeBounds = function (shapeIds, bounds) {
    bounds = bounds || new Bounds()
    if (shapeIds) {
      // handle null shapes
      for (let i = 0, n = shapeIds.length; i < n; i++) {
        this.getSimpleShapeBounds(shapeIds[i], bounds)
      }
    }
    return bounds
  }

  this.mergeArcBounds = function (arcId, bounds) {
    if (arcId < 0) arcId = ~arcId
    const offs = arcId * 4
    bounds.mergeBounds(_bb[offs], _bb[offs + 1], _bb[offs + 2], _bb[offs + 3])
  }
}

class Transform {
  constructor() {
    this.mx = this.my = 1
    this.bx = this.by = 0
  }

  isNull() {
    return !this.mx || !this.my || isNaN(this.bx) || isNaN(this.by)
  }

  invert() {
    const inv = new Transform()
    inv.mx = 1 / this.mx
    inv.my = 1 / this.my
    inv.bx = -this.bx / this.mx
    inv.by = -this.by / this.my
    return inv
  }

  transform(x, y, xy) {
    xy = xy || []
    xy[0] = x * this.mx + this.bx
    xy[1] = y * this.my + this.by
    return xy
  }

  toString() {
    return JSON.stringify(Object.assign({}, this))
  }
}

class Bounds {
  constructor() {
    if (arguments.length > 0) {
      this.setBounds.apply(this, arguments)
    }
  }

  toString() {
    return JSON.stringify({
      xmin: this.xmin,
      xmax: this.xmax,
      ymin: this.ymin,
      ymax: this.ymax,
    })
  }

  toArray() {
    return this.hasBounds() ? [this.xmin, this.ymin, this.xmax, this.ymax] : []
  }

  hasBounds() {
    return this.xmin <= this.xmax && this.ymin <= this.ymax
  }

  sameBounds(bb) {
    return (
      bb &&
      this.xmin === bb.xmin &&
      this.xmax === bb.xmax &&
      this.ymin === bb.ymin &&
      this.ymax === bb.ymax
    )
  }

  width() {
    return this.xmax - this.xmin || 0
  }

  height() {
    return this.ymax - this.ymin || 0
  }

  area() {
    return this.width() * this.height() || 0
  }

  empty() {
    this.xmin = this.ymin = this.xmax = this.ymax = void 0
    return this
  }

  setBounds(a, b, c, d) {
    if (arguments.length === 1) {
      // assume first arg is a Bounds or array
      if (isArrayLike(a)) {
        b = a[1]
        c = a[2]
        d = a[3]
        a = a[0]
      } else {
        b = a.ymin
        c = a.xmax
        d = a.ymax
        a = a.xmin
      }
    }

    this.xmin = a
    this.ymin = b
    this.xmax = c
    this.ymax = d
    if (a > c || b > d) this.update()
    // error("Bounds#setBounds() min/max reversed:", a, b, c, d);
    return this
  }

  centerX() {
    return (this.xmin + this.xmax) * 0.5
  }

  centerY() {
    return (this.ymax + this.ymin) * 0.5
  }

  containsPoint(x, y) {
    return x >= this.xmin && x <= this.xmax && y <= this.ymax && y >= this.ymin
  }

  // intended to speed up slightly bubble symbol detection; could use intersects() instead
  // TODO: fix false positive where circle is just outside a corner of the box
  containsBufferedPoint(x, y, buf) {
    if (x + buf > this.xmin && x - buf < this.xmax) {
      if (y - buf < this.ymax && y + buf > this.ymin) {
        return true
      }
    }
    return false
  }

  intersects(bb) {
    return (
      bb.xmin <= this.xmax &&
      bb.xmax >= this.xmin &&
      bb.ymax >= this.ymin &&
      bb.ymin <= this.ymax
    )
  }

  contains(bb) {
    return (
      bb.xmin >= this.xmin &&
      bb.ymax <= this.ymax &&
      bb.xmax <= this.xmax &&
      bb.ymin >= this.ymin
    )
  }

  shift(x, y) {
    this.setBounds(this.xmin + x, this.ymin + y, this.xmax + x, this.ymax + y)
  }

  padBounds(a, b, c, d) {
    this.xmin -= a
    this.ymin -= b
    this.xmax += c
    this.ymax += d
  }

  scale(pct, pctY) {
    /*, focusX, focusY */
    const halfWidth = (this.xmax - this.xmin) * 0.5
    const halfHeight = (this.ymax - this.ymin) * 0.5
    const kx = pct - 1
    const ky = pctY === undefined ? kx : pctY - 1
    this.xmin -= halfWidth * kx
    this.ymin -= halfHeight * ky
    this.xmax += halfWidth * kx
    this.ymax += halfHeight * ky
  }

  clone() {
    return new Bounds(this.xmin, this.ymin, this.xmax, this.ymax)
  }

  clearBounds() {
    this.setBounds(new Bounds())
  }

  mergePoint(x, y) {
    if (this.xmin === void 0) {
      this.setBounds(x, y, x, y)
    } else {
      // this works even if x,y are NaN
      if (x < this.xmin) this.xmin = x
      else if (x > this.xmax) this.xmax = x

      if (y < this.ymin) this.ymin = y
      else if (y > this.ymax) this.ymax = y
    }
  }

  fillOut(aspect, focusX, focusY) {
    if (arguments.length < 3) {
      focusX = 0.5
      focusY = 0.5
    }
    const w = this.width()
    const h = this.height()
    const currAspect = w / h
    let pad
    if (isNaN(aspect) || aspect <= 0) {
      // error condition; don't pad
    } else if (currAspect < aspect) {
      // fill out x dimension
      pad = h * aspect - w
      this.xmin -= (1 - focusX) * pad
      this.xmax += focusX * pad
    } else {
      pad = w / aspect - h
      this.ymin -= (1 - focusY) * pad
      this.ymax += focusY * pad
    }
    return this
  }

  update() {
    let tmp
    if (this.xmin > this.xmax) {
      tmp = this.xmin
      this.xmin = this.xmax
      this.xmax = tmp
    }
    if (this.ymin > this.ymax) {
      tmp = this.ymin
      this.ymin = this.ymax
      this.ymax = tmp
    }
  }

  transform(t) {
    this.xmin = this.xmin * t.mx + t.bx
    this.xmax = this.xmax * t.mx + t.bx
    this.ymin = this.ymin * t.my + t.by
    this.ymax = this.ymax * t.my + t.by
    this.update()
    return this
  }

  getTransform(b2, flipY) {
    const t = new Transform()
    t.mx = b2.width() / this.width() || 1 // TODO: better handling of 0 w,h
    t.bx = b2.xmin - t.mx * this.xmin
    if (flipY) {
      t.my = -b2.height() / this.height() || 1
      t.by = b2.ymax - t.my * this.ymin
    } else {
      t.my = b2.height() / this.height() || 1
      t.by = b2.ymin - t.my * this.ymin
    }
    return t
  }

  mergeCircle(x, y, r) {
    if (r < 0) r = -r
    this.mergeBounds([x - r, y - r, x + r, y + r])
  }

  mergeBounds(bb) {
    let a, b, c, d
    if (bb instanceof Bounds) {
      a = bb.xmin
      b = bb.ymin
      c = bb.xmax
      d = bb.ymax
    } else if (arguments.length === 4) {
      a = arguments[0]
      b = arguments[1]
      c = arguments[2]
      d = arguments[3]
    } else if (bb.length === 4) {
      // assume array: [xmin, ymin, xmax, ymax]
      a = bb[0]
      b = bb[1]
      c = bb[2]
      d = bb[3]
    } else {
      console.log('Bounds#mergeBounds() invalid argument:', bb)
    }

    if (this.xmin === void 0) {
      this.setBounds(a, b, c, d)
    } else {
      if (a < this.xmin) this.xmin = a
      if (b < this.ymin) this.ymin = b
      if (c > this.xmax) this.xmax = c
      if (d > this.ymax) this.ymax = d
    }
    return this
  }
}

const DataTable = function (obj) {
  let records
  if (Array.isArray(obj)) {
    records = obj
  } else {
    records = []
    // integer object: create empty records
    if (obj != null && obj.constructor === Number && (obj | 0) === obj) {
      for (let i = 0; i < obj; i++) {
        records.push({})
      }
    } else if (obj) {
      console.log('Invalid DataTable constructor argument:', obj)
    }
  }

  this.getRecords = function () {
    return records
  }

  // Same-name method in ShapefileTable doesn't require parsing the entire DBF file
  this.getReadOnlyRecordAt = function (i) {
    return copyRecord(records[i]) // deep-copies plain objects but not other constructed objects
  }

  this.fieldExists = function (name) {
    return (function (container, item) {
      if (
        container != null &&
        container.toString === String.prototype.toString
      ) {
        return container.indexOf(item) !== -1
      } else if (isArrayLike(container)) {
        return (
          (function (arr, item) {
            for (let i = 0, len = arr.length || 0; i < len; i++) {
              if (arr[i] === item) return i
            }
            return -1
          })(container, item) !== -1
        )
      }
      console.log('Expected Array or String argument')
    })(this.getFields(), name)
  }

  this.toString = function () {
    return JSON.stringify(this)
  }

  this.toJSON = function () {
    return this.getRecords()
  }

  this.addField = function (name, init) {
    const useFunction = typeof init === 'function'
    if (
      !(init != null && init.constructor === Number) &&
      !(init != null && init.toString === String.prototype.toString) &&
      !useFunction
    ) {
      console.log(
        'DataTable#addField() requires a string, number or function for initialization'
      )
    }
    if (this.fieldExists(name))
      console.log(
        'DataTable#addField() tried to add a field that already exists:',
        name
      )
    // var dataFieldRxp = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
    // if (!dataFieldRxp.test(name)) error("DataTable#addField() invalid field name:", name);

    this.getRecords().forEach(function (obj, i) {
      obj[name] = useFunction ? init(obj, i) : init
    })
  }

  this.getRecordAt = function (i) {
    return this.getRecords()[i]
  }

  this.addIdField = function () {
    this.addField('FID', function (obj, i) {
      return i
    })
  }

  this.deleteField = function (f) {
    this.getRecords().forEach(function (o) {
      delete o[f]
    })
  }

  this.getFields = function () {
    const applyFieldOrder = function (arr, option) {
      if (option === 'ascending') {
        arr.sort(function (a, b) {
          return a.toLowerCase() < b.toLowerCase() ? -1 : 1
        })
      }
      return arr
    }
    return (function (records, order) {
      const first = records[0]
      const names = first ? Object.keys(first) : []
      return applyFieldOrder(names, order)
    })(this.getRecords())
  }

  this.isEmpty = function () {
    return this.getFields().length === 0 || this.size() === 0
  }

  this.update = function (f) {
    const records = this.getRecords()
    for (let i = 0, n = records.length; i < n; i++) {
      records[i] = f(records[i], i)
    }
  }

  this.clone = function () {
    // TODO: this could be sped up using a record constructor function
    // (see getRecordConstructor() in DbfReader)
    const records2 = this.getRecords().map(copyRecord)
    return new DataTable(records2)
  }

  this.size = function () {
    return this.getRecords().length
  }
}

const copyRecord = function (o) {
  const o2 = {}
  let key
  let val
  if (!o) return null
  for (key in o) {
    if (o.hasOwnProperty(key)) {
      val = o[key]
      if (val === o) {
        // avoid infinite recursion if val is a circular reference, by copying all properties except key
        val = extendUtil({}, val)
        delete val[key]
      }
      o2[key] = val && val.constructor === Object ? copyRecord(val) : val
    }
  }
  return o2
}

const extendBuffer = function (src, newLen, copyLen) {
  const len = Math.max(src.length, newLen)
  const n = copyLen || src.length
  const dest = new src.constructor(len)
  copyElements(src, 0, dest, 0, n)
  return dest
}

const copyElements = function (src, i, dest, j, n, rev) {
  if (src === dest && j > i) console.log('copy error')
  let inc = 1
  let offs = 0
  if (rev) {
    inc = -1
    offs = n - 1
  }
  for (let k = 0; k < n; k++, offs += inc) {
    dest[k + j] = src[i + offs]
  }
}

function ShapeIter(arcs) {
  this._arcs = arcs
  this._i = 0
  this._n = 0
  this.x = 0
  this.y = 0
  this.hasNext = function () {
    const arc = this._arc
    if (this._i < this._n === false) {
      return false
    }
    if (arc.hasNext()) {
      this.x = arc.x
      this.y = arc.y
      return true
    }
    this.nextArc()
    return this.hasNext()
  }
  this.init = function (ids) {
    this._ids = ids
    this._n = ids.length
    this.reset()
    return this
  }

  this.nextArc = function () {
    const i = this._i + 1
    if (i < this._n) {
      this._arc = this._arcs.getArcIter(this._ids[i])
      if (i > 0) this._arc.hasNext() // skip first point
    }
    this._i = i
  }

  this.reset = function () {
    this._i = -1
    this.nextArc()
  }
}

const FilteredArcIter = function (xx, yy, zz) {
  let _zlim = 0
  let _i = 0
  let _inc = 1
  let _stop = 0

  this.init = function (i, len, fw, zlim) {
    _zlim = zlim || 0
    if (fw) {
      _i = i
      _inc = 1
      _stop = i + len
    } else {
      _i = i + len - 1
      _inc = -1
      _stop = i - 1
    }
    return this
  }

  this.hasNext = function () {
    const zarr = zz
    const i = _i
    let j = i
    const zlim = _zlim
    const stop = _stop
    const inc = _inc
    if (i === stop) return false
    do {
      j += inc
    } while (j !== stop && zarr[j] < zlim)
    _i = j
    this.x = xx[i]
    this.y = yy[i]
    this.i = i
    return true
  }
}

const ArcIter = function (xx, yy) {
  this._i = 0
  this._n = 0
  this._inc = 1
  this._xx = xx
  this._yy = yy
  this.i = 0
  this.x = 0
  this.y = 0

  this.init = function (i, len, fw) {
    if (fw) {
      this._i = i
      this._inc = 1
    } else {
      this._i = i + len - 1
      this._inc = -1
    }
    this._n = len
    return this
  }

  this.hasNext = function () {
    const i = this._i
    if (this._n > 0) {
      this._i = i + this._inc
      this.x = this._xx[i]
      this.y = this._yy[i]
      this.i = i
      this._n--
      return true
    }
    return false
  }
}

const isArrayLike = function (obj) {
  if (!obj) return false
  if (Array.isArray(obj)) return true
  if (obj != null && obj.toString === String.prototype.toString) return false
  if (obj.length === 0) return true
  return obj.length > 0
}

const ArcIndex = function (pointCount) {
  const hashTableSize = Math.floor(pointCount * 0.25 + 1)
  const hash = getXYHash(hashTableSize)
  const hashTable = new Int32Array(hashTableSize)
  const chainIds = []
  const arcs = []
  let arcPoints = 0

  initializeArray(hashTable, -1)

  this.addArc = function (xx, yy) {
    const end = xx.length - 1
    const key = hash(xx[end], yy[end])
    const chainId = hashTable[key]
    const arcId = arcs.length
    hashTable[key] = arcId
    arcs.push([xx, yy])
    arcPoints += xx.length
    chainIds.push(chainId)
    return arcId
  }

  this.findDuplicateArc = function (xx, yy, start, end, getNext, getPrev) {
    let arcId = findArcNeighbor(xx, yy, start, end, getNext)
    if (arcId === null) {
      arcId = findArcNeighbor(xx, yy, end, start, getPrev)
    } else {
      arcId = ~arcId
    }
    return arcId
  }

  function findArcNeighbor(xx, yy, start, end, getNext) {
    const next = getNext(start)
    const key = hash(xx[start], yy[start])
    let arcId = hashTable[key]
    let arcX
    let arcY
    let len

    while (arcId != -1) {
      arcX = arcs[arcId][0]
      arcY = arcs[arcId][1]
      len = arcX.length
      if (
        arcX[0] === xx[end] &&
        arcX[len - 1] === xx[start] &&
        arcX[len - 2] === xx[next] &&
        arcY[0] === yy[end] &&
        arcY[len - 1] === yy[start] &&
        arcY[len - 2] === yy[next]
      ) {
        return arcId
      }
      arcId = chainIds[arcId]
    }
    return null
  }

  this.getVertexData = function () {
    const xx = new Float64Array(arcPoints)
    const yy = new Float64Array(arcPoints)
    const nn = new Uint32Array(arcs.length)
    let copied = 0
    let arc
    let len
    for (let i = 0, n = arcs.length; i < n; i++) {
      arc = arcs[i]
      len = arc[0].length
      copyElements(arc[0], 0, xx, copied, len)
      copyElements(arc[1], 0, yy, copied, len)
      nn[i] = len
      copied += len
    }
    return {
      xx,
      yy,
      nn,
    }
  }
}

const initializeArray = function (arr, init) {
  for (let i = 0, len = arr.length; i < len; i++) {
    arr[i] = init
  }
  return arr
}

const getXYHash = function (size) {
  const buf = new ArrayBuffer(16)
  const floats = new Float64Array(buf)
  const uints = new Uint32Array(buf)
  const lim = size | 0
  if (lim > 0 === false) {
    throw new Error('Invalid size param: ' + size)
  }

  return function (x, y) {
    const u = uints
    let h
    floats[0] = x
    floats[1] = y
    h = u[0] ^ u[1]
    h = (h << 5) ^ (h >> 7) ^ u[2] ^ u[3]
    return (h & 0x7fffffff) % lim
  }
}

const extendUtil = function (o) {
  const dest = o || {}
  const n = arguments.length
  let key
  let i
  let src
  for (i = 1; i < n; i++) {
    src = arguments[i] || {}
    for (key in src) {
      if (src.hasOwnProperty(key)) {
        dest[key] = src[key]
      }
    }
  }
  return dest
}

const numToStr = function (num, decimals) {
  return decimals >= 0 ? num.toFixed(decimals) : String(num)
}

const addThousandsSep = function (str) {
  let fmt = ''
  const start = str[0] === '-' ? 1 : 0
  const dec = str.indexOf('.')
  let end = str.length
  let ins = (dec === -1 ? end : dec) - 3
  while (ins > start) {
    fmt = ',' + str.substring(ins, end) + fmt
    end = ins
    ins -= 3
  }
  return str.substring(0, end) + fmt
}

const repeatString = function (src, n) {
  let str = ''
  for (let i = 0; i < n; i++) str += src
  return str
}

const formatValue = function (val, matches) {
  const flags = matches[1]
  const padding = matches[2]
  const decimals = matches[3] ? parseInt(matches[3].substr(1)) : void 0
  const type = matches[4]
  const isString = type === 's'
  const isHex = type === 'x' || type === 'X'
  const isInt = type === 'd' || type === 'i'
  const isNumber = !isString

  let sign = ''
  let padDigits = 0
  let isZero = false
  let isNeg = false

  let str, padChar, padStr
  if (isString) {
    str = String(val)
  } else if (isHex) {
    str = val.toString(16)
    if (type === 'X') str = str.toUpperCase()
  } else if (isNumber) {
    str = numToStr(val, isInt ? 0 : decimals)
    if (str[0] === '-') {
      isNeg = true
      str = str.substr(1)
    }
    isZero = parseFloat(str) == 0
    if (flags.indexOf("'") !== -1 || flags.indexOf(',') !== -1) {
      str = addThousandsSep(str)
    }
    if (!isZero) {
      // BUG: sign is added when num rounds to 0
      if (isNeg) {
        sign = '\u2212' // U+2212
      } else if (flags.indexOf('+') !== -1) {
        sign = '+'
      }
    }
  }

  if (padding) {
    const strLen = str.length + sign.length
    const minWidth = parseInt(padding, 10)
    if (strLen < minWidth) {
      padDigits = minWidth - strLen
      padChar = flags.indexOf('0') === -1 ? ' ' : '0'
      padStr = repeatString(padChar, padDigits)
    }
  }

  if (padDigits == 0) {
    str = sign + str
  } else if (padChar == '0') {
    str = sign + padStr + str
  } else {
    str = padStr + sign + str
  }
  return str
}

const formatter = function (fmt) {
  const codeRxp = /%([\',+0]*)([1-9]?)((?:\.[1-9])?)([sdifxX%])/g
  const literals = []
  const formatCodes = []
  let startIdx = 0
  let prefix = ''
  let matches = codeRxp.exec(fmt)
  let literal

  while (matches) {
    literal = fmt.substring(startIdx, codeRxp.lastIndex - matches[0].length)
    if (matches[0] === '%%') {
      prefix += literal + '%'
    } else {
      literals.push(prefix + literal)
      prefix = ''
      formatCodes.push(matches)
    }
    startIdx = codeRxp.lastIndex
    matches = codeRxp.exec(fmt)
  }
  literals.push(prefix + fmt.substr(startIdx))

  return function () {
    let str = literals[0]
    const n = arguments.length
    if (n !== formatCodes.length) {
      console.log(
        '[format()] Data does not match format string; format:',
        fmt,
        'data:',
        arguments
      )
    }
    for (let i = 0; i < n; i++) {
      str += formatValue(arguments[i], formatCodes[i]) + literals[i + 1]
    }
    return str
  }
}

const format = function (fmt) {
  const fn = formatter(fmt)
  return fn.apply(null, Array.prototype.slice.call(arguments, 1))
}

export default {
  methods: {
    geoJSONToSVG(input, width, height) {
      let svg
      try {
        const dataset = this.importContent(input)
        svg = this.exportSVG(dataset, width, height)
      } catch (err) {
        console.log('Coverage creation failed:', err)
        svg =
          '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 0 0" width="0pt" height="0pt"/>'
      }
      return svg
    },
    importContent(input) {
      const dataset = this.importGeoJSON(input)
      this.cleanPathsAfterImport(dataset)
      if (!dataset) {
        console.log('Missing an expected input type')
        return
      }
      if (dataset.arcs) {
        this.buildTopology(dataset)
      }
      dataset.layers.forEach(function (lyr, index) {
        lyr.name = 'coverage_' + index
      })
      dataset.info.input_formats = ['geojson']
      return dataset
    },
    importGeoJSON(src) {
      const supportedGeometries = Object.keys(GeoJSON.pathImporters)
      const srcObj =
        src != null && src.toString === String.prototype.toString
          ? JSON.parse(src)
          : src
      const importer = new GeoJSONParser()
      let srcCollection

      // Convert single feature or geometry into a collection with one member
      if (srcObj.type === 'Feature') {
        srcCollection = {
          type: 'FeatureCollection',
          features: [srcObj],
        }
      } else if (supportedGeometries.includes(srcObj.type)) {
        srcCollection = {
          type: 'GeometryCollection',
          geometries: [srcObj],
        }
      } else {
        srcCollection = srcObj
      }
      ;(srcCollection.features || srcCollection.geometries || []).forEach(
        importer.parseObject
      )
      const dataset = importer.done()
      if ('crs' in srcObj) {
        dataset.info.input_geojson_crs = srcObj.crs
      }
      return dataset
    },
    cleanPathsAfterImport(dataset) {
      const arcs = dataset.arcs
      dataset.layers.forEach((lyr) => {
        if (this.layerHasPaths(lyr)) {
          this.cleanShapes(lyr.shapes, arcs, lyr.geometry_type)
        }
      })
    },
    layerHasPaths(lyr) {
      return (
        (lyr.geometry_type === 'polygon' || lyr.geometry_type === 'polyline') &&
        this.layerHasNonNullShapes(lyr)
      )
    },
    layerHasNonNullShapes(lyr) {
      return this.someUtil(lyr.shapes || [], function (shp) {
        return !!shp
      })
    },
    someUtil(arr, test) {
      return arr.reduce(function (val, item) {
        return val || test(item) // TODO: short-circuit?
      }, false)
    },
    cleanShapes(shapes, arcs, type) {
      for (let i = 0, n = shapes.length; i < n; i++) {
        shapes[i] = this.cleanShape(shapes[i], arcs, type)
      }
    },
    cleanShape(shape, arcs, type) {
      return this.editShapeParts(shape, function (path) {
        const cleanPath = function (path, arcs) {
          let nulls = 0
          for (let i = 0, n = path.length; i < n; i++) {
            if (arcs.arcIsDegenerate(path[i])) {
              nulls++
              path[i] = null
            }
          }
          return nulls > 0
            ? path.filter(function (id) {
                return id !== null
              })
            : path
        }
        let cleaned = cleanPath(path, arcs)
        const removeSpikesInPath = function (ids) {
          const n = ids.length
          if (n >= 2) {
            if (ids[0] === ~ids[n - 1]) {
              ids.pop()
              ids.shift()
            } else {
              for (let i = 1; i < n; i++) {
                if (ids[i - 1] === ~ids[i]) {
                  ids.splice(i - 1, 2)
                  break
                }
              }
            }
            if (ids.length < n) {
              removeSpikesInPath(ids)
            }
          }
        }
        const getPlanarPathArea = function (ids, arcs) {
          const iter = arcs.getShapeIter(ids)
          let sum = 0
          let ax
          let ay
          let bx
          let by
          let dx
          let dy
          if (iter.hasNext()) {
            ax = 0
            ay = 0
            dx = -iter.x
            dy = -iter.y
            while (iter.hasNext()) {
              bx = ax
              by = ay
              ax = iter.x + dx
              ay = iter.y + dy
              sum += ax * by - bx * ay
            }
          }
          return sum / 2
        }
        if (type === 'polygon' && cleaned) {
          removeSpikesInPath(cleaned) // assumed by addIntersectionCuts()
          if (getPlanarPathArea(cleaned, arcs) === 0) {
            cleaned = null
          }
        }
        return cleaned
      })
    },
    editShapeParts(parts, cb) {
      if (!parts) return null // null geometry not edited
      if (!Array.isArray(parts)) {
        console.log('Expected an array, received:', parts)
      }
      let nulls = 0
      const n = parts.length
      let retn

      for (let i = 0; i < n; i++) {
        retn = cb(parts[i], i, parts)
        if (retn === null) {
          nulls++
          parts[i] = null
        } else if (Array.isArray(retn)) {
          parts[i] = retn
        }
      }
      if (nulls === n) {
        return null
      } else if (nulls > 0) {
        return parts.filter(function (part) {
          return !!part
        })
      } else {
        return parts
      }
    },
    buildTopology(dataset) {
      if (!dataset.arcs) return
      const raw = dataset.arcs.getVertexData()
      const cooked = this.buildPathTopology(raw.nn, raw.xx, raw.yy)
      dataset.arcs.updateVertexData(cooked.nn, cooked.xx, cooked.yy)
      dataset.layers.forEach((lyr) => {
        if (
          lyr.geometry_type === 'polyline' ||
          lyr.geometry_type === 'polygon'
        ) {
          lyr.shapes = this.replaceArcIds(lyr.shapes, cooked.paths)
        }
      })
    },
    replaceArcIds(src, replacements) {
      const replaceArcsInPath = function (path, replacements) {
        return path.reduce(function (memo, id) {
          const abs = id >= 0 ? id : ~id
          let topoPath = replacements[abs]
          if (topoPath) {
            if (id < 0) {
              topoPath = topoPath.concat()
              ;(function (ids) {
                ids.reverse()
                for (let i = 0, n = ids.length; i < n; i++) {
                  ids[i] = ~ids[i]
                }
                return ids
              })(topoPath)
            }
            for (let i = 0, n = topoPath.length; i < n; i++) {
              memo.push(topoPath[i])
            }
          }
          return memo
        }, [])
      }
      const replaceArcsInShape = function (shape, replacements) {
        if (!shape) return null
        return shape.map(function (path) {
          return replaceArcsInPath(path, replacements)
        })
      }
      return src.map(function (shape) {
        return replaceArcsInShape(shape, replacements)
      })
    },
    buildPathTopology(nn, xx, yy) {
      const pointCount = xx.length
      const chainIds = this.initPointChains(xx, yy)
      const pathIds = this.initPathIds(pointCount, nn)
      const index = new ArcIndex(pointCount)
      const slice = usingTypedArrays() ? xx.subarray : Array.prototype.slice
      const paths = convertPaths(nn)
      const retn = index.getVertexData()
      retn.paths = paths
      return retn

      function usingTypedArrays() {
        return !!(xx.subarray && yy.subarray)
      }

      function convertPaths(nn) {
        const paths = []
        let pointId = 0
        let pathLen
        for (let i = 0, len = nn.length; i < len; i++) {
          pathLen = nn[i]
          paths.push(
            pathLen < 2 ? null : convertPath(pointId, pointId + pathLen - 1)
          )
          pointId += pathLen
        }
        return paths
      }

      function nextPoint(id) {
        const partId = pathIds[id]
        const nextId = id + 1
        if (nextId < pointCount && pathIds[nextId] === partId) {
          return id + 1
        }
        const len = nn[partId]
        return sameXY(id, id - len + 1) ? id - len + 2 : -1
      }

      function prevPoint(id) {
        const partId = pathIds[id]
        const prevId = id - 1
        if (prevId >= 0 && pathIds[prevId] === partId) {
          return id - 1
        }
        const len = nn[partId]
        return sameXY(id, id + len - 1) ? id + len - 2 : -1
      }

      function sameXY(a, b) {
        return xx[a] == xx[b] && yy[a] == yy[b]
      }

      // Convert a non-topological path to one or more topological arcs
      // @start, @end are ids of first and last points in the path
      // TODO: don't allow id ~id pairs
      //
      function convertPath(start, end) {
        const arcIds = []
        let firstNodeId = -1
        let arcStartId

        // Visit each point in the path, up to but not including the last point
        for (let i = start; i < end; i++) {
          if (pointIsArcEndpoint(i)) {
            if (firstNodeId > -1) {
              arcIds.push(addEdge(arcStartId, i))
            } else {
              firstNodeId = i
            }
            arcStartId = i
          }
        }

        // Identify the final arc in the path
        if (firstNodeId === -1) {
          // Not in an arc, i.e. no nodes have been found...
          // Assuming that path is either an island or is congruent with one or more rings
          arcIds.push(addRing(start, end))
        } else if (firstNodeId === start) {
          // path endpoint is a node;
          if (!pointIsArcEndpoint(end)) {
            console.log('Topology error') // TODO: better error handling
          }
          arcIds.push(addEdge(arcStartId, i))
        } else {
          // final arc wraps around
          arcIds.push(addSplitEdge(arcStartId, end, start + 1, firstNodeId))
        }
        return arcIds
      }

      // Test if a point @id is an endpoint of a topological path
      function pointIsArcEndpoint(id) {
        let id2 = chainIds[id]
        const prev = prevPoint(id)
        const next = nextPoint(id)
        let prev2
        let next2
        if (prev === -1 || next === -1) {
          // @id is an endpoint if it is the start or end of an open path
          return true
        }
        while (id !== id2) {
          prev2 = prevPoint(id2)
          next2 = nextPoint(id2)
          if (
            prev2 === -1 ||
            next2 === -1 ||
            brokenEdge(prev, next, prev2, next2)
          ) {
            // there is a discontinuity at @id -- point is arc endpoint
            return true
          }
          id2 = chainIds[id2]
        }
        return false
      }

      // a and b are two vertices with the same x, y coordinates
      // test if the segments on either side of them are also identical
      function brokenEdge(aprev, anext, bprev, bnext) {
        const apx = xx[aprev]
        const anx = xx[anext]
        const bpx = xx[bprev]
        const bnx = xx[bnext]
        const apy = yy[aprev]
        const any = yy[anext]
        const bpy = yy[bprev]
        const bny = yy[bnext]
        return !(
          (apx == bnx && anx == bpx && apy == bny && any == bpy) ||
          (apx == bpx && anx == bnx && apy == bpy && any == bny)
        )
      }

      function mergeArcParts(src, startId, endId, startId2, endId2) {
        const len = endId - startId + endId2 - startId2 + 2
        const ArrayClass = usingTypedArrays() ? Float64Array : Array
        const dest = new ArrayClass(len)
        let j = 0
        let i
        for (i = startId; i <= endId; i++) {
          dest[j++] = src[i]
        }
        for (i = startId2; i <= endId2; i++) {
          dest[j++] = src[i]
        }
        return dest
      }

      function addSplitEdge(start1, end1, start2, end2) {
        let arcId = index.findDuplicateArc(
          xx,
          yy,
          start1,
          end2,
          nextPoint,
          prevPoint
        )
        if (arcId === null) {
          arcId = index.addArc(
            mergeArcParts(xx, start1, end1, start2, end2),
            mergeArcParts(yy, start1, end1, start2, end2)
          )
        }
        return arcId
      }

      function addEdge(start, end) {
        // search for a matching edge that has already been generated
        let arcId = index.findDuplicateArc(
          xx,
          yy,
          start,
          end,
          nextPoint,
          prevPoint
        )
        if (arcId === null) {
          arcId = index.addArc(
            slice.call(xx, start, end + 1),
            slice.call(yy, start, end + 1)
          )
        }
        return arcId
      }

      function addRing(startId, endId) {
        let chainId = chainIds[startId]
        const pathId = pathIds[startId]
        let arcId

        while (chainId != startId) {
          if (pathIds[chainId] < pathId) {
            break
          }
          chainId = chainIds[chainId]
        }

        if (chainId == startId) {
          return addEdge(startId, endId)
        }

        for (let i = startId; i < endId; i++) {
          arcId = index.findDuplicateArc(xx, yy, i, i, nextPoint, prevPoint)
          if (arcId !== null) return arcId
        }
        console.log('Unmatched ring; id:', pathId, 'len:', nn[pathId])
      }
    },
    initPointChains(xx, yy) {
      const chainIds = this.initHashChains(xx, yy)
      let j
      let next
      let prevMatchId
      let prevUnmatchId

      // disentangle, reverse and close the chains created by initHashChains()
      for (let i = xx.length - 1; i >= 0; i--) {
        next = chainIds[i]
        if (next >= i) continue
        prevMatchId = i
        prevUnmatchId = -1
        do {
          j = next
          next = chainIds[j]
          if (yy[j] === yy[i] && xx[j] === xx[i]) {
            chainIds[j] = prevMatchId
            prevMatchId = j
          } else {
            if (prevUnmatchId > -1) {
              chainIds[prevUnmatchId] = j
            }
            prevUnmatchId = j
          }
        } while (next < j)
        if (prevUnmatchId > -1) {
          // Make sure last unmatched entry is terminated
          chainIds[prevUnmatchId] = prevUnmatchId
        }
        chainIds[i] = prevMatchId // close the chain
      }
      return chainIds
    },
    initHashChains(xx, yy) {
      // Performance doesn't improve much above ~1.3 * point count
      const n = xx.length
      const m = Math.floor(n * 1.3) || 1
      const hash = getXYHash(m)
      const hashTable = new Int32Array(m)
      const chainIds = new Int32Array(n) // Array to be filled with chain data
      let key
      let j
      let i
      let x
      let y

      for (i = 0; i < n; i++) {
        x = xx[i]
        y = yy[i]
        if (x != x || y != y) {
          j = -1 // NaN coord: no hash entry, one-link chain
        } else {
          key = hash(x, y)
          j = hashTable[key] - 1 // coord ids are 1-based in hash table; 0 used as null value.
          hashTable[key] = i + 1
        }
        chainIds[i] = j >= 0 ? j : i // first item in a chain points to self
      }
      return chainIds
    },
    initPathIds(size, pathSizes) {
      const pathIds = new Int32Array(size)
      let j = 0
      for (
        let pathId = 0, pathCount = pathSizes.length;
        pathId < pathCount;
        pathId++
      ) {
        for (let i = 0, n = pathSizes[pathId]; i < n; i++, j++) {
          pathIds[j] = pathId
        }
      }
      return pathIds
    },

    exportSVG(dataset, width, height) {
      const template =
        '<?xml version="1.0"?>\n<svg %s ' +
        'version="1.2" baseProfile="tiny" width="%d" height="%d" viewBox="%s %s %s %s" stroke-linecap="round" stroke-linejoin="round">\n%s\n</svg>'
      let namespace = 'xmlns="http://www.w3.org/2000/svg"'
      const symbols = []
      const opts = {
        format: 'svg',
        width,
        height,
        output: [],
        invert_y: true,
      }

      dataset = this.copyDataset(dataset)
      const size = this.transformCoordsForSVG(dataset, opts)

      let svg = dataset.layers
        .map((lyr) => {
          const obj = this.exportLayerForSVG(lyr, dataset, opts)
          return this.stringify(obj)
        })
        .join('\n')
      if (symbols.length > 0) {
        namespace += ' xmlns:xlink="http://www.w3.org/1999/xlink"'
        svg =
          '<defs>\n' + this.pluck(symbols, 'svg').join('') + '</defs>\n' + svg
      }

      svg = format(
        template,
        namespace,
        size[0],
        size[1],
        0,
        0,
        size[0],
        size[1],
        svg
      )
      return svg
    },
    copyDataset(dataset) {
      const d2 = extendUtil({}, dataset)
      d2.layers = d2.layers.map(this.copyLayer)
      if (d2.arcs) {
        d2.arcs = d2.arcs.getFilteredCopy()
      }
      return d2
    },
    copyLayer(lyr) {
      const copy = this.copyLayerShapes(lyr)
      if (copy.data) {
        copy.data = copy.data.clone()
      }
      return copy
    },
    copyLayerShapes(lyr) {
      const copy = extendUtil({}, lyr)
      if (lyr.shapes) {
        copy.shapes = this.cloneShapes(lyr.shapes)
      }
      return copy
    },
    cloneShape(shp) {
      if (!shp) return null
      return shp.map(function (part) {
        return part.concat()
      })
    },
    cloneShapes(arr) {
      return Array.isArray(arr) ? arr.map(this.cloneShape) : null
    },
    pluck(arr, key) {
      return arr.map(function (obj) {
        return obj[key]
      })
    },
    transformCoordsForSVG(dataset, opts) {
      const size = this.transformDatasetToPixels(dataset, opts)
      const precision = opts.precision || 0.0001
      this.setCoordinatePrecision(dataset, precision)
      return size
    },
    transformDatasetToPixels(dataset, opts) {
      const bounds = this.getDatasetBounds(dataset)
      const bounds2 = this.calcOutputSizeInPixels(bounds, opts)
      const fwd = bounds.getTransform(bounds2, opts.invert_y)
      this.transformPoints(dataset, function (x, y) {
        return fwd.transform(x, y)
      })
      return [Math.round(bounds2.width()), Math.round(bounds2.height()) || 1]
    },
    setCoordinatePrecision(dataset, precision) {
      const round = this.getRoundingFunction(precision)
      this.transformPoints(dataset, function (x, y) {
        return [round(x), round(y)]
      })
      return dataset
    },
    getDatasetBounds(dataset) {
      const bounds = new Bounds()
      dataset.layers.forEach((lyr) => {
        const lyrbb = this.getLayerBounds(lyr, dataset.arcs)
        if (lyrbb) bounds.mergeBounds(lyrbb)
      })
      return bounds
    },
    getLayerBounds(lyr, arcs) {
      let bounds = null
      if (lyr.geometry_type === 'point') {
        bounds = this.getPointBounds(lyr.shapes)
      } else if (
        lyr.geometry_type === 'polygon' ||
        lyr.geometry_type === 'polyline'
      ) {
        bounds = this.getPathBounds$1(lyr.shapes, arcs)
      }
      return bounds
    },
    getPointBounds(shapes) {
      const bounds = new Bounds()
      ;(function (shapes, cb) {
        let i, n, j, m, shp
        for (i = 0, n = shapes.length; i < n; i++) {
          shp = shapes[i]
          for (j = 0, m = shp ? shp.length : 0; j < m; j++) {
            cb(shp[j], i)
          }
        }
      })(shapes, function (p) {
        bounds.mergePoint(p[0], p[1])
      })
      return bounds
    },
    getPathBounds$1(shapes, arcs) {
      const bounds = new Bounds()
      ;((arr, cb) => {
        let item
        for (let i = 0; i < arr.length; i++) {
          item = arr[i]
          if (item instanceof Array) {
            this.forEachArcId(item, cb)
          } else if (
            item != null &&
            item.constructor === Number &&
            (item | 0) === item
          ) {
            const val = cb(item)
            if (val !== void 0) {
              arr[i] = val
            }
          } else if (item) {
            console.log('Non-integer arc id in:', arr)
          }
        }
      })(shapes, function (id) {
        arcs.mergeArcBounds(id, bounds)
      })
      return bounds
    },
    calcOutputSizeInPixels(bounds, opts) {
      let padX = 0
      let padY = 0
      const offX = 0
      const offY = 0
      const width = bounds.width()
      const height = bounds.height()
      const margins = this.parseMarginOption(opts.margin)
      const marginX = margins[0] + margins[2]
      const marginY = margins[1] + margins[3]
      const wx = 0.5
      const wy = 0.5
      let widthPx
      let heightPx
      let kx
      let ky

      heightPx = opts.height || 0
      widthPx = opts.width || (heightPx > 0 ? 0 : 800) // 800 is default width

      if (heightPx > 0) {
        // vertical meters per pixel to fit height param
        ky = (height || width || 1) / (heightPx - marginY)
      }
      if (widthPx > 0) {
        // horizontal meters per pixel to fit width param
        kx = (width || height || 1) / (widthPx - marginX)
      }

      if (!widthPx) {
        // heightPx and ky are defined, set width to match
        kx = ky
        widthPx = width > 0 ? marginX + width / kx : heightPx // export square graphic if content has 0 width (reconsider this?)
      } else if (!heightPx) {
        // widthPx and kx are set, set height to match
        ky = kx
        heightPx = height > 0 ? marginY + height / ky : widthPx
        // limit height if max_height is defined
        if (opts.max_height > 0 && heightPx > opts.max_height) {
          ky = (kx * heightPx) / opts.max_height
          heightPx = opts.max_height
        }
      }

      if (kx > ky) {
        // content is wide -- need to pad vertically
        ky = kx
        padY = ky * (heightPx - marginY) - height
      } else if (ky > kx) {
        // content is tall -- need to pad horizontally
        kx = ky
        padX = kx * (widthPx - marginX) - width
      }

      bounds.padBounds(
        margins[0] * kx + padX * wx,
        margins[1] * ky + padY * wy,
        margins[2] * kx + padX * (1 - wx),
        margins[3] * ky + padY * (1 - wy)
      )

      if (!(widthPx > 0 && heightPx > 0)) {
        console.log('Missing valid height and width parameters')
      }
      if (!(kx === ky && kx > 0)) {
        console.log('Missing valid margin parameters')
      }

      return new Bounds(offX, offY, widthPx + offX, heightPx + offY)
    },
    exportLayerForSVG(lyr, dataset, opts) {
      const layerObj = this.getEmptyLayerForSVG(lyr)
      layerObj.children = this.exportSymbolsForSVG(lyr, dataset, opts)
      return layerObj
    },
    stringify(obj) {
      let svg, joinStr
      if (!obj || !obj.tag) return ''
      svg = '<' + obj.tag
      // w.s. is significant in text elements
      if (obj.properties) {
        svg += this.stringifyProperties(obj.properties)
      }
      if (obj.children || obj.value) {
        joinStr = obj.tag === 'text' || obj.tag === 'tspan' ? '' : '\n'
        svg += '>' + joinStr
        if (obj.value) {
          svg += obj.value
        }
        if (obj.children) {
          svg += obj.children.map(this.stringify).join(joinStr)
        }
        svg += joinStr + '</' + obj.tag + '>'
      } else {
        svg += '/>'
      }
      return svg
    },
    stringifyProperties(o) {
      return Object.keys(o).reduce((memo, key) => {
        const val = o[key]
        if (!val && val !== 0) return memo // omit undefined / empty / null values
        const strval =
          val != null && val.toString === String.prototype.toString
            ? val
            : JSON.stringify(val)
        if (key === 'href') {
          key = 'xlink:href'
        }
        return memo + ' ' + key + '="' + this.stringEscape(strval) + '"'
      }, '')
    },
    stringEscape(s) {
      return String(s).replace(rxp, function (s) {
        return map[s]
      })
    },
    transformPoints(dataset, f) {
      if (dataset.arcs) {
        dataset.arcs.transformPoints(f)
      }
      dataset.layers.forEach((lyr) => {
        if (this.layerHasPoints(lyr)) {
          this.transformPointsInLayer(lyr, f)
        }
      })
    },
    getRoundingFunction(inc) {
      if (!(inc != null && inc.constructor === Number) || inc === 0) {
        console.log('Rounding increment must be a non-zero number.')
      }
      let inv = 1 / inc
      if (inv > 1) inv = Math.round(inv)
      return function (x) {
        return Math.round(x * inv) / inv
      }
    },
    forEachArcId(arr, cb) {
      let item
      for (let i = 0; i < arr.length; i++) {
        item = arr[i]
        if (item instanceof Array) {
          this.forEachArcId(item, cb)
        } else if (
          item != null &&
          item.constructor === Number &&
          (item | 0) === item
        ) {
          const val = cb(item)
          if (val !== void 0) {
            arr[i] = val
          }
        } else if (item) {
          console.log('Non-integer arc id in:', arr)
        }
      }
    },
    getEmptyLayerForSVG(lyr) {
      const layerObj = {
        tag: 'g',
        properties: { id: lyr.name },
        children: [],
      }

      // override default black fill for layers that might have open paths
      if (lyr.geometry_type === 'polyline') {
        layerObj.properties.fill = 'none'
      }

      // add default display properties to line layers
      // (these are overridden by feature-level styles set via -style)
      if (lyr.geometry_type === 'polyline') {
        layerObj.properties.stroke = 'black'
        layerObj.properties['stroke-width'] = 1
      }
      return layerObj
    },
    layerHasPoints(lyr) {
      return lyr.geometry_type === 'point' && this.layerHasNonNullShapes(lyr)
    },
    transformPointsInLayer(lyr, f) {
      if (this.layerHasPoints(lyr)) {
        this.forEachPoint(lyr.shapes, function (p) {
          const p2 = f(p[0], p[1])
          p[0] = p2[0]
          p[1] = p2[1]
        })
      }
    },
    forEachPoint(shapes, cb) {
      let i, n, j, m, shp
      for (i = 0, n = shapes.length; i < n; i++) {
        shp = shapes[i]
        for (j = 0, m = shp ? shp.length : 0; j < m; j++) {
          cb(shp[j], i)
        }
      }
    },
    exportSymbolsForSVG(lyr, dataset, opts) {
      // TODO: convert geojson features one at a time
      const d = this.defaults({ layers: [lyr] }, dataset)
      const geojson = this.exportDatasetAsGeoJSON(d, opts)
      const features =
        geojson.features ||
        geojson.geometries ||
        (geojson.type ? [geojson] : [])
      const children = this.importGeoJSONFeatures(features, opts)
      if (opts.svg_data && lyr.data) {
        this.addDataAttributesToSVG(children, lyr.data, opts.svg_data)
      }
      return children
    },
    parseMarginOption(opt) {
      const str =
        opt != null && opt.constructor === Number ? String(opt) : opt || ''
      const margins = str.trim().split(/[, ] */)
      if (margins.length == 1) margins.push(margins[0])
      if (margins.length == 2) margins.push(margins[0], margins[1])
      if (margins.length == 3) margins.push(margins[2])
      return margins.map(function (str) {
        const px = parseFloat(str)
        return isNaN(px) ? 1 : px // 1 is default
      })
    },
    defaults(dest) {
      for (let i = 1, n = arguments.length; i < n; i++) {
        const src = arguments[i] || {}
        for (const key in src) {
          if (key in dest === false && src.hasOwnProperty(key)) {
            dest[key] = src[key]
          }
        }
      }
      return dest
    },
    exportDatasetAsGeoJSON(dataset, opts) {
      const geojson = {}
      const layers = dataset.layers
      const useFeatures = this.useFeatureCollection(layers)
      let collname

      if (useFeatures) {
        geojson.type = 'FeatureCollection'
        collname = 'features'
      } else {
        geojson.type = 'GeometryCollection'
        collname = 'geometries'
      }

      const collection = layers.reduce((memo, lyr, i) => {
        const items = this.exportLayerAsGeoJSON(lyr, dataset, opts, useFeatures)
        return memo.length > 0 ? memo.concat(items) : items
      }, [])

      geojson[collname] = collection
      return geojson
    },
    useFeatureCollection(layers) {
      return this.someUtil(layers, (lyr) => {
        const fields = lyr.data ? lyr.data.getFields() : []
        const haveData = this.useFeatureProperties(fields)
        const haveId = !!this.getIdField(fields)
        return haveData || haveId
      })
    },
    useFeatureProperties(fields) {
      return !(
        fields.length === 0 ||
        (fields.length === 1 && fields[0] == GeoJSON.ID_FIELD)
      )
    },
    getIdField(fields) {
      const ids = []
      ids.push(GeoJSON.ID_FIELD) // default id field
      return this.find(ids, (name) => {
        return this.contains(fields, name)
      })
    },
    contains(container, item) {
      if (
        container != null &&
        container.toString === String.prototype.toString
      ) {
        return container.indexOf(item) !== -1
      } else if (isArrayLike(container)) {
        return this.indexOf(container, item) !== -1
      }
      console.log('Expected Array or String argument')
    },
    indexOf(arr, item) {
      const nan = item !== item
      for (let i = 0, len = arr.length || 0; i < len; i++) {
        if (arr[i] === item) return i
        if (nan && arr[i] !== arr[i]) return i
      }
      return -1
    },
    find(arr, test, ctx) {
      const matches = arr.filter(test, ctx)
      return matches.length === 0 ? null : matches[0]
    },
    exportLayerAsGeoJSON(lyr, dataset, opts, asFeatures) {
      const properties = this.exportProperties(lyr.data, opts)
      const shapes = lyr.shapes
      const ids = this.exportIds(lyr.data, opts)
      let stringify

      if (properties && shapes && properties.length !== shapes.length) {
        console.log(
          'Mismatch between number of properties and number of shapes'
        )
      }

      return (shapes || properties || []).reduce(function (memo, o, i) {
        const shape = shapes ? shapes[i] : null
        const exporter = GeoJSON.exporters[lyr.geometry_type]
        let obj = shape ? exporter(shape, dataset.arcs, opts) : null
        if (asFeatures) {
          obj = {
            type: 'Feature',
            geometry: obj,
            properties: properties ? properties[i] : null,
          }
          if (ids) {
            obj.id = ids[i]
          }
        } else if (!obj) {
          return memo
        }
        memo.push(obj)
        return memo
      }, [])
    },
    exportProperties(table, opts) {
      const fields = table ? table.getFields() : []
      const idField = this.getIdField(fields, opts)
      let properties
      if (!this.useFeatureProperties(fields, opts)) {
        return null
      }
      const records = table.getRecords()
      if (idField == GeoJSON.ID_FIELD) {
        properties = records.map(function (rec) {
          rec = extendUtil({}, rec) // copy rec;
          delete rec[idField]
          return rec
        })
      } else {
        properties = records
      }
      return properties
    },
    importGeoJSONFeatures(features, opts) {
      opts = opts || {}
      return features.map((obj, i) => {
        const geom = obj.type === 'Feature' ? obj.geometry : obj // could be null
        const geomType = geom && geom.type
        let svgObj = null
        if (geomType && geom.coordinates) {
          svgObj = geojsonImporters[geomType](
            geom.coordinates,
            obj.properties,
            opts
          )
        }
        if (!svgObj) {
          return { tag: 'g' } // empty element
        }
        if (obj.properties) {
          this.applyStyleAttributes(svgObj, geomType, obj.properties)
        }
        if ('id' in obj) {
          if (!svgObj.properties) {
            svgObj.properties = {}
          }
          svgObj.properties.id = (opts.id_prefix || '') + obj.id
        }
        return svgObj
      })
    },
    addDataAttributesToSVG(children, table, fieldsArg) {
      const allFields = table.getFields()
      let dataFields =
        fieldsArg.indexOf('*') > -1 ? allFields.concat() : fieldsArg
      const missingFields = this.difference(dataFields, allFields)
      if (missingFields.length > 0) {
        dataFields = this.difference(dataFields, missingFields)
        // stop("Missing data field(s):", missingFields.join(', '));
      }
      const records = table.getRecords()
      const data = this.exportDataAttributesForSVG(records, dataFields)
      if (children.length !== data.length) {
        console.log(
          'Mismatch between number of SVG symbols and data attributes'
        )
      }
      children.forEach(function (child, i) {
        extendUtil(child.properties || {}, data[i])
      })
    },
    exportDataAttributesForSVG(records, fields) {
      const validRxp = /^[a-z_][a-z0-9_-]*$/i
      const invalidRxp = /^xml/
      const validFields = fields.filter(function (name) {
        return validRxp.test(name) && !invalidRxp.test(name)
      })
      const invalidFields = this.difference(fields, validFields)
      if (invalidFields.length > 0) {
        console.log(
          'Unable to add data-* attributes for field(s):',
          invalidFields.join(', ')
        )
        console.log('data-* names should match pattern [a-z_][a-z0-9_-]*')
      }
      return records.map(function (rec) {
        const obj = {}
        for (let i = 0; i < validFields.length; i++) {
          obj['data-' + validFields[i].toLowerCase()] = String(
            rec[validFields[i]]
          )
        }
        return obj
      })
    },
    difference(arr, other) {
      const index = this.arrayToIndex(other)
      return arr.filter(function (el) {
        return !Object.prototype.hasOwnProperty.call(index, el)
      })
    },
    arrayToIndex(arr, val) {
      const init = arguments.length > 1
      return arr.reduce(function (index, key) {
        index[key] = init ? val : true
        return index
      }, {})
    },
    applyStyleAttributes(svgObj, geomType, rec) {
      let symbolType = GeoJSON.translateGeoJSONType(geomType)
      if (symbolType === 'point' && 'label-text' in rec) {
        symbolType = 'label'
      }
      const fields = this.findPropertiesBySymbolGeom(
        Object.keys(rec),
        symbolType
      )
      for (let i = 0, n = fields.length; i < n; i++) {
        this.setAttribute(svgObj, fields[i], rec[fields[i]])
      }
    },
    findPropertiesBySymbolGeom(fields, type) {
      const index = propertiesBySymbolType[type] || {}
      return fields.filter(function (name) {
        return name in index
      })
    },
    setAttribute(obj, k, v) {
      if (k === 'r') {
        // assigned by importPoint()
      } else {
        if (!obj.properties) obj.properties = {}
        obj.properties[k] = v
        if (k === 'stroke-dasharray' && v) {
          obj.properties['stroke-linecap'] = 'butt'
        }
      }
    },
    exportIds(table, opts) {
      const fields = table ? table.getFields() : []
      const idField = this.getIdField(fields, opts)
      if (!idField) return null
      return table.getRecords().map(function (rec) {
        return idField in rec ? rec[idField] : null
      })
    },
  },
}
