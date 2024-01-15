export const tickerConfig = [
    {
        symbol: "SGOL",
        data: "gold"
    },
    {
        symbol: "SIVR",
        data: "silver"
    },
]

export function daily2ohlcv(dailyResp) {
    const dailyObj = dailyResp["Time Series (Daily)"]
    const ohlcv = Object.keys(dailyObj)
        .map((day) => {
            const adjustment = (Number.parseFloat(dailyObj[day]["5. adjusted close"]) / Number.parseFloat(dailyObj[day]["4. close"])) || 1
            
            return [
                Date.parse(day), 
                Number.parseFloat(dailyObj[day]["1. open"]) * adjustment,
                Number.parseFloat(dailyObj[day]["2. high"]) * adjustment,
                Number.parseFloat(dailyObj[day]["3. low"]) * adjustment,
                Number.parseFloat(dailyObj[day]["4. close"]) * adjustment,
                Number.parseInt(dailyObj[day]["6. volume"] || dailyObj[day]["5. volume"]) / adjustment
            ]
        })
    ohlcv.sort((a, b) => a[0] - b[0]) // All data must be sorted by time (in ascending order)
    return ohlcv;
}

export function ma2onchart(maResp, maType = "SMA") {
    const maObj = maResp[`Technical Analysis: ${maType}`]
    const onchart = Object.keys(maObj)
        .map((day) => [
            Date.parse(day),
            Number.parseFloat(maObj[day][maType])
        ])
    onchart.sort((a, b) => a[0] - b[0]) // All data must be sorted by time (in ascending order)
    return onchart;
}

export function macd2offchart(macdResp) {
    const macdObj = macdResp["Technical Analysis: MACD"]
    const offchart = Object.keys(macdObj)
        .map((day) => [
                Date.parse(day),
                Number.parseFloat(macdObj[day]["MACD_Hist"]),
                Number.parseFloat(macdObj[day]["MACD"]),
                Number.parseFloat(macdObj[day]["MACD_Signal"])
            ])
    offchart.sort((a, b) => a[0] - b[0]) // All data must be sorted by time (in ascending order)
    return offchart;
}

export function stochf2offchart(stochfResp) {
    const stochfObj = stochfResp["Technical Analysis: STOCHF"]
    const offchart = Object.keys(stochfObj)
        .map((day) => [
                Date.parse(day),
                Number.parseFloat(stochfObj[day]["FastK"]),
                Number.parseFloat(stochfObj[day]["FastD"])
            ])
    offchart.sort((a, b) => a[0] - b[0]) // All data must be sorted by time (in ascending order)
    return offchart;
}

export function stochrsi2offchart(stochrsiResp) {
    const stochrsiObj = stochrsiResp["Technical Analysis: STOCHRSI"]
    const offchart = Object.keys(stochrsiObj)
        .map((day) => [
                Date.parse(day),
                Number.parseFloat(stochrsiObj[day]["FastK"]),
                Number.parseFloat(stochrsiObj[day]["FastD"])
            ])
    offchart.sort((a, b) => a[0] - b[0]) // All data must be sorted by time (in ascending order)
    return offchart;
}

export function adx2offchart(adxResp) {
    const adxObj = adxResp["Technical Analysis: ADX"]
    const offchart = Object.keys(adxObj)
        .map((day) => [
                Date.parse(day),
                Number.parseFloat(adxObj[day]["ADX"])
            ])
    offchart.sort((a, b) => a[0] - b[0]) // All data must be sorted by time (in ascending order)
    return offchart;
}

export function bbands2onchart(bbandsResp) {
    const bbandsObj = bbandsResp["Technical Analysis: BBANDS"]
    const onchart = Object.keys(bbandsObj)
        .map((day) => [
            Date.parse(day),
            Number.parseFloat(bbandsObj[day]["Real Upper Band"]),
            Number.parseFloat(bbandsObj[day]["Real Middle Band"]),
            Number.parseFloat(bbandsObj[day]["Real Lower Band"])
        ])
    onchart.sort((a, b) => a[0] - b[0]) // All data must be sorted by time (in ascending order)
    return onchart;
}

export function ad2offchart(adResp) {
    const adObj = adResp["Technical Analysis: Chaikin A/D"]
    const offchart = Object.keys(adObj)
        .map((day) => [
            Date.parse(day),
            Number.parseFloat(adObj[day]["Chaikin A/D"]),
        ])
    offchart.sort((a, b) => a[0] - b[0]) // All data must be sorted by time (in ascending order)
    return offchart;
}

export function obv2offchart(obvResp) {
    const obvObj = obvResp["Technical Analysis: OBV"]
    const offchart = Object.keys(obvObj)
        .map((day) => [
            Date.parse(day),
            Number.parseInt(obvObj[day]["OBV"]),
        ])
    offchart.sort((a, b) => a[0] - b[0]) // All data must be sorted by time (in ascending order)
    return offchart;
}

export function ohlcv2sma(ohlcvArray, smaWindow) {
    if (smaWindow > ohlcvArray.length || smaWindow < 1) {
        return []
    }
    let sma = []
    for (let i = smaWindow; i <= ohlcvArray.length; i++) {
        sma.push([
            ohlcvArray[i - 1][0], // timestamp
            (ohlcvArray
                .slice((i - smaWindow), i)
                .map((d) => d.slice(2, 5).reduce((a, b) => a + b) / 3) // typical price
                .reduce((a, b) => a + b)
            ) / smaWindow
        ])
    }
    return sma
}

export function ohlcv2ema(ohlcvArray, emaWindow) {
    if (emaWindow > ohlcvArray.length || emaWindow < 1) {
        return []
    }
    const k = 2 / (emaWindow + 1)
    let ema = [
        [
            ohlcvArray[emaWindow - 1][0], // timestamp
            (ohlcvArray // The first EMA is actually an SMA?
                .slice(0, emaWindow)
                .map((d) => d.slice(2, 5).reduce((a, b) => a + b) / 3) // typical price
                .reduce((a, b) => a + b)
            ) / emaWindow
        ]
    ]
    for (let i = emaWindow; i < ohlcvArray.length; i++) {
        const priceToday = ohlcvArray[i].slice(2, 5).reduce((a, b) => a + b) / 3 // typical price
        const emaYesterday = ema[ema.length - 1][1]
        ema.push([
            ohlcvArray[i][0],
            (priceToday * k) + (emaYesterday * (1 - k))
        ])
    }
    return ema
}

export function ohlcv2macd(ohlcvArray, fastPeriod, slowPeriod, signalPeriod) {
    if (fastPeriod > slowPeriod) {
        return []
    }
    const fastEma = ohlcv2ema(ohlcvArray, fastPeriod)
    const slowEma = ohlcv2ema(ohlcvArray, slowPeriod)
    const macdLine = slowEma
        .map((d, i) => {
            const fastDay = fastEma[i + (slowPeriod - fastPeriod)] 
            return [
                d[0],
                fastDay[1] - d[1]
            ]
        })
    //
    const k = 2 / (signalPeriod + 1)
    let signalLine = [
        [
            macdLine[signalPeriod - 1][0],
            (macdLine
                .slice(0, signalPeriod)
                .map((d) => d[1])
                .reduce((a, b) => a + b)
            ) / signalPeriod
        ]
    ]
    for (let i = signalPeriod; i < macdLine.length; i++) {
        signalLine.push([
            macdLine[i][0],
            (macdLine[i][1] * k) + (signalLine[signalLine.length - 1][1] * (1 - k))
        ])
    }
    //
    return signalLine
        .map((d, i) => {
            const macdDay = macdLine[i + (signalPeriod - 1)]
            return [
                d[0],
                macdDay[1] - d[1], // histogram
                macdDay[1], // MACD Line
                d[1], // Signal Line
            ]
        })
}

export function ohlcv2rsi(ohlcvArray, rsiWindow = 14) {
    if (rsiWindow > ohlcvArray.length || rsiWindow < 1) {
        return []
    }

    function calculateRsi(closingPrices) {
        // Calculate the average of the upward price changes
        let avgUpwardChange = 0;
        for (let i = 1; i < closingPrices.length; i++) {
            avgUpwardChange += Math.max(0, closingPrices[i] - closingPrices[i - 1]);
        }
        avgUpwardChange /= closingPrices.length;

        // Calculate the average of the downward price changes
        let avgDownwardChange = 0;
        for (let i = 1; i < closingPrices.length; i++) {
            avgDownwardChange += Math.max(0, closingPrices[i - 1] - closingPrices[i]);
        }
        avgDownwardChange /= closingPrices.length;

        // Calculate the RSI
        const rsi = 100 - (100 / (1 + (avgUpwardChange / avgDownwardChange)));

        return rsi;
    }

    let rsi = []
    for (let i = rsiWindow; i <= ohlcvArray.length; i++) {
        rsi.push([
            ohlcvArray[i - 1][0], // timestamp
            calculateRsi(ohlcvArray
                .slice((i - rsiWindow), i)
                .map((d) => d.slice(2, 5).reduce((a, b) => a + b) / 3) // typical price
            )
        ])
    }
    return rsi
}