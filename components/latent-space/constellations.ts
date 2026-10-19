// Real constellations for the empty sky around the worlds. Stars are [right ascension (hours), declination (degrees),
// visual magnitude], projected flat around each constellation's centre with east to the left, as on a star chart.

type Star = [ra: number, dec: number, mag: number, tint?: string];

const WARM = "#ffc59a";   // red giants: Betelgeuse, Antares, Gacrux
const COOL = "#cfe0ff";   // hot blue-white stars: Rigel, Vega, Deneb

const SKY: { name: string; stars: Star[]; lines: [number, number][] }[] = [
  {
    name: "Big Dipper",
    // Dubhe, Merak, Phecda, Megrez, Alioth, Mizar, Alkaid
    stars: [[11.062, 61.75, 1.79], [11.031, 56.38, 2.37], [11.897, 53.69, 2.44], [12.257, 57.03, 3.31], [12.9, 55.96, 1.77], [13.399, 54.93, 2.04], [13.792, 49.31, 1.86]],
    lines: [[6, 5], [5, 4], [4, 3], [3, 2], [2, 1], [1, 0], [0, 3]],
  },
  {
    name: "Cassiopeia",
    // Caph, Schedar, Navi, Ruchbah, Segin
    stars: [[0.153, 59.15, 2.27], [0.675, 56.54, 2.24], [0.945, 60.72, 2.47], [1.43, 60.24, 2.68], [1.907, 63.67, 3.37]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: "Orion",
    // Meissa, Betelgeuse, Bellatrix, Mintaka, Alnilam, Alnitak, Saiph, Rigel
    stars: [[5.586, 9.93, 3.39], [5.919, 7.41, 0.5, WARM], [5.419, 6.35, 1.64], [5.533, -0.3, 2.23], [5.604, -1.2, 1.69], [5.679, -1.94, 1.77], [5.796, -9.67, 2.09], [5.242, -8.2, 0.13, COOL]],
    lines: [[0, 1], [0, 2], [1, 5], [2, 3], [3, 4], [4, 5], [5, 6], [3, 7]],
  },
  {
    name: "Cygnus",
    // Deneb, Sadr, Eta, Albireo, Fawaris, Gienah, Zeta
    stars: [[20.691, 45.28, 1.25, COOL], [20.37, 40.26, 2.23], [19.939, 35.08, 3.89], [19.512, 27.96, 3.05, "#ffe2a8"], [19.75, 45.13, 2.87], [20.77, 33.97, 2.48], [21.216, 30.23, 3.21]],
    lines: [[0, 1], [1, 2], [2, 3], [4, 1], [1, 5], [5, 6]],
  },
  {
    name: "Scorpius",
    // Acrab, Dschubba, Pi, Sigma, Antares, Tau, Epsilon, Mu, Zeta, Eta, Sargas, Kappa, Shaula
    stars: [[16.091, -19.81, 2.62], [16.006, -22.62, 2.29], [15.981, -26.11, 2.89], [16.353, -25.59, 2.89], [16.49, -26.43, 1.06, WARM], [16.598, -28.22, 2.82],
      [16.836, -34.29, 2.29], [16.865, -38.05, 3.04], [16.91, -42.36, 3.62], [17.203, -43.24, 3.33], [17.622, -43.0, 1.86], [17.708, -39.03, 2.39], [17.56, -37.1, 1.62]],
    lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12]],
  },
  {
    name: "Lyra",
    // Vega, Epsilon, Zeta, Sheliak, Sulafat, Delta
    stars: [[18.616, 38.78, 0.03, COOL], [18.739, 39.67, 4.67], [18.746, 37.61, 4.36], [18.835, 33.36, 3.52], [18.982, 32.69, 3.25], [18.909, 36.9, 4.3]],
    lines: [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [4, 5], [5, 2]],
  },
  {
    name: "Leo",
    // Regulus, Eta, Algieba, Adhafera, Rasalas, Epsilon, Zosma, Chertan, Denebola
    stars: [[10.14, 11.97, 1.35, COOL], [10.122, 16.76, 3.49], [10.333, 19.84, 2.08], [10.278, 23.42, 3.43], [9.88, 26.01, 3.88], [9.764, 23.77, 2.98],
      [11.235, 20.52, 2.56], [11.237, 15.43, 3.33], [11.818, 14.57, 2.14]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 8], [8, 7], [7, 0], [6, 7]],
  },
  {
    name: "Crux",
    // Acrux, Mimosa, Gacrux, Delta, Epsilon
    stars: [[12.443, -63.1, 0.76, COOL], [12.795, -59.69, 1.25], [12.52, -57.11, 1.64, WARM], [12.252, -58.75, 2.79], [12.356, -60.4, 3.59]],
    lines: [[2, 0], [1, 3]],
  },
];

export type Constellation = {
  name: string;
  /** Width over height of the figure. */
  aspect: number;
  /** Star positions in a box whose longer side is 1, with a 0–1 brightness and a colour. */
  stars: { x: number; y: number; bright: number; color: string }[];
  lines: [number, number][];
};

export const CONSTELLATIONS: Constellation[] = SKY.map(({ name, stars, lines }) => {
  const ra0 = stars.reduce((s, [ra]) => s + ra, 0) / stars.length;
  const dec0 = stars.reduce((s, [, dec]) => s + dec, 0) / stars.length;
  const flat = stars.map(([ra, dec]) => [-(ra - ra0) * 15 * Math.cos((dec0 * Math.PI) / 180), -(dec - dec0)]);
  const xs = flat.map((p) => p[0]), ys = flat.map((p) => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0, side = Math.max(w, h);
  return {
    name,
    aspect: w / h,
    stars: stars.map(([, , mag, tint], i) => ({
      x: (flat[i][0] - x0) / side,
      y: (flat[i][1] - y0) / side,
      bright: Math.max(0, Math.min(1, (4.2 - mag) / 4.2)),
      color: tint ?? "#fff8ec",
    })),
    lines,
  };
});
