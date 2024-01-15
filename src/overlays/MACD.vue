<script>

// TODO: pass colors from settings to the script
// TODO: hist lines => recangles (like in volbar.js)

import { Overlay } from 'trading-vue-js'

function histColor(cur, pre) {
    if (cur[1] > 0) {
        if (cur[1] > (pre[1] || 0)) {
            return 0
        } else {
            return 1
        }
    } else {    
        if (cur[1] < (pre[1] || 0)) {
            return 2
        } else {
            return 3
        }
    }
}
    
export default {
    name: 'MACD',
    mixins: [Overlay],
    methods: {
        meta_info() {
            return {
                author: 'StdSquad', version: '1.0.2',
                desc: 'Moving Average Convergence/Divergence',
                preset: {
                    name: 'MACD $fast $slow $smooth',
                    side: 'offchart',
                    settings: {
                        histWidth: 4,
                        macdWidth: 1,
                        signalWidth: 1,
                        defColor: "#42b28a",
                        macdColor: "#3782f2",
                        signalColor: "#f48709",
                        histColors: [
                            "#35a776", "#79e0b3", "#e54150", "#ea969e"
                        ]
                    }
                }
            }
        },

        draw(ctx) {
            const layout = this.$props.layout

            // HISTOGRAM

            const base = layout.$2screen(0) + 0.5

            ctx.beginPath()
            
            for (var i = 0; i < this.$props.data.length; i++) {
                let p = this.$props.data[i]
                let prev = this.$props.data[i - 1] || []
                
                let mid = layout.t2screen(p[0]) + 1 
                let x1 = Math.floor(mid - layout.px_step * 0.5)
                let x2 = Math.floor(mid + layout.px_step * 0.5) - 0.5
                
                let y = layout.$2screen(p[1]) - 0.5

                ctx.strokeStyle = this.hist_colors[histColor(p, prev)]
                ctx.lineWidth = x2 - x1
                ctx.beginPath()
                ctx.moveTo(mid, base)
                ctx.lineTo(mid, y)
                ctx.stroke()
            }

            // MACD LINE

            ctx.beginPath()

            ctx.lineWidth = this.macd_width
            ctx.strokeStyle = this.macd_color

            for (var p of this.$props.data) {
                let x = layout.t2screen(p[0])
                let y = layout.$2screen(p[2])
                ctx.lineTo(x, y)
            }

            ctx.stroke()

            // SIGNAL LINE

            ctx.beginPath()

            ctx.lineWidth = this.signal_width
            ctx.strokeStyle = this.signal_color

            for (var q of this.$props.data) {
                let x = layout.t2screen(q[0])
                let y = layout.$2screen(q[3])
                ctx.lineTo(x, y)
            }

            ctx.stroke()


        },
        use_for() { return ['MACD'] },
        legend(values) {
            let xs = values.slice(1,4).map(x => {
                return x.toFixed(Math.abs(x) > 0.001 ? 4 : 8)
            })
            return [
                {value: xs[0], color: this.hist_colors[values[1] > 0 ? 0 : 2]},
                {value: xs[1], color: this.macd_color},
                {value: xs[2], color: this.signal_color}
            ]
        },
        calc() {
            return {
                props: {
                    fast: { def: 12, text: 'Fast Length' },
                    slow: { def: 26, text: 'Slow Length' },
                    smooth: { def: 9, text: 'Signal EMA' }
                },
                update: `
                    let [macd, signal, hist] =
                        macd(close, fast, slow, smooth)

                    if (hist[0] >= 0) {
                         var color = 0
                         if (hist[0] < hist[1]) color = 1
                    } else {
                        color = 2
                        if (hist[0] > hist[1]) color = 3
                    }

                    return [hist[0], macd[0], signal[0], color]
                `
            }
        }
    },
    // Define internal setting & constants here
    computed: {
        sett() {
            return this.$props.settings
        },
        hist_width() {
            return this.sett.histWidth || 4
        },
        macd_width() {
            return this.sett.macdWidth || 1
        },
        signal_width() {
            return this.sett.signalWidth || 1
        },
        color() {
            return this.sett.defColor || "#42b28a"
        },
        macd_color() {
            return this.sett.macdColor || "#3782f2"
        },
        signal_color() {
            return this.sett.signalColor || "#f48709"
        },
        hist_colors() {
            return this.sett.histColors || [
                "#35a776", "#79e0b3", "#e54150", "#ea969e"
            ]
        }
    }
}
</script>
