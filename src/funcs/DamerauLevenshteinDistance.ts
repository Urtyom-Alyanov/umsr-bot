const initMatrix = (s1: string, s2: string) => {
    /* istanbul ignore next */
    if (undefined == s1 || undefined == s2) {
        return null;
    }

    let d: number[][] = [];
    for (let i = 0; i <= s1.length; i++) {
        d[i] = [];
        d[i][0] = i;
    }
    for (let j = 0; j <= s2.length; j++) {
        d[0][j] = j;
    }

    return d;
};

const damerau = (i: number, j: number, s1: string, s2: string, d: number[][], cost: number) => {
    if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        d[i][j] = Math.min.apply(null, [d[i][j], d[i - 2][j - 2] + cost]);
    }
};

export function DamerauLevenshteinDistance(first_string: string, second_string: string) {
    if (
        undefined == first_string ||
        undefined == second_string ||
        "string" !== typeof first_string ||
        "string" !== typeof second_string
    ) {
        return -1;
    }

    let d = initMatrix(first_string, second_string);
    /* istanbul ignore next */
    if (null === d) {
        return -1;
    }
    for (var i = 1; i <= first_string.length; i++) {
        let cost;
        for (let j = 1; j <= second_string.length; j++) {
            if (first_string.charAt(i - 1) === second_string.charAt(j - 1)) {
                cost = 0;
            } else {
                cost = 1;
            }

            d[i][j] = Math.min.apply(null, [
                d[i - 1][j] + 1,
                d[i][j - 1] + 1,
                d[i - 1][j - 1] + cost,
            ]);

            damerau(i, j, first_string, second_string, d, cost);
        }
    }

    return d[first_string.length][second_string.length];
};