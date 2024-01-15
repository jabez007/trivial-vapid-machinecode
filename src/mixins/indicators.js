import axios from "axios";
import * as lib from "../lib"

export default {
    data: () => ({
        loading: [],
        gold_ohlcv: [],
        gold_onchart: [],
        gold_offchart: [],
        silver_ohlcv: [],
        silver_onchart: [],
        silver_offchart: [],
    }),
    created() {
        const self = this;
        lib.tickerConfig.forEach((configObj) => {
            self.loading.push(true);

            axios.get(`data/${configObj.symbol}.json`, { baseURL: window.location.origin })
                .then((resp) => {
                    self[`${configObj.data}_ohlcv`] = lib.daily2ohlcv(resp.data)
                
                    self[`${configObj.data}_onchart`] = [
                        ...self[`${configObj.data}_onchart`],
                        {
                            name: "SMA, 9",
                            type: "SMA",
                            data: lib.ohlcv2sma(self[`${configObj.data}_ohlcv`], 9),
                            settings: {
                                lineWidth: 1
                            }
                        },
                        {
                            name: "EMA, 20",
                            type: "EMA",
                            data: lib.ohlcv2ema(self[`${configObj.data}_ohlcv`], 20),
                            settings: {
                                lineWidth: 2
                            }
                        },
                        {
                            name: "EMA, 50",
                            type: "EMA",
                            data: lib.ohlcv2ema(self[`${configObj.data}_ohlcv`], 50),
                            settings: {
                                lineWidth: 3
                            }
                        },
                        {
                            name: "SMA, 200",
                            type: "SMA",
                            data: lib.ohlcv2sma(self[`${configObj.data}_ohlcv`], 200),
                            settings: {
                                lineWidth: 5,
                                color: "#bbbbbb"
                            }
                        },
                        {
                            name: "TD 9 Count Up",
                            type: "Markers",
                            data: self[`${configObj.data}_ohlcv`]
                                .reduce((oc, day, indx) => [
                                    ...oc,
                                    [
                                        day[0],
                                        {
                                            color: "#35a73d",
                                            textColor: "#eaf6eb",
                                            $: day[2],
                                            text: oc.length > 4 && day[4] > self[`${configObj.data}_ohlcv`][indx - 4][4]
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
                            data: self[`${configObj.data}_ohlcv`]
                                .reduce((oc, day, indx) => [
                                    ...oc,
                                    [
                                        day[0],
                                        {
                                            color: "#e541a2",
                                            textColor: "#fcecf5",
                                            $: day[2],
                                            text: oc.length > 4 && day[4] < self[`${configObj.data}_ohlcv`][indx - 4][4]
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
                        }
                    ]

                    self[`${configObj.data}_offchart`] = [
                        {
                            name: "MACD (13, 22, 9)",
                            type: "MACD",
                            data: lib.ohlcv2macd(self[`${configObj.data}_ohlcv`], 13, 22, 9),
                            settings: {
                                signalWidth: 3
                            }
                        },
                        {
                            name: "RSI, 14",
                            type: "RSI",
                            data: lib.ohlcv2rsi(self[`${configObj.data}_ohlcv`], 14),
                            settings: {
                                upper: 70,
                                lower: 30,
                                backColor: "#00b300"+"21"
                            }
                        },
                        ...self[`${configObj.data}_offchart`],
                    ]
                
                    self.loading.pop()
                })
        })
    },
}