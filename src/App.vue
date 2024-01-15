<template>
  <div>
      <loading
          :active.sync="loading.length > 0"
          :is-full-page="true"
      ></loading>
      <trading-vue
          ref="tradingVue"
          :width="width"
          :height="height"
          :titleTxt="title[ticker]"
          :data="this[ticker]"
          colorCandleUp="#f6f6f6"
          colorWickUp="#f6f6f6"
          colorVolUp="#f6f6f6"
          colorCandleDw="#808080"
          colorWickDw="#808080"
          colorVolDw="#808080"
          :overlays="overlays"
      ></trading-vue>
      <span class="ticker-select">
          <label>Trading Vue</label>
          <select v-model="ticker">
              <option>gold</option>
              <option>silver</option>
              <option>ratio</option>
          </select>
      </span>
  </div>
</template>

<script>
import Loading from "vue-loading-overlay";
import { TradingVue } from "trading-vue-js";
import Overlays from 'tvjs-overlays';
import Indicators from "./mixins/indicators"
import Ratio from "./mixins/ratio"
import Signals from "./mixins/signals"
import MACD from "./overlays/MACD.vue";

import "vue-loading-overlay/dist/vue-loading.css";
  
export default {
  mixins: [
      Indicators,
      Ratio,
      Signals,
  ],
  components: {
      Loading,
      TradingVue
  },
  data: () => ({
      ticker: "ratio",
      title: {
          gold: "SGOL",
          silver: "SIVR",
          ratio: "SGOL / SIVR",
      },
      width: 0,
      height: 0,
      overlays: [
          Overlays['Markers'],
          MACD, 
      ],
  }),
  computed: {
      gold() {
          const self = this;
          return {
              ohlcv: self.gold_ohlcv,
              onchart: self.gold_onchart,
              offchart: self.gold_offchart,
          }
      },
      silver() {
          const self = this;
          return {
              ohlcv: self.silver_ohlcv,
              onchart: self.silver_onchart,
              offchart: self.silver_offchart,
          }
      },
  },
  mounted() {
      this.onResize();
      window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
       window.removeEventListener('resize', this.onResize);
  },
  methods: {
      onResize() {
          this.width = window.innerWidth;
          this.height = window.innerHeight;
      },
  },
}
</script>

<style>
html,
body {
  background-color: #000;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.ticker-select {
  position: absolute;
  top: 10px;
  right: 80px;
  color: #888;
  font: 11px -apple-system,BlinkMacSystemFont,
      Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,
      Fira Sans,Droid Sans,Helvetica Neue,
      sans-serif
}

.ticker-select label {
  margin: 1rem;
}
</style>