type Vector3 = [number, number, number];
type Vector4 = [number, number, number, number];
type Matrix3 = [
  number, number, number,
  number, number, number,
  number, number, number
];
type Matrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];


function adjugate(m: Matrix3): Matrix3 {
  return [
    m[4]*m[8] - m[5]*m[7], m[2]*m[7] - m[1]*m[8], m[1]*m[5] - m[2]*m[4],
    m[5]*m[6] - m[3]*m[8], m[0]*m[8] - m[2]*m[6], m[2]*m[3] - m[0]*m[5],
    m[3]*m[7] - m[4]*m[6], m[1]*m[6] - m[0]*m[7], m[0]*m[4] - m[1]*m[3]
  ];
}

function multiply3(a: Matrix3, b: Matrix3): Matrix3 {
  return [
    a[0]*b[0] + a[1]*b[3] + a[2]*b[6],
    a[0]*b[1] + a[1]*b[4] + a[2]*b[7],
    a[0]*b[2] + a[1]*b[5] + a[2]*b[8],
    a[3]*b[0] + a[4]*b[3] + a[5]*b[6],
    a[3]*b[1] + a[4]*b[4] + a[5]*b[7],
    a[3]*b[2] + a[4]*b[5] + a[5]*b[8],
    a[6]*b[0] + a[7]*b[3] + a[8]*b[6],
    a[6]*b[1] + a[7]*b[4] + a[8]*b[7],
    a[6]*b[2] + a[7]*b[5] + a[8]*b[8],
  ];
}

function multiply3Vector(m: Matrix3, v: Vector3): Vector3 {
  return [
    m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
    m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
    m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
  ];
}

function basisToPoints(x: Vector4, y: Vector4): Matrix3 {
  const m: Matrix3 = [
    x[0], x[1], x[2],
    y[0], y[1], y[2],
       1,    1,    1
  ];
  const v = multiply3Vector(adjugate(m), [x[3], y[3], 1]);
  return multiply3(m, [
    v[0], 0, 0,
    0, v[1], 0,
    0, 0, v[2]
  ]);
}

function projectToMatrix(
  w: number, h: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  x4: number, y4: number
): Matrix4 {
 const s = basisToPoints(
    [0, w, 0, w],
    [0, 0, h, h]
 );
  const d = basisToPoints(
    [x1, x2, x3, x4],
    [y1, y2, y3, y4],
  );

  const t = multiply3(s, adjugate(d));
  const a = t[8];
  return [
    t[0]/a, t[3]/a, 0, t[6]/a,
    t[1]/a, t[4]/a, 0, t[7]/a,
         0,      0, 1,      0,
    t[2]/a, t[5]/a, 0, t[8]/a
  ]
}

