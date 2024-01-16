import { tickerConfig } from "../lib"

export default {
    computed: {
        ready() {
            const self = this;
            return self.loading.length === 0;
        },
    },
    watch: {
        ready(newVal) {
            const self = this;
            if (newVal) {
                tickerConfig.forEach((configObj) => {
                    const ohlcv = self[`${configObj.data}_ohlcv`]
                    /*
                    const onChart200sma = (self[`${configObj.data}_onchart`].find((oc) => oc.name === "SMA, 200")).data
                    const sma200offset = ohlcv.length - onChart200sma.length
                    */
                    const onChart20ema = (self[`${configObj.data}_onchart`].find((oc) => oc.name === "EMA, 20")).data
                    const ema20offset = ohlcv.length - onChart20ema.length

                    const onChart9sma = (self[`${configObj.data}_onchart`].find((oc) => oc.name === "SMA, 9")).data
                    const sma9offset = ohlcv.length - onChart9sma.length

                    //const onChart9upCount = (self[`${configObj.data}_onchart`].find((oc) => oc.name === "TD 9 Count Up")).data
                    
                    const offChartMacd = (self[`${configObj.data}_offchart`].find((oc) => oc.type === "MACD")).data
                    const macdOffset = ohlcv.length - offChartMacd.length
                    
                    const offChartRsi = (self[`${configObj.data}_offchart`].find((oc) => oc.type === "RSI")).data
                    const rsiOffset = ohlcv.length - offChartRsi.length
                    
                    function calculateSignal(spltrs, d, indx) {
                        //const currUpCount = ((onChart9upCount.filter((count) => count[0] === d[0]))[0] || [d[0], { text: 0 }])[1].text
                        
                        const typicalPrice = d.slice(2, 5).reduce((a, b) => a + b) / 3
                        
                        const lastBuy = spltrs.findLastIndex((s) => s[1] === "BUY") || 0
                        const lastBuyTypicalPrice = (ohlcv[lastBuy] || [0, 0, 0, 0, 0, 0]).slice(2, 5).reduce((a, b) => a + b) / 3 
                        
                        const lastSell = spltrs.findLastIndex((s) => s[1].startsWith("SELL")) || 0
                        
                        return (
                            lastSell >= lastBuy // we're not currently bought in
                            &&
                            // https://www.tradingview.com/script/127zASU6-JBravo-Swing/
                            Math.min(d[1], d[4]) > (onChart9sma[(indx - sma9offset)] || [0, 0])[1] // Full candle above 9SMA - buy signal from Bravo9
                            &&
                            ( // positive cross on the MACD
                                (offChartMacd[(indx - macdOffset)] || [0, 0, 0, 0])[1] >= 0.001
                                &&
                                (offChartMacd[(indx - macdOffset) - 1] || [0, 0, 0, 0])[1] < (offChartMacd[(indx - macdOffset)] || [0, 0, 0, 0])[1]
                            )
                            &&
                            ( // rising from oversold
                                (offChartRsi[(indx - rsiOffset)] || [0, 0])[1] > 40
                                &&
                                Math.min(...offChartRsi.slice(Math.max(0, (indx - rsiOffset) - 3), (indx - rsiOffset)).map(s => s[1])) < 40
                            )
                        )
                        ? "BUY"
                        : (
                            lastBuy > lastSell // we are currently bought in
                            &&
                            ( // paper 
                                ( // sell signals from Bravo9
                                    Math.max(d[1], d[4]) < (onChart9sma[(indx - sma9offset)] || [0, 0])[1] // Full candle below 9SMA 
                                    ||
                                    ( // Bearish candle closes below 20EMA
                                        d[4] - d[1] <= -0.01
                                        &&
                                        d[4] - (onChart20ema[(indx - ema20offset)] || [0, 0])[1] <= -0.01 
                                    )
                                )
                                ||
                                /*
                                 * Sell signal from Accurate Swing Trading System
                                 * Close below the lowest low of the last 3 days
                                 */
                                d[4] - Math.min(...ohlcv.slice(Math.max(0, (indx - 3)), indx).map(s => s[3])) <= -0.01
                                ||
                                (
                                    ( // negative cross on the MACD
                                        (offChartMacd[(indx - macdOffset)] || [0, 0, 0, 0])[1] <= -0.001
                                        &&
                                        (offChartMacd[(indx - macdOffset) - 1] || [0, 0, 0, 0])[1] > (offChartMacd[(indx - macdOffset)] || [0, 0, 0, 0])[1]
                                    )
                                )
                            )
                        )
                        ? `SELL ${(((typicalPrice - lastBuyTypicalPrice) / lastBuyTypicalPrice) * 100).toFixed(2)}%`
                        : ""
                    }

                    const signalsData = ohlcv
                        .reduce((splitters, day) => {
                            const index = splitters.length
                            const signal = calculateSignal(splitters, day, index)
                            return [
                                ...splitters,
                                [
                                    day[0],
                                    signal,
                                    1,
                                    signal.startsWith("SELL")
                                    ? signal.includes("-") ? "#8b0000" : "#008b00"
                                    : "#5700ff",
                                    signal === "BUY"
                                    ? 0.2 
                                    : signal.startsWith("SELL")
                                    ? 0.8
                                    : 0.5,
                                ]
                            ]
                        }, [])
                        .filter((day) => day[1] !== "")
                    
                    self[`${configObj.data}_onchart`] = [
                        ...self[`${configObj.data}_onchart`],
                        {
                            name: "Buy/Sell Signals",
                            type: "Splitters",
                            data: signalsData,
                            settings: {
                                "legend": false,
                                "lineColor": "#ffd700"
                            }
                        }
                    ]

                    const gainLoss = signalsData
                        .filter((day) => day[1].startsWith("SELL"))
                        .map((day) => Number.parseFloat(day[1].replace(/SELL\s/, '').replace(/%/, '')))
                    console.log(`Trade outcomes for ${configObj.symbol}: ${gainLoss}`)
                    console.log(`Number of trades for ${configObj.symbol}: ${gainLoss.length}`)
                    console.log(''
                        +
                        `Percent of profitable trades for ${configObj.symbol}: `
                        +
                        `${((gainLoss.filter((t) => t > 0).length / gainLoss.length) * 100).toFixed(2)}%`
                    )
                    console.log(''
                        +
                        `Average trade for ${configObj.symbol}: `
                        +
                        `${(gainLoss.reduce((a, b) => a + b) / gainLoss.length).toFixed(2)}%`
                    )
                    console.log(`Largest loosing trade for ${configObj.symbol}: ${Math.min(...gainLoss)}%`)
                    const startingCapital = 1000
                    console.log(''
                        +
                        `Starting with $${startingCapital} on ${(new Date(ohlcv[0][0])).toLocaleDateString()}, `
                        +
                        `ending balance for ${configObj.symbol}: `
                        +
                        `$${gainLoss.reduce((a, b) => a * (1 + (b / 100)), startingCapital).toFixed(2)}`
                    )
                })
            }
        },
    },
}