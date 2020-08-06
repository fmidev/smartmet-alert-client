export default {
  computed: {
    rotation() {
      return Number.isFinite(this.input.direction) ? Math.round((this.input.direction + 360) % 360) : 0;
    },
    severity() {
      if (this.input.severity < 2 || this.input.severity > 4) {
        return null;
      }
      return this.input.severity;
    },
  },
};
