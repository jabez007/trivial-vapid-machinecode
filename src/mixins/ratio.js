import * as lib from "../lib"

export default {
    computed: {
        ratio_ohlcv() {
            const self = this;
            const ohlcv = this.silver_ohlcv
                .map((s, i) => {
                    let g = self.gold_ohlcv[i - 32] || [] // silver has 32 more periods than gold
                    if (s[0] == g[0]) { // same date
                        let multiplier = g[4] > 100 ? 10: 100
                        return [
                            s[0],
                            (g[1] * multiplier) / s[1], // open
                            (g[2] * multiplier) / s[2], // high
                            (g[3] * multiplier) / s[3], // low
                            (g[4] * multiplier) / s[4], // close
                            g[5] + s[5]  // volume
                        ]
                    } else {
                        return []
                    }
                })
                .filter((r) => r.length > 0)
            return ohlcv;
        },
        ratio_sma200() {
            const self = this;
            return lib.ohlcv2sma(self.ratio_ohlcv, 200)   
        },
        ratio_ema50() {
            const self = this;
            return lib.ohlcv2ema(self.ratio_ohlcv, 50)   
        },
        ratio_ema20() {
            const self = this;
            return lib.ohlcv2ema(self.ratio_ohlcv, 20)   
        },
        ratio_sma9() {
            const self = this;
            return lib.ohlcv2sma(self.ratio_ohlcv, 9)   
        },
        ratio() {
            const self = this;
            return {
                ohlcv: self.ratio_ohlcv,
                onchart: [
                    {
                        name: "SMA, 9",
                        type: "SMA",
                        data: self.ratio_sma9,
                        settings: {
                            lineWidth: 1
                        }
                    },
                    {
                        name: "EMA, 20",
                        type: "EMA",
                        data: self.ratio_ema20,
                        settings: {
                            lineWidth: 2
                        }
                    },
                    {
                        name: "EMA, 50",
                        type: "EMA",
                        data: self.ratio_ema50,
                        settings: {
                            lineWidth: 3
                        }
                    },
                    {
                        name: "SMA, 200",
                        type: "SMA",
                        data: self.ratio_sma200,
                        settings: {
                            lineWidth: 5
                        }
                    },
                    /*
                    {
                        name: "TD 9 Count Up",
                        type: "Markers",
                        data: self.ratio_ohlcv
                            .reduce((oc, day, indx) => [
                                ...oc,
                                [
                                    day[0],
                                    {
                                        color: "#35a73d",
                                        textColor: "#eaf6eb",
                                        $: day[2],
                                        text: oc.length > 4 && day[4] > self.ratio_ohlcv[indx - 4][4]
                                            ? oc[oc.length - 1][1].text + 1
                                            : 0,
                                        sel: oc.length > 4
                                            ? oc[oc.length - 1][1].text === 8
                                            : false
                                    }
                                ]
                            ], [])
                            .filter((oc) => oc[1].text >= 7),
                        settings: {
                            legend: false,
                        }
                    },
                    {
                        name: "TD 9 Count Down",
                        type: "Markers",
                        data: self.ratio_ohlcv
                            .reduce((oc, day, indx) => [
                                ...oc,
                                [
                                    day[0],
                                    {
                                        color: "#e541a2",
                                        textColor: "#fcecf5",
                                        $: day[2],
                                        text: oc.length > 4 && day[4] < self.ratio_ohlcv[indx - 4][4]
                                            ? oc[oc.length - 1][1].text + 1
                                            : 0,
                                        sel: oc.length > 4
                                            ? oc[oc.length - 1][1].text === 8
                                            : false
                                    }
                                ]
                            ], [])
                            .filter((oc) => oc[1].text >= 7),
                        settings: {
                            legend: false,
                        }
                    },
                    */
                    {
                        name: "Data sections",
                        type: "Splitters",
                        data: [
                            [
                                self.ratio_ohlcv[self.ratio_ohlcv.length - 1][0],
                                (
                                    (self.ratio_ema50[self.ratio_ema50.length - 1][1] > self.ratio_sma200[self.ratio_sma200.length - 1][1])
                                    &&
                                    (self.ratio_ema50[self.ratio_ema50.length - 2][1] < self.ratio_ema50[self.ratio_ema50.length - 1][1])
                                    &&
                                    self.ratio_ohlcv[self.ratio_ohlcv.length - 1][4] > self.ratio_sma200[self.ratio_sma200.length - 1][1]
                                )
                                ? "Focus on Silver"
                                : (
                                    (self.ratio_ema50[self.ratio_ema50.length - 1][1] < self.ratio_sma200[self.ratio_sma200.length - 1][1])
                                    &&
                                    (self.ratio_ema50[self.ratio_ema50.length - 2][1] > self.ratio_ema50[self.ratio_ema50.length - 1][1])
                                    &&
                                    self.ratio_ohlcv[self.ratio_ohlcv.length - 1][4] < self.ratio_sma200[self.ratio_sma200.length - 1][1]
                                  )
                                ? "Focus on Gold"
                                : "HODL",
                                1,
                                "#5700ff",
                                0.5
                            ]
                        ],
                        settings: {
                            "legend": false,
                            "lineColor": "#ffd700"
                        }
                    }
                ],
                offchart: [
                    {
                        name: "MACD (13, 22, 9)",
                        type: "MACD",
                        data: lib.ohlcv2macd(self.ratio_ohlcv, 13, 22, 9),
                        settings: {
                            signalWidth: 3
                        }
                    },
                    {
                        name: "RSI, 14",
                        type: "RSI",
                        data: lib.ohlcv2rsi(self.ratio_ohlcv, 14),
                        settings: {
                            upper: 70,
                            lower: 30,
                            backColor: "#00b300"+"21"
                        }
                    }
                ],
            }
        }
    }
}